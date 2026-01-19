const { prisma } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const { runTestCases, calculatePoints } = require('../services/codeExecutionService');
const templateBuilder = require('../services/templateBuilder');

// Get all questions for testing
exports.getTestingQuestions = async (req, res, next) => {
    try {
        const questions = await prisma.question.findMany({
            select: {
                id: true,
                title: true,
                difficulty: true,
                points: true,
            },
            orderBy: {
                difficulty: 'asc',
            },
        });

        return successResponse(res, {
            questions,
        });
    } catch (error) {
        console.error('getTestingQuestions error:', error);
        next(error);
    }
};

// Get question details for testing
exports.getTestingQuestionDetails = async (req, res, next) => {
    try {
        const { questionId } = req.params;

        const question = await prisma.question.findUnique({
            where: { id: questionId },
            include: {
                hints: {
                    orderBy: { order: 'asc' }
                },
                constraints: {
                    orderBy: { order: 'asc' }
                },
                testCases: {
                    where: { isSample: true },
                    orderBy: { order: 'asc' }
                },
            },
        });

        if (!question) {
            return errorResponse(res, 'Question not found', 404);
        }

        return successResponse(res, {
            id: question.id,
            title: question.title,
            description: question.description,
            difficulty: question.difficulty,
            points: question.points,
            sampleInput: question.sampleInput,
            sampleOutput: question.sampleOutput,
            hints: (question.hints || []).map(h => h.content),
            constraints: (question.constraints || []).map(c => c.content),
            testCases: (question.testCases || []).map(tc => ({
                input: tc.input,
                output: tc.output,
                explanation: tc.explanation
            })),
        });
    } catch (error) {
        console.error('getTestingQuestionDetails error:', error);
        next(error);
    }
};

// Run code for testing (sample test cases only)
exports.runTestingCode = async (req, res, next) => {
    try {
        const { questionId } = req.params;
        const { code, language } = req.body;

        // Verify question exists and fetch sample test cases
        const question = await prisma.question.findUnique({
            where: { id: questionId },
            include: {
                testCases: {
                    where: { isSample: true },
                    orderBy: { order: 'asc' }
                }
            }
        });

        if (!question) {
            return errorResponse(res, 'Question not found', 404);
        }

        // If no sample test cases, return error
        if (!question.testCases || question.testCases.length === 0) {
            return errorResponse(res, 'No sample test cases available for this question', 400);
        }

        // Build executable code using TemplateBuilder
        const executableCode = await templateBuilder.buildExecutableCode(questionId, code, language);

        // Run test cases
        const testResults = await runTestCases(executableCode, language, question.testCases);

        // Check if first test case has compilation error
        if (testResults.results.length > 0 && testResults.results[0].error) {
            const firstResult = testResults.results[0];

            // If it's a compilation error, return detailed error info
            if (firstResult.status === 'COMPILATION_ERROR' || firstResult.status === 'CompilationError' || (typeof firstResult.error === 'string' && firstResult.error.includes('Compilation failed'))) {
                return successResponse(res, {
                    verdict: 'COMPILATION_ERROR',
                    testsPassed: 0,
                    totalTests: testResults.totalTests,
                    executionTime: 0,
                    memory: 0,
                    results: [{
                        testCaseId: firstResult.testCaseId,
                        status: 'COMPILATION_ERROR',
                        input: firstResult.input,
                        expectedOutput: firstResult.expectedOutput,
                        actualOutput: '',
                        executionTime: 0,
                        memory: 0,
                        error: firstResult.error
                    }]
                });
            }
        }

        return successResponse(res, {
            verdict: testResults.allPassed ? 'ACCEPTED' : 'FAILED',
            testsPassed: testResults.testsPassed,
            totalTests: testResults.totalTests,
            executionTime: testResults.totalExecutionTime,
            memory: testResults.maxMemory,
            results: testResults.results.map(r => ({
                testCaseId: r.testCaseId,
                status: r.passed ? 'PASSED' : 'FAILED',
                input: r.input,
                expectedOutput: r.expectedOutput,
                actualOutput: r.actualOutput,
                executionTime: r.executionTime,
                memory: r.memory,
                error: r.error,
                parsedError: r.parsedError
            }))
        });
    } catch (error) {
        console.error('runTestingCode error:', error);

        // If it's a compilation error, return more details
        if (error.message && error.message.includes('Compilation failed')) {
            return successResponse(res, {
                verdict: 'COMPILATION_ERROR',
                testsPassed: 0,
                totalTests: 0,
                executionTime: 0,
                memory: 0,
                results: [{
                    status: 'COMPILATION_ERROR',
                    error: error.message || 'Compilation failed'
                }]
            });
        }

        return errorResponse(res, error.message, 400);
    }
};

// Submit code for testing (all test cases)
exports.submitTestingCode = async (req, res, next) => {
    try {
        const { questionId } = req.params;
        const { code, language } = req.body;

        // Verify question exists and fetch all test cases
        const question = await prisma.question.findUnique({
            where: { id: questionId },
            include: {
                testCases: {
                    orderBy: { order: 'asc' }
                }
            }
        });

        if (!question) {
            return errorResponse(res, 'Question not found', 404);
        }

        // Build executable code using TemplateBuilder
        const executableCode = await templateBuilder.buildExecutableCode(questionId, code, language);

        // Run all test cases
        const testResults = await runTestCases(executableCode, language, question.testCases);

        // Determine submission verdict
        let submissionVerdict = 'ACCEPTED';
        if (!testResults.allPassed) {
            const firstFailure = testResults.results.find((r) => !r.passed);
            if (firstFailure.status === 'TIME_LIMIT_EXCEEDED') {
                submissionVerdict = 'TIME_LIMIT_EXCEEDED';
            } else if (firstFailure.status === 'RUNTIME_ERROR') {
                submissionVerdict = 'RUNTIME_ERROR';
            } else if (firstFailure.status === 'COMPILATION_ERROR') {
                submissionVerdict = 'COMPILATION_ERROR';
            } else {
                submissionVerdict = 'WRONG_ANSWER';
            }
        }

        // Calculate points
        const totalTestCases = question.testCases.length;
        const points = submissionVerdict === 'ACCEPTED'
            ? calculatePoints(
                question.points,
                testResults.totalExecutionTime,
                question.timeLimit * totalTestCases,
                testResults.testsPassed,
                testResults.totalTests
            )
            : 0;

        // Create submission record (optional - for tracking)
        const submission = await prisma.submission.create({
            data: {
                questionId,
                userId: req.user.id,
                teamId: 'testing', // Special teamId for testing submissions
                code,
                language,
                mode: 'SUBMIT',
                verdict: submissionVerdict,
                testsPassed: testResults.testsPassed,
                totalTests: testResults.totalTests,
                points,
                executionTime: testResults.totalExecutionTime,
                memory: testResults.maxMemory,
                error: testResults.results.find((r) => !r.passed)?.error || null,
                submittedAt: new Date(),
                completedAt: new Date(),
            },
        });

        return successResponse(res, {
            submissionId: submission.id,
            verdict: submissionVerdict,
            testsPassed: testResults.testsPassed,
            totalTests: testResults.totalTests,
            points,
            executionTime: testResults.totalExecutionTime,
            memory: testResults.maxMemory,
            results: testResults.results.map(r => ({
                status: r.passed ? 'PASSED' : 'FAILED',
                input: r.input,
                expectedOutput: r.expectedOutput,
                actualOutput: r.actualOutput,
                executionTime: r.executionTime,
                memory: r.memory,
                error: r.error,
                parsedError: r.parsedError,
                isHidden: r.isHidden
            }))
        });
    } catch (error) {
        console.error('submitTestingCode error:', error);
        return errorResponse(res, error.message, 400);
    }
};

module.exports = exports;
