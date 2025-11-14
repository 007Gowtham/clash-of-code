import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { prisma } from "../../../db/index.js";
import { RoomStatus } from "../../../constants.js";
import logger from "../../../logger/winston.logger.js";
import {
    getQuestionStatistics,
    validateTestCases,
    validateExamples,
    calculateQuestionPoints,
    getQuestionWithDetails,
    isDuplicateQuestion,
    bulkCreateTestCases,
    bulkCreateExamples
} from "../../../models/apps/question/question.model.js";

/**
 * Create Question Controller
 * -------------------------
 * Creates a new question with test cases and examples
 */
export const CreateQuestionController = asyncHandler(async (req, res, next) => {
    const {
        roomId,
        title,
        description,
        topic,
        difficulty,
        constraints,
        inputFormat,
        outputFormat,
        timeLimit = 2000,
        memoryLimit = 256,
        points,
        testCases,
        examples = []
    } = req.body;
    const userId = req.user.id;

    logger.info(`User ${userId} attempting to create question: ${title}`);

    // Check if room exists and user is creator
    const room = await prisma.room.findUnique({
        where: { id: roomId }
    });

    if (!room) {
        throw new ApiError(404, 'Room not found');
    }

    if (room.createdById !== userId) {
        throw new ApiError(403, 'Only room creator can add questions');
    }

    // Check for duplicate question title
    const duplicate = await isDuplicateQuestion(title, roomId);
    if (duplicate) {
        throw new ApiError(400, 'Question with this title already exists in the room');
    }

    // Validate test cases and examples
    validateTestCases(testCases);
    if (examples.length > 0) {
        validateExamples(examples);
    }

    // Calculate points if not provided
    const questionPoints = points || calculateQuestionPoints(difficulty, testCases.length);

    // Create question with test cases and examples
    const question = await prisma.question.create({
        data: {
            roomId,
            title,
            description,
            topic,
            difficulty,
            constraints,
            inputFormat,
            outputFormat,
            timeLimit,
            memoryLimit,
            points: questionPoints,
            testCases: {
                create: testCases.map((tc, index) => ({
                    input: tc.input,
                    expectedOutput: tc.expectedOutput,
                    isHidden: tc.isHidden || false,
                    points: tc.points || 0
                }))
            },
            examples: {
                create: examples.map((ex, index) => ({
                    input: ex.input,
                    output: ex.output,
                    explanation: ex.explanation || null,
                    orderIndex: ex.orderIndex !== undefined ? ex.orderIndex : index
                }))
            }
        },
        include: {
            testCases: true,
            examples: {
                orderBy: {
                    orderIndex: 'asc'
                }
            }
        }
    });

    logger.info(`Question created successfully with ID: ${question.id}`);

    res.status(201).json(
        new ApiResponse(201, 'Question created successfully', question)
    );
});

/**
 * Get Questions By Room Controller
 * -------------------------------
 * Retrieves all questions in a specific room
 */
export const GetQuestionsByRoomController = asyncHandler(async (req, res, next) => {
    const { roomId } = req.params;
    const { page = 1, limit = 10, difficulty, topic, search } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    logger.info(`Fetching questions for room: ${roomId}`);

    // Build where clause
    const whereClause = { roomId };

    if (difficulty) {
        whereClause.difficulty = difficulty;
    }

    if (topic) {
        whereClause.topic = {
            contains: topic,
            mode: 'insensitive'
        };
    }

    if (search) {
        whereClause.OR = [
            {
                title: {
                    contains: search,
                    mode: 'insensitive'
                }
            },
            {
                description: {
                    contains: search,
                    mode: 'insensitive'
                }
            }
        ];
    }

    // Get total count
    const totalQuestions = await prisma.question.count({
        where: whereClause
    });

    // Get questions with pagination
    const questions = await prisma.question.findMany({
        where: whereClause,
        skip,
        take: limitNum,
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            _count: {
                select: {
                    testCases: true,
                    examples: true,
                    submissions: true
                }
            }
        }
    });

    const totalPages = Math.ceil(totalQuestions / limitNum);

    logger.info(`Retrieved ${questions.length} questions out of ${totalQuestions} total`);

    res.status(200).json(
        new ApiResponse(200, 'Questions retrieved successfully', {
            questions,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalQuestions,
                limit: limitNum,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1,
            }
        })
    );
});

/**
 * Get Question By ID Controller
 * ----------------------------
 * Retrieves detailed information about a specific question
 */
export const GetQuestionByIdController = asyncHandler(async (req, res, next) => {
    const { questionId } = req.params;
    const userId = req.user?.id;

    logger.info(`Fetching question details for ID: ${questionId}`);

    // Check if user is room creator (to show hidden test cases)
    let isRoomCreator = false;
    if (userId) {
        const question = await prisma.question.findUnique({
            where: { id: parseInt(questionId) },
            include: {
                room: {
                    select: { createdById: true }
                }
            }
        });

        if (question) {
            isRoomCreator = question.room.createdById === userId;
        }
    }

    // Get question with details (include hidden test cases only for room creator)
    const question = await getQuestionWithDetails(parseInt(questionId), isRoomCreator);

    logger.info(`Question ${questionId} details retrieved successfully`);

    res.status(200).json(
        new ApiResponse(200, 'Question retrieved successfully', question)
    );
});

/**
 * Update Question Controller
 * -------------------------
 * Updates question details (only room creator can update)
 */
export const UpdateQuestionController = asyncHandler(async (req, res, next) => {
    const { questionId } = req.params;
    const userId = req.user.id;
    const updateData = req.body;

    logger.info(`User ${userId} attempting to update question: ${questionId}`);

    // Get question with room info
    const question = await prisma.question.findUnique({
        where: { id: parseInt(questionId) },
        include: {
            room: {
                select: {
                    createdById: true,
                    status: true
                }
            }
        }
    });

    if (!question) {
        throw new ApiError(404, 'Question not found');
    }

    // Check if user is room creator
    if (question.room.createdById !== userId) {
        throw new ApiError(403, 'Only room creator can update questions');
    }

    // Prevent updates during in-progress contests
    if (question.room.status === RoomStatus.IN_PROGRESS) {
        throw new ApiError(400, 'Cannot update questions during an active contest');
    }

    // Check for duplicate title if title is being updated
    if (updateData.title && updateData.title !== question.title) {
        const duplicate = await isDuplicateQuestion(updateData.title, question.roomId, question.id);
        if (duplicate) {
            throw new ApiError(400, 'Question with this title already exists in the room');
        }
    }

    // Update question
    const updatedQuestion = await prisma.question.update({
        where: { id: parseInt(questionId) },
        data: updateData,
        include: {
            testCases: true,
            examples: {
                orderBy: {
                    orderIndex: 'asc'
                }
            }
        }
    });

    logger.info(`Question ${questionId} updated successfully`);

    res.status(200).json(
        new ApiResponse(200, 'Question updated successfully', updatedQuestion)
    );
});

/**
 * Delete Question Controller
 * -------------------------
 * Deletes a question (only room creator can delete)
 */
export const DeleteQuestionController = asyncHandler(async (req, res, next) => {
    const { questionId } = req.params;
    const userId = req.user.id;

    logger.info(`User ${userId} attempting to delete question: ${questionId}`);

    // Get question with room info
    const question = await prisma.question.findUnique({
        where: { id: parseInt(questionId) },
        include: {
            room: {
                select: {
                    createdById: true,
                    status: true
                }
            }
        }
    });

    if (!question) {
        throw new ApiError(404, 'Question not found');
    }

    // Check if user is room creator
    if (question.room.createdById !== userId) {
        throw new ApiError(403, 'Only room creator can delete questions');
    }

    // Prevent deletion during in-progress contests
    if (question.room.status === RoomStatus.IN_PROGRESS) {
        throw new ApiError(400, 'Cannot delete questions during an active contest');
    }

    // Delete question (cascade will handle test cases and examples)
    await prisma.question.delete({
        where: { id: parseInt(questionId) }
    });

    logger.info(`Question ${questionId} deleted successfully`);

    res.status(200).json(
        new ApiResponse(200, 'Question deleted successfully', {
            questionId: question.id,
            title: question.title
        })
    );
});

/**
 * Add Test Case Controller
 * -----------------------
 * Adds a new test case to a question
 */
export const AddTestCaseController = asyncHandler(async (req, res, next) => {
    const { questionId } = req.params;
    const { input, expectedOutput, isHidden = false, points = 0 } = req.body;
    const userId = req.user.id;

    logger.info(`User ${userId} attempting to add test case to question: ${questionId}`);

    // Get question with room info
    const question = await prisma.question.findUnique({
        where: { id: parseInt(questionId) },
        include: {
            room: {
                select: { createdById: true }
            }
        }
    });

    if (!question) {
        throw new ApiError(404, 'Question not found');
    }

    // Check if user is room creator
    if (question.room.createdById !== userId) {
        throw new ApiError(403, 'Only room creator can add test cases');
    }

    // Create test case
    const testCase = await prisma.testCase.create({
        data: {
            questionId: parseInt(questionId),
            input,
            expectedOutput,
            isHidden,
            points
        }
    });

    logger.info(`Test case added to question ${questionId}`);

    res.status(201).json(
        new ApiResponse(201, 'Test case added successfully', testCase)
    );
});

/**
 * Update Test Case Controller
 * --------------------------
 * Updates an existing test case
 */
export const UpdateTestCaseController = asyncHandler(async (req, res, next) => {
    const { testCaseId } = req.params;
    const updateData = req.body;
    const userId = req.user.id;

    logger.info(`User ${userId} attempting to update test case: ${testCaseId}`);

    // Get test case with question and room info
    const testCase = await prisma.testCase.findUnique({
        where: { id: parseInt(testCaseId) },
        include: {
            question: {
                include: {
                    room: {
                        select: { createdById: true }
                    }
                }
            }
        }
    });

    if (!testCase) {
        throw new ApiError(404, 'Test case not found');
    }

    // Check if user is room creator
    if (testCase.question.room.createdById !== userId) {
        throw new ApiError(403, 'Only room creator can update test cases');
    }

    // Update test case
    const updatedTestCase = await prisma.testCase.update({
        where: { id: parseInt(testCaseId) },
        data: updateData
    });

    logger.info(`Test case ${testCaseId} updated successfully`);

    res.status(200).json(
        new ApiResponse(200, 'Test case updated successfully', updatedTestCase)
    );
});

/**
 * Delete Test Case Controller
 * --------------------------
 * Deletes a test case
 */
export const DeleteTestCaseController = asyncHandler(async (req, res, next) => {
    const { testCaseId } = req.params;
    const userId = req.user.id;

    logger.info(`User ${userId} attempting to delete test case: ${testCaseId}`);

    // Get test case with question and room info
    const testCase = await prisma.testCase.findUnique({
        where: { id: parseInt(testCaseId) },
        include: {
            question: {
                include: {
                    room: {
                        select: { createdById: true }
                    }
                }
            }
        }
    });

    if (!testCase) {
        throw new ApiError(404, 'Test case not found');
    }

    // Check if user is room creator
    if (testCase.question.room.createdById !== userId) {
        throw new ApiError(403, 'Only room creator can delete test cases');
    }

    // Delete test case
    await prisma.testCase.delete({
        where: { id: parseInt(testCaseId) }
    });

    logger.info(`Test case ${testCaseId} deleted successfully`);

    res.status(200).json(
        new ApiResponse(200, 'Test case deleted successfully')
    );
});

/**
 * Add Example Controller
 * ---------------------
 * Adds a new example to a question
 */
export const AddExampleController = asyncHandler(async (req, res, next) => {
    const { questionId } = req.params;
    const { input, output, explanation, orderIndex } = req.body;
    const userId = req.user.id;

    logger.info(`User ${userId} attempting to add example to question: ${questionId}`);

    // Get question with room info
    const question = await prisma.question.findUnique({
        where: { id: parseInt(questionId) },
        include: {
            room: {
                select: { createdById: true }
            },
            _count: {
                select: { examples: true }
            }
        }
    });

    if (!question) {
        throw new ApiError(404, 'Question not found');
    }

    // Check if user is room creator
    if (question.room.createdById !== userId) {
        throw new ApiError(403, 'Only room creator can add examples');
    }

    // Create example
    const example = await prisma.example.create({
        data: {
            questionId: parseInt(questionId),
            input,
            output,
            explanation,
            orderIndex: orderIndex !== undefined ? orderIndex : question._count.examples
        }
    });

    logger.info(`Example added to question ${questionId}`);

    res.status(201).json(
        new ApiResponse(201, 'Example added successfully', example)
    );
});

/**
 * Delete Example Controller
 * ------------------------
 * Deletes an example
 */
export const DeleteExampleController = asyncHandler(async (req, res, next) => {
    const { exampleId } = req.params;
    const userId = req.user.id;

    logger.info(`User ${userId} attempting to delete example: ${exampleId}`);

    // Get example with question and room info
    const example = await prisma.example.findUnique({
        where: { id: parseInt(exampleId) },
        include: {
            question: {
                include: {
                    room: {
                        select: { createdById: true }
                    }
                }
            }
        }
    });

    if (!example) {
        throw new ApiError(404, 'Example not found');
    }

    // Check if user is room creator
    if (example.question.room.createdById !== userId) {
        throw new ApiError(403, 'Only room creator can delete examples');
    }

    // Delete example
    await prisma.example.delete({
        where: { id: parseInt(exampleId) }
    });

    logger.info(`Example ${exampleId} deleted successfully`);

    res.status(200).json(
        new ApiResponse(200, 'Example deleted successfully')
    );
});

/**
 * Get Question Statistics Controller
 * ---------------------------------
 * Retrieves question statistics
 */
export const GetQuestionStatisticsController = asyncHandler(async (req, res, next) => {
    const { questionId } = req.params;

    logger.info(`Fetching statistics for question: ${questionId}`);

    const statistics = await getQuestionStatistics(parseInt(questionId));

    logger.info(`Statistics retrieved for question: ${questionId}`);

    res.status(200).json(
        new ApiResponse(200, 'Question statistics retrieved successfully', statistics)
    );
});