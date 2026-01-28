const { successResponse, errorResponse } = require('../utils/responseFormatter');
const codeExecutionService = require('../services/codeExecutionService');
const { prisma } = require('../config/database');

// Get specific question by ID
exports.getQuestionById = async (req, res, next) => {
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
                templates: {
                    select: {
                        language: true,
                        headerCode: true,
                        boilerplate: true,
                        definition: true,
                        userFunction: true,
                        mainFunction: true,
                        diagram: true
                    }
                }
            }
        });

        if (!question) {
            return errorResponse(res, 'Question not found', 404);
        }

        // Group templates by language
        const templatesMap = {};
        if (question.templates) {
            question.templates.forEach(t => {
                templatesMap[t.language] = {
                    headerCode: t.headerCode || '',
                    boilerplate: t.boilerplate || '',
                    definition: t.definition || '',
                    userFunction: t.userFunction || '',
                    mainFunction: t.mainFunction || '',
                    diagram: t.diagram || null
                };
            });
        }

        return successResponse(res, {
            id: question.id,
            title: question.title,
            slug: question.slug,
            description: question.description,
            difficulty: question.difficulty,
            points: question.points,
            sampleInput: question.sampleInput,
            sampleOutput: question.sampleOutput,
            functionName: question.functionName,
            functionSignature: question.functionSignature,
            inputType: question.inputType,
            outputType: question.outputType,
            timeLimit: question.timeLimit,
            memoryLimit: question.memoryLimit,
            hints: (question.hints || []).map(h => h.content),
            constraints: (question.constraints || []).map(c => c.content),
            testCases: (question.testCases || []).map(tc => ({
                input: tc.input,
                output: tc.output,
                explanation: tc.explanation
            })),
            templates: templatesMap
        });
    } catch (error) {
        console.error('getQuestionById error:', error);
        next(error);
    }
};

// Run code against sample test cases
exports.runTestingCode = async (req, res, next) => {
    try {
        const { questionId } = req.params;
        const { code, language } = req.body;

        if (!code || !language) {
            return errorResponse(res, 'Code and language are required', 400);
        }

        // Get question with test cases
        const question = await prisma.question.findUnique({
            where: { id: questionId },
            include: {
                testCases: {
                    where: { isSample: true }, // Only sample test cases for run
                    orderBy: { order: 'asc' }
                }
            }
        });

        if (!question) {
            return errorResponse(res, 'Question not found', 404);
        }

        // Execute code using code execution service
        const executionResult = await codeExecutionService.runTestCases(
            code,
            language,
            question.testCases
        );

        // Format response
        const verdict = executionResult.allPassed ? 'ACCEPTED' : 'WRONG_ANSWER';

        return successResponse(res, {
            verdict,
            testsPassed: executionResult.testsPassed,
            totalTests: executionResult.totalTests,
            executionTime: executionResult.totalExecutionTime,
            memory: executionResult.maxMemory,
            results: executionResult.results.map(r => ({
                status: r.passed ? 'PASSED' : 'FAILED',
                input: r.input,
                expectedOutput: r.expectedOutput,
                actualOutput: r.actualOutput,
                error: r.error,
                executionTime: r.executionTime,
                memory: r.memory
            }))
        });
    } catch (error) {
        console.error('runTestingCode error:', error);
        return errorResponse(res, error.message || 'Code execution failed', 500);
    }
};

// Submit code against all test cases
exports.submitTestingCode = async (req, res, next) => {
    try {
        const { questionId } = req.params;
        const { code, language } = req.body;

        if (!code || !language) {
            return errorResponse(res, 'Code and language are required', 400);
        }

        // Get question with ALL test cases
        const question = await prisma.question.findUnique({
            where: { id: questionId },
            include: {
                testCases: {
                    orderBy: { order: 'asc' } // All test cases for submit
                }
            }
        });

        if (!question) {
            return errorResponse(res, 'Question not found', 404);
        }

        // Execute code using code execution service
        const executionResult = await codeExecutionService.runTestCases(
            code,
            language,
            question.testCases
        );

        // Determine verdict
        const verdict = executionResult.allPassed ? 'ACCEPTED' : 'WRONG_ANSWER';

        // Calculate points
        const points = executionResult.allPassed
            ? codeExecutionService.calculatePoints(
                question.points,
                executionResult.totalExecutionTime,
                question.timeLimit,
                executionResult.testsPassed,
                executionResult.totalTests
            )
            : 0;

        // Save submission to database
        await prisma.submission.create({
            data: {
                questionId: question.id,
                userId: req.user.id,
                teamId: 'testing', // Special teamId for testing submissions
                code,
                language,
                mode: 'SUBMIT',
                verdict,
                testsPassed: executionResult.testsPassed,
                totalTests: executionResult.totalTests,
                points,
                executionTime: executionResult.totalExecutionTime,
                memory: executionResult.maxMemory,
                completedAt: new Date()
            }
        });

        return successResponse(res, {
            verdict,
            testsPassed: executionResult.testsPassed,
            totalTests: executionResult.totalTests,
            points,
            executionTime: executionResult.totalExecutionTime,
            memory: executionResult.maxMemory,
            results: executionResult.results.map(r => ({
                status: r.passed ? 'PASSED' : 'FAILED',
                input: r.input,
                expectedOutput: r.expectedOutput,
                actualOutput: r.actualOutput,
                error: r.error,
                executionTime: r.executionTime,
                memory: r.memory
            }))
        });
    } catch (error) {
        console.error('submitTestingCode error:', error);
        return errorResponse(res, error.message || 'Code execution failed', 500);
    }
};

// ==================== USER FUNCTION SUBMISSION ENDPOINTS ====================

// Using simplified code template service instead of complex wrapper generation
const codeTemplateService = require('../services/codeTemplateService');

/**
 * Run user function code against sample test cases
 * POST /api/submission/run-function/:questionId
 * Body: { userFunctionCode, language }
 */
exports.runUserFunction = async (req, res, next) => {
    try {
        const { questionId } = req.params;
        const { userFunctionCode, language } = req.body;

        console.log(questionId);
        console.log(userFunctionCode);
        console.log(language);

        if (!userFunctionCode || !language) {
            return errorResponse(res, 'userFunctionCode and language are required', 400);
        }

        // Validate language
        const supportedLanguages = ['cpp', 'python', 'javascript', 'java'];
        if (!supportedLanguages.includes(language)) {
            return errorResponse(res, `Unsupported language: ${language}. Supported: ${supportedLanguages.join(', ')}`, 400);
        }

        // Get question with sample test cases
        const question = await prisma.question.findUnique({
            where: { id: questionId },
            include: {
                testCases: {
                    where: { isSample: true }, // Only sample test cases for run
                    orderBy: { order: 'asc' }
                }
            }
        });


        if (!question) {
            return errorResponse(res, 'Question not found', 404);
        }

        console.log(question);

        // Generate complete executable code by combining user function with wrapper
        const executableCode = await codeTemplateService.generateExecutableCode(
            questionId,
            language,
            userFunctionCode
        );

        // DEBUG: Log the generated code
        console.log('=== GENERATED CODE (first 500 chars) ===');
        console.log(executableCode.substring(0, 500));
        console.log('=== CODE LINES 148-156 ===');
        const lines = executableCode.split('\n');
        for (let i = 147; i < 156 && i < lines.length; i++) {
            console.log(`${i + 1}: ${lines[i]}`);
        }
        console.log('=== END DEBUG ===');

        // Execute code using code execution service
        const executionResult = await codeExecutionService.runTestCases(
            executableCode,
            language,
            question.testCases
        );

        // Format response
        const verdict = executionResult.allPassed ? 'ACCEPTED' : 'WRONG_ANSWER';

        return successResponse(res, {
            verdict,
            testsPassed: executionResult.testsPassed,
            totalTests: executionResult.totalTests,
            executionTime: executionResult.totalExecutionTime,
            memory: executionResult.maxMemory,
            results: executionResult.results.map(r => ({
                status: r.passed ? 'PASSED' : 'FAILED',
                input: r.input,
                expectedOutput: r.expectedOutput,
                actualOutput: r.actualOutput,
                error: r.error,
                executionTime: r.executionTime,
                memory: r.memory
            }))
        });


    } catch (error) {
        console.error('runUserFunction error:', error);
        return errorResponse(res, error.message || 'Code execution failed', 500);
    }
};

/**
 * Submit user function code against all test cases
 * POST /api/submission/submit-function/:questionId
 * Body: { userFunctionCode, language }
 */
exports.submitUserFunction = async (req, res, next) => {
    try {
        const { questionId } = req.params;
        const { userFunctionCode, language } = req.body;

        if (!userFunctionCode || !language) {
            return errorResponse(res, 'userFunctionCode and language are required', 400);
        }

        // Validate language
        const supportedLanguages = ['cpp', 'python', 'javascript', 'java'];
        if (!supportedLanguages.includes(language)) {
            return errorResponse(res, `Unsupported language: ${language}. Supported: ${supportedLanguages.join(', ')}`, 400);
        }

        // Get question with ALL test cases
        const question = await prisma.question.findUnique({
            where: { id: questionId },
            include: {
                testCases: {
                    orderBy: { order: 'asc' } // All test cases for submit
                }
            }
        });

        if (!question) {
            return errorResponse(res, 'Question not found', 404);
        }

        // Generate complete executable code by combining user function with wrapper
        const executableCode = await codeTemplateService.generateExecutableCode(
            questionId,
            language,
            userFunctionCode
        );

        // Execute code using code execution service
        const executionResult = await codeExecutionService.runTestCases(
            executableCode,
            language,
            question.testCases
        );

        // Determine verdict
        const verdict = executionResult.allPassed ? 'ACCEPTED' : 'WRONG_ANSWER';

        // Calculate points
        const points = executionResult.allPassed
            ? codeExecutionService.calculatePoints(
                question.points,
                executionResult.totalExecutionTime,
                question.timeLimit,
                executionResult.testsPassed,
                executionResult.totalTests
            )
            : 0;

        // Save submission to database
        await prisma.submission.create({
            data: {
                questionId: question.id,
                userId: req.user ? req.user.id : 'TEST_USER_ID',
                teamId: 'testing', // Special teamId for testing submissions
                code: executableCode, // Store the complete executable code
                language,
                mode: 'SUBMIT',
                verdict,
                testsPassed: executionResult.testsPassed,
                totalTests: executionResult.totalTests,
                points,
                executionTime: executionResult.totalExecutionTime,
                memory: executionResult.maxMemory,
                completedAt: new Date()
            }
        });

        return successResponse(res, {
            verdict,
            testsPassed: executionResult.testsPassed,
            totalTests: executionResult.totalTests,
            points,
            executionTime: executionResult.totalExecutionTime,
            memory: executionResult.maxMemory,
            results: executionResult.results.map(r => ({
                status: r.passed ? 'PASSED' : 'FAILED',
                input: r.input,
                expectedOutput: r.expectedOutput,
                actualOutput: r.actualOutput,
                error: r.error,
                executionTime: r.executionTime,
                memory: r.memory
            }))
        });
    } catch (error) {
        console.error('submitUserFunction error:', error);
        return errorResponse(res, error.message || 'Code execution failed', 500);
    }
};

module.exports = exports;
