import { prisma } from "../../db/index.js";
import logger from "../../logger/winston.logger.js";
import { ApiError } from "../../utils/ApiError.js";
import fetch from "node-fetch";

const JUDGE0_URL = process.env.JUDGE0_URL || "https://ce.judge0.com";

// Language ID mapping with versions (Judge0)
function getLanguageCode(language) {
  const LANGUAGE_MAP = {
    cpp: {
      "clang-7.0.1": 76,
      "gcc-7.4.0": 52,
      "gcc-8.3.0": 53,
      "gcc-9.2.0": 54,
    },
    java: {
      "openjdk-13.0.1": 62,
    },
    python: {
      "2.7.17": 70,
      "3.8.1": 71,
    },
    javascript: {
      "nodejs-12.14.0": 63,
    },
  };

  const languageName = language.name;
  const languageVersion = language.version;

  if (!LANGUAGE_MAP[languageName]) {
    throw new ApiError(400, `Language '${languageName}' not supported`);
  }

  if (!LANGUAGE_MAP[languageName][languageVersion]) {
    throw new ApiError(
      400,
      `Version '${languageVersion}' not found for language '${languageName}'`
    );
  }

  return LANGUAGE_MAP[languageName][languageVersion];
}

const submissionCode = async (code, language, question) => {
  logger.info(`Starting code submission for question ID: ${question.id}`);

  // First, verify Judge0 is accessible
  try {
    const healthCheck = await fetch(`${JUDGE0_URL}/about`);

    if (!healthCheck.ok) {
      logger.error(`Judge0 health check failed: ${healthCheck.status}`);
      throw new ApiError(503, "Judge0 service is unavailable");
    }

    const aboutData = await healthCheck.json();
    logger.info(`Judge0 instance: ${aboutData.version || 'unknown version'}`);

  } catch (error) {

    logger.error(`Cannot connect to Judge0: ${error.message}`);
    throw new ApiError(503, `Judge0 connection failed: ${error.message}`);

  }

  // Fetch question with test cases
  const questionTestcases = await prisma.question.findFirst({
    where: {
      id: question.id,
    },
    include: {
      testCases: {
        select: {
          input: true,
          expectedOutput: true,
          isHidden: true,
          points: true,
        },
      },
    },
  });

  if (!questionTestcases) {
    logger.error(`Question with ID ${question.id} not found`);
    throw new ApiError(404, "Test cases not found for the given question");
  }

  if (!questionTestcases.testCases || questionTestcases.testCases.length === 0) {
    logger.error(`No test cases found for question ID: ${question.id}`);
    throw new ApiError(400, "No test cases available for this question");
  }

  logger.info(`Found ${questionTestcases.testCases.length} test cases`);

  // Get language ID
  const languageId = getLanguageCode(language);
  const timeLimit = questionTestcases.timeLimit || 3; // default 3 seconds
  const memoryLimit = questionTestcases.memoryLimit || 512000; // default 512 MB

  logger.info(`Using language ID: ${languageId}, Time limit: ${timeLimit}s, Memory limit: ${memoryLimit}KB`);

  // Verify language is supported
  try {
    const languagesRes = await fetch(`${JUDGE0_URL}/languages/${languageId}`);

    if (!languagesRes.ok) {
      logger.error(`Language ID ${languageId} not found in Judge0`);
      throw new ApiError(400, `Language ID ${languageId} is not supported by this Judge0 instance`);
    }

    const langData = await languagesRes.json();
    logger.info(`Verified language: ${langData.name}`);

    
  } catch (error) {
    if (error instanceof ApiError) throw error;
    logger.warn(`Could not verify language: ${error.message}`);
  }

  // Process test cases and submit to Judge0
  const results = [];
  let totalPoints = 0;
  let earnedPoints = 0;
  let hasCompilationError = false;

  for (let i = 0; i < questionTestcases.testCases.length; i++) {
    const testCase = questionTestcases.testCases[i];

    logger.info(`Running test case ${i + 1}/${questionTestcases.testCases.length}...`);

    try {
      // Encode source code and stdin to base64 to avoid JSON issues
      const sourceCodeBase64 = Buffer.from(code).toString('base64');
      const stdinBase64 = Buffer.from(testCase.input).toString('base64');
      const expectedOutputBase64 = Buffer.from(testCase.expectedOutput).toString('base64');

      const payload = {
        source_code: sourceCodeBase64,
        language_id: languageId,
        stdin: stdinBase64,
        expected_output: expectedOutputBase64,
        cpu_time_limit: 3,
        memory_limit: 51200,
        base64_encoded: true,
      };

      logger.debug(`Submitting test case ${i + 1} with payload:`, JSON.stringify(payload, null, 2));

      // Submit to Judge0
      const res = await fetch(`${JUDGE0_URL}/submissions?base64_encoded=true&wait=true`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errorText = await res.text();
        logger.error(`Judge0 API error (${res.status}): ${errorText}`);
        
        // Try to parse error details
        let errorDetails = errorText;
        try {
          const errorJson = JSON.parse(errorText);
          errorDetails = JSON.stringify(errorJson, null, 2);
        } catch (e) {
          // Keep as text if not JSON
        }
        
        throw new ApiError(502, `Judge0 API error: ${res.status} - ${errorDetails}`);
      }

      const result = await res.json();
      logger.info(`Test case ${i + 1} completed with status: ${result.status?.description} (ID: ${result.status?.id})`);

      // Decode base64 outputs
      const actualOutput = result.stdout 
        ? Buffer.from(result.stdout, 'base64').toString('utf-8')
        : '';
      const stderr = result.stderr 
        ? Buffer.from(result.stderr, 'base64').toString('utf-8')
        : null;
      const compileOutput = result.compile_output 
        ? Buffer.from(result.compile_output, 'base64').toString('utf-8')
        : null;

      // Judge0 Status IDs:
      // 3 = Accepted
      // 4 = Wrong Answer
      // 5 = Time Limit Exceeded
      // 6 = Compilation Error
      // 7 = Runtime Error (SIGSEGV)
      // 8 = Runtime Error (SIGXFSZ)
      // 9 = Runtime Error (SIGFPE)
      // 10 = Runtime Error (SIGABRT)
      // 11 = Runtime Error (NZEC)
      // 12 = Runtime Error (Other)
      // 13 = Internal Error
      // 14 = Exec Format Error

      const isPassed = result.status?.id === 3;

      totalPoints += testCase.points;
      if (isPassed) {
        earnedPoints += testCase.points;
      }

      results.push({
        testCaseNumber: i + 1,
        input: testCase.isHidden ? "[Hidden]" : testCase.input,
        expectedOutput: testCase.isHidden ? "[Hidden]" : testCase.expectedOutput,
        actualOutput,
        status: result.status?.description || "Unknown",
        statusId: result.status?.id,
        passed: isPassed,
        time: result.time,
        memory: result.memory,
        points: testCase.points,
        earnedPoints: isPassed ? testCase.points : 0,
        stderr,
        compileOutput,
        isHidden: testCase.isHidden,
      });

      logger.info(
        isPassed
          ? `✅ Test case ${i + 1} PASSED - Time: ${result.time}s, Memory: ${result.memory}KB`
          : `❌ Test case ${i + 1} FAILED - Status: ${result.status?.description}`
      );

      // If compilation error, stop further execution
      if (result.status?.id === 6) {
        hasCompilationError = true;
        logger.error("Compilation error detected. Stopping execution.");
        break;
      }

      // If runtime error on non-hidden test case, continue but log
      if (result.status?.id >= 7 && result.status?.id <= 12) {
        logger.warn(`Runtime error on test case ${i + 1}: ${result.status?.description}`);
      }
    } catch (error) {
      logger.error(`Error running test case ${i + 1}: ${error.message}`);

      results.push({
        testCaseNumber: i + 1,
        input: testCase.isHidden ? "[Hidden]" : testCase.input,
        expectedOutput: testCase.isHidden ? "[Hidden]" : testCase.expectedOutput,
        actualOutput: null,
        status: "Error",
        statusId: null,
        passed: false,
        time: null,
        memory: null,
        points: testCase.points,
        earnedPoints: 0,
        stderr: error.message,
        compileOutput: null,
        isHidden: testCase.isHidden,
      });

      totalPoints += testCase.points;
    }
  }

  // Calculate overall statistics
  const passedCount = results.filter((r) => r.passed).length;
  const totalCount = questionTestcases.testCases.length;
  const accuracy = totalCount > 0 ? (passedCount / totalCount) * 100 : 0;

  const summary = {
    questionId: question.id,
    language: {
      name: language.name,
      version: language.version,
      languageId,
    },
    totalTestCases: totalCount,
    passedTestCases: passedCount,
    failedTestCases: totalCount - passedCount,
    accuracy: parseFloat(accuracy.toFixed(2)),
    totalPoints,
    earnedPoints,
    scorePercentage: totalPoints > 0 ? parseFloat(((earnedPoints / totalPoints) * 100).toFixed(2)) : 0,
    allPassed: passedCount === totalCount,
    hasCompilationError,
    results,
  };

  logger.info("=".repeat(50));
  logger.info("SUBMISSION SUMMARY");
  logger.info("=".repeat(50));
  logger.info(`Passed: ${passedCount}/${totalCount}`);
  logger.info(`Accuracy: ${summary.accuracy}%`);
  logger.info(`Score: ${earnedPoints}/${totalPoints} (${summary.scorePercentage}%)`);
  logger.info(`All Passed: ${summary.allPassed}`);
  logger.info("=".repeat(50));

  return summary;
};

export { submissionCode };