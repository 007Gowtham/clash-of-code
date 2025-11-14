import { prisma } from "../../../db/index.js";
import { ApiError } from "../../../utils/ApiError.js";

/**
 * Question Model Functions
 * ----------------------
 * Database operations for question management
 */

/**
 * Get Question Statistics
 * ---------------------
 * Retrieves comprehensive statistics for a question
 * 
 * @param {number} questionId - Question ID
 * @returns {Promise<Object>} Question statistics
 */
export const getQuestionStatistics = async (questionId) => {
    const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: {
            _count: {
                select: {
                    submissions: true,
                    testCases: true,
                    examples: true
                }
            }
        }
    });

    if (!question) {
        throw new ApiError(404, 'Question not found');
    }

    // Get submission statistics
    const totalSubmissions = question._count.submissions;
    
    const acceptedSubmissions = await prisma.submission.count({
        where: {
            questionId,
            status: 'ACCEPTED'
        }
    });

    const uniqueTeamsSolved = await prisma.submission.findMany({
        where: {
            questionId,
            status: 'ACCEPTED'
        },
        distinct: ['teamId'],
        select: {
            teamId: true
        }
    });

    const acceptanceRate = totalSubmissions > 0 
        ? ((acceptedSubmissions / totalSubmissions) * 100).toFixed(2)
        : 0;

    return {
        totalSubmissions,
        acceptedSubmissions,
        acceptanceRate: parseFloat(acceptanceRate),
        totalTestCases: question._count.testCases,
        totalExamples: question._count.examples,
        uniqueTeamsSolved: uniqueTeamsSolved.length,
        difficulty: question.difficulty,
        points: question.points
    };
};

/**
 * Validate Test Cases
 * -----------------
 * Validates test case data format
 * 
 * @param {Array} testCases - Array of test case objects
 * @returns {boolean} True if valid
 * @throws {ApiError} If validation fails
 */
export const validateTestCases = (testCases) => {
    if (!Array.isArray(testCases)) {
        throw new ApiError(400, 'Test cases must be an array');
    }

    if (testCases.length === 0) {
        throw new ApiError(400, 'At least one test case is required');
    }

    for (const testCase of testCases) {
        if (!testCase.input || !testCase.expectedOutput) {
            throw new ApiError(400, 'Each test case must have input and expectedOutput');
        }
    }

    return true;
};

/**
 * Validate Examples
 * ---------------
 * Validates example data format
 * 
 * @param {Array} examples - Array of example objects
 * @returns {boolean} True if valid
 * @throws {ApiError} If validation fails
 */
export const validateExamples = (examples) => {
    if (!Array.isArray(examples)) {
        throw new ApiError(400, 'Examples must be an array');
    }

    for (const example of examples) {
        if (!example.input || !example.output) {
            throw new ApiError(400, 'Each example must have input and output');
        }
    }

    return true;
};

/**
 * Calculate Question Points
 * -----------------------
 * Calculates points based on difficulty and test cases
 * 
 * @param {string} difficulty - Question difficulty
 * @param {number} testCaseCount - Number of test cases
 * @returns {number} Calculated points
 */
export const calculateQuestionPoints = (difficulty, testCaseCount) => {
    const basePoints = {
        EASY: 10,
        MEDIUM: 20,
        HARD: 30
    };

    const base = basePoints[difficulty] || 10;
    const testCaseBonus = Math.floor(testCaseCount / 5) * 5; // 5 points per 5 test cases
    
    return base + testCaseBonus;
};

/**
 * Get Questions By Difficulty
 * --------------------------
 * Retrieves questions filtered by difficulty
 * 
 * @param {string} roomId - Room ID
 * @param {string} difficulty - Difficulty level
 * @returns {Promise<Array>} Questions array
 */
export const getQuestionsByDifficulty = async (roomId, difficulty) => {
    return await prisma.question.findMany({
        where: {
            roomId,
            difficulty
        },
        include: {
            _count: {
                select: {
                    testCases: true,
                    examples: true
                }
            }
        },
        orderBy: {
            createdAt: 'desc'
        }
    });
};

/**
 * Get Question With Details
 * -----------------------
 * Retrieves question with all related data
 * 
 * @param {number} questionId - Question ID
 * @param {boolean} includeHidden - Include hidden test cases
 * @returns {Promise<Object>} Question with details
 */
export const getQuestionWithDetails = async (questionId, includeHidden = false) => {
    const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: {
            room: {
                select: {
                    id: true,
                    name: true,
                    status: true
                }
            },
            testCases: {
                where: includeHidden ? {} : { isHidden: false }
            },
            examples: {
                orderBy: {
                    orderIndex: 'asc'
                }
            },
            _count: {
                select: {
                    submissions: true
                }
            }
        }
    });

    if (!question) {
        throw new ApiError(404, 'Question not found');
    }

    return question;
};

/**
 * Duplicate Question Check
 * ----------------------
 * Checks if question title already exists in room
 * 
 * @param {string} title - Question title
 * @param {string} roomId - Room ID
 * @param {number} excludeId - Question ID to exclude (for updates)
 * @returns {Promise<boolean>} True if duplicate exists
 */
export const isDuplicateQuestion = async (title, roomId, excludeId = null) => {
    const whereClause = {
        title,
        roomId
    };

    if (excludeId) {
        whereClause.id = { not: excludeId };
    }

    const existing = await prisma.question.findFirst({
        where: whereClause
    });

    return !!existing;
};

/**
 * Bulk Create Test Cases
 * --------------------
 * Creates multiple test cases for a question
 * 
 * @param {number} questionId - Question ID
 * @param {Array} testCases - Array of test case data
 * @returns {Promise<Array>} Created test cases
 */
export const bulkCreateTestCases = async (questionId, testCases) => {
    const testCaseData = testCases.map((tc, index) => ({
        questionId,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isHidden: tc.isHidden || false,
        points: tc.points || 0
    }));

    return await prisma.testCase.createMany({
        data: testCaseData
    });
};

/**
 * Bulk Create Examples
 * ------------------
 * Creates multiple examples for a question
 * 
 * @param {number} questionId - Question ID
 * @param {Array} examples - Array of example data
 * @returns {Promise<Array>} Created examples
 */
export const bulkCreateExamples = async (questionId, examples) => {
    const exampleData = examples.map((ex, index) => ({
        questionId,
        input: ex.input,
        output: ex.output,
        explanation: ex.explanation || null,
        orderIndex: ex.orderIndex || index
    }));

    return await prisma.example.createMany({
        data: exampleData
    });
};