/**
 * Code Execution Service
 * Integrates with enhanced Judge0Client for code execution
 */

const Judge0Service = require('./judge0Service');
// const calculatePoints = require('./calculatePoints'); // Removed as it is defined in this file
const ErrorParser = require('./errorParser');
const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

// Initialize Judge0 service
const judge0 = new Judge0Service();

/**
 * Run code against multiple test cases
 * @param {string} code - Source code
 * @param {string} language - Programming language
 * @param {Array} testCases - Array of test case objects
 * @returns {Promise<Object>} Test results
 */
exports.runTestCases = async (code, language, testCases) => {
    const correlationId = uuidv4();

    try {
        logger.info('Running test cases', {
            correlationId,
            language,
            totalTestCases: testCases.length
        });

        const results = [];
        let testsPassed = 0;
        let totalExecutionTime = 0;
        let maxMemory = 0;

        // Execute each test case sequentially
        // Note: Batch execution is supported by Judge0 CE but here we iterate to use our specific logic per case if needed
        // Or we can implement batch in Judge0Service. Let's iterate for now to ensure granular control.

        for (const testCase of testCases) {
            const input = testCase.input;
            const expectedOutput = testCase.output;

            const result = await judge0.execute(code, language, input, expectedOutput);

            // Check correctness
            // Judge0 usually returns ACCEPTED if stdout matches expected_output when provided.
            // But we might want to do strict trimming comparison ourselves if Judge0 is lenient or strict.
            // Let's rely on Judge0's verdict mostly, but allow for verify.

            // If Judge0 returns ACCEPTED, it means it matched.
            // If it returns WRONG_ANSWER, it failed.

            const isSuccess = result.verdict === 'ACCEPTED';

            if (isSuccess) testsPassed++;
            if (result.time) totalExecutionTime += parseFloat(result.time);
            if (result.memory && result.memory > maxMemory) maxMemory = result.memory;

            results.push({
                testCaseId: testCase.id,
                input: input,
                expectedOutput: expectedOutput,
                actualOutput: result.output,
                passed: isSuccess,
                status: result.status.description || result.verdict, // e.g. Accepted
                error: result.error,
                executionTime: parseFloat(result.time || 0),
                memory: result.memory,
                isHidden: testCase.isHidden,
                isSample: testCase.isSample || false
            });
        }

        const allPassed = testsPassed === testCases.length;

        logger.info('Test cases completed', {
            correlationId,
            testsPassed,
            totalTests: testCases.length,
            allPassed
        });

        return {
            results,
            testsPassed,
            totalTests: testCases.length,
            allPassed,
            totalExecutionTime,
            maxMemory
        };
    } catch (error) {
        logger.error('Test cases execution failed', {
            correlationId,
            error: error.message
        });
        throw error;
    }
};

/**
 * Calculate points based on performance
 * @param {number} basePoints - Base points for the question
 * @param {number} executionTime - Total execution time
 * @param {number} timeLimit - Time limit
 * @param {number} testsPassed - Number of tests passed
 * @param {number} totalTests - Total number of tests
 * @returns {number} Calculated points
 */
exports.calculatePoints = (basePoints, executionTime, timeLimit, testsPassed, totalTests) => {
    if (testsPassed !== totalTests) {
        const passedRatio = testsPassed / totalTests;
        // Partial points? Usually competitive programming is 0 unless accepted.
        // But user might want partial. Let's return 0 for now as per reliable judging.
        return 0; // No points for partial solutions
    }

    // Base points for correct solution
    let points = basePoints;

    // Bonus for fast execution (Time limit is usually per case, but here we sum? Or max?)
    // If totalExecutionTime is significantly lower than (timeLimit * totalTests), give bonus.

    // Simple bonus logic
    return Math.round(points);
};

module.exports = exports;
