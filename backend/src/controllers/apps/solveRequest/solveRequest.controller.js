import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { prisma } from "../../../db/index.js";
import { RoomStatus, RequestStatus } from "../../../constants.js";
import logger from "../../../logger/winston.logger.js";
import {
    getExistingSolveRequest,
    isTeamMember,
    isTeamLeader,
    getSolveRequestStatistics,
    getTeamPendingRequestsCount,
    getQuestionPendingRequestsCount,
    canTeamSolveQuestion,
    getTeamApprovedQuestions,
    bulkApproveSolveRequests,
    bulkRejectSolveRequests,
    getRoomSolveRequestStatistics
} from "../../../models/apps/solveRequest/solveRequest.model.js";

/**
 * Create Solve Request Controller
 * ------------------------------
 * Creates a new solve request for a question
 */
export const CreateSolveRequestController = asyncHandler(async (req, res, next) => {
    const { teamId, questionId } = req.body;
    const userId = req.user.id;

    logger.info(`User ${userId} creating solve request for team ${teamId}, question ${questionId}`);

    // Verify user is a team member
    const isMember = await isTeamMember(userId, teamId);
    if (!isMember) {
        throw new ApiError(403, 'You are not a member of this team');
    }

    // Check if question exists and get room info
    const question = await prisma.question.findUnique({
        where: { id: questionId },
        include: {
            room: {
                select: {
                    id: true,
                    status: true
                }
            }
        }
    });

    if (!question) {
        throw new ApiError(404, 'Question not found');
    }

    // Check if room is active
    if (question.room.status !== RoomStatus.IN_PROGRESS && question.room.status !== RoomStatus.WAITING) {
        throw new ApiError(400, 'Cannot request solve access for questions in inactive rooms');
    }

    // Verify team is in the same room
    const team = await prisma.team.findUnique({
        where: { id: teamId },
        select: {
            roomId: true
        }
    });

    if (team.roomId !== question.room.id) {
        throw new ApiError(400, 'Team and question must be in the same room');
    }

    // Check for existing request
    const existingRequest = await getExistingSolveRequest(teamId, questionId);
    if (existingRequest) {
        throw new ApiError(400, `A ${existingRequest.status.toLowerCase()} solve request already exists for this question`);
    }

    // Create solve request
    const solveRequest = await prisma.solveRequest.create({
        data: {
            teamId,
            questionId,
            requestedById: userId,
            status: RequestStatus.PENDING
        },
        include: {
            team: {
                select: {
                    id: true,
                    name: true
                }
            },
            question: {
                select: {
                    id: true,
                    title: true,
                    difficulty: true,
                    points: true
                }
            }
        }
    });

    logger.info(`Solve request created with ID: ${solveRequest.id}`);

    res.status(201).json(
        new ApiResponse(201, 'Solve request created successfully', solveRequest)
    );
});

/**
 * Get Team Solve Requests Controller
 * ---------------------------------
 * Retrieves all solve requests for a specific team
 */
export const GetTeamSolveRequestsController = asyncHandler(async (req, res, next) => {
    const { teamId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const userId = req.user.id;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    logger.info(`Fetching solve requests for team: ${teamId}`);

    // Verify user is a team member
    const isMember = await isTeamMember(userId, teamId);
    if (!isMember) {
        throw new ApiError(403, 'You are not a member of this team');
    }

    // Build where clause
    const whereClause = { teamId };

    if (status) {
        whereClause.status = status;
    }

    // Get total count
    const totalRequests = await prisma.solveRequest.count({
        where: whereClause
    });

    // Get solve requests with pagination
    const solveRequests = await prisma.solveRequest.findMany({
        where: whereClause,
        skip,
        take: limitNum,
        orderBy: {
            requestedAt: 'desc'
        },
        include: {
            question: {
                select: {
                    id: true,
                    title: true,
                    difficulty: true,
                    points: true,
                    topic: true
                }
            }
        }
    });

    const totalPages = Math.ceil(totalRequests / limitNum);

    logger.info(`Retrieved ${solveRequests.length} solve requests out of ${totalRequests} total`);

    res.status(200).json(
        new ApiResponse(200, 'Solve requests retrieved successfully', {
            solveRequests,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalRequests,
                limit: limitNum,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1,
            }
        })
    );
});

/**
 * Get Room Solve Requests Controller
 * ---------------------------------
 * Retrieves all solve requests in a room (for room creator)
 */
export const GetRoomSolveRequestsController = asyncHandler(async (req, res, next) => {
    const { roomId } = req.params;
    const { page = 1, limit = 10, status } = req.query;
    const userId = req.user.id;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    logger.info(`Fetching solve requests for room: ${roomId}`);

    // Verify user is room creator
    const room = await prisma.room.findUnique({
        where: { id: roomId },
        select: {
            createdById: true
        }
    });

    if (!room) {
        throw new ApiError(404, 'Room not found');
    }

    if (room.createdById !== userId) {
        throw new ApiError(403, 'Only room creator can view all solve requests');
    }

    // Build where clause
    const whereClause = {
        team: {
            roomId
        }
    };

    if (status) {
        whereClause.status = status;
    }

    // Get total count
    const totalRequests = await prisma.solveRequest.count({
        where: whereClause
    });

    // Get solve requests with pagination
    const solveRequests = await prisma.solveRequest.findMany({
        where: whereClause,
        skip,
        take: limitNum,
        orderBy: {
            requestedAt: 'desc'
        },
        include: {
            team: {
                select: {
                    id: true,
                    name: true
                }
            },
            question: {
                select: {
                    id: true,
                    title: true,
                    difficulty: true,
                    points: true
                }
            }
        }
    });

    const totalPages = Math.ceil(totalRequests / limitNum);

    logger.info(`Retrieved ${solveRequests.length} solve requests out of ${totalRequests} total`);

    res.status(200).json(
        new ApiResponse(200, 'Solve requests retrieved successfully', {
            solveRequests,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalRequests,
                limit: limitNum,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1,
            }
        })
    );
});

/**
 * Get Solve Request By ID Controller
 * ---------------------------------
 * Retrieves a specific solve request
 */
export const GetSolveRequestByIdController = asyncHandler(async (req, res, next) => {
    const { requestId } = req.params;
    const userId = req.user.id;

    logger.info(`Fetching solve request: ${requestId}`);

    const solveRequest = await prisma.solveRequest.findUnique({
        where: { id: parseInt(requestId) },
        include: {
            team: {
                select: {
                    id: true,
                    name: true,
                    leaderId: true
                }
            },
            question: {
                select: {
                    id: true,
                    title: true,
                    difficulty: true,
                    points: true,
                    topic: true,
                    room: {
                        select: {
                            id: true,
                            name: true,
                            createdById: true
                        }
                    }
                }
            }
        }
    });

    if (!solveRequest) {
        throw new ApiError(404, 'Solve request not found');
    }

    // Verify authorization (team member or room creator)
    const isMember = await isTeamMember(userId, solveRequest.teamId);
    const isRoomCreator = solveRequest.question.room.createdById === userId;

    if (!isMember && !isRoomCreator) {
        throw new ApiError(403, 'You are not authorized to view this solve request');
    }

    logger.info(`Solve request ${requestId} retrieved successfully`);

    res.status(200).json(
        new ApiResponse(200, 'Solve request retrieved successfully', solveRequest)
    );
});

/**
 * Update Solve Request Status Controller
 * -------------------------------------
 * Approves or rejects a solve request (room creator only)
 */
export const UpdateSolveRequestStatusController = asyncHandler(async (req, res, next) => {
    const { requestId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    logger.info(`User ${userId} updating solve request ${requestId} to ${status}`);

    // Get solve request with room info
    const solveRequest = await prisma.solveRequest.findUnique({
        where: { id: parseInt(requestId) },
        include: {
            question: {
                include: {
                    room: {
                        select: {
                            createdById: true
                        }
                    }
                }
            }
        }
    });

    if (!solveRequest) {
        throw new ApiError(404, 'Solve request not found');
    }

    // Verify user is room creator
    if (solveRequest.question.room.createdById !== userId) {
        throw new ApiError(403, 'Only room creator can approve/reject solve requests');
    }

    // Check if request is still pending
    if (solveRequest.status !== RequestStatus.PENDING) {
        throw new ApiError(400, 'This solve request has already been processed');
    }

    // Update status
    const updatedRequest = await prisma.solveRequest.update({
        where: { id: parseInt(requestId) },
        data: {
            status,
            respondedAt: new Date()
        },
        include: {
            team: {
                select: {
                    id: true,
                    name: true
                }
            },
            question: {
                select: {
                    id: true,
                    title: true,
                    difficulty: true,
                    points: true
                }
            }
        }
    });

    logger.info(`Solve request ${requestId} ${status.toLowerCase()} successfully`);

    res.status(200).json(
        new ApiResponse(200, `Solve request ${status.toLowerCase()} successfully`, updatedRequest)
    );
});

/**
 * Delete Solve Request Controller
 * ------------------------------
 * Cancels/deletes a solve request (requester or room creator)
 */
export const DeleteSolveRequestController = asyncHandler(async (req, res, next) => {
    const { requestId } = req.params;
    const userId = req.user.id;

    logger.info(`User ${userId} attempting to delete solve request: ${requestId}`);

    // Get solve request
    const solveRequest = await prisma.solveRequest.findUnique({
        where: { id: parseInt(requestId) },
        include: {
            question: {
                include: {
                    room: {
                        select: {
                            createdById: true
                        }
                    }
                }
            }
        }
    });

    if (!solveRequest) {
        throw new ApiError(404, 'Solve request not found');
    }

    // Verify authorization (requester or room creator)
    const isRequester = solveRequest.requestedById === userId;
    const isRoomCreator = solveRequest.question.room.createdById === userId;

    if (!isRequester && !isRoomCreator) {
        throw new ApiError(403, 'You are not authorized to delete this solve request');
    }

    // Can only delete pending requests
    if (solveRequest.status !== RequestStatus.PENDING) {
        throw new ApiError(400, 'Can only delete pending solve requests');
    }

    // Delete request
    await prisma.solveRequest.delete({
        where: { id: parseInt(requestId) }
    });

    logger.info(`Solve request ${requestId} deleted successfully`);

    res.status(200).json(
        new ApiResponse(200, 'Solve request deleted successfully')
    );
});

/**
 * Bulk Action Controller
 * --------------------
 * Bulk approve or reject multiple solve requests
 */
export const BulkActionController = asyncHandler(async (req, res, next) => {
    const { requestIds, action } = req.body;
    const userId = req.user.id;

    logger.info(`User ${userId} performing bulk ${action} on ${requestIds.length} requests`);

    // Get all requests to verify room creator authorization
    const requests = await prisma.solveRequest.findMany({
        where: {
            id: {
                in: requestIds
            }
        },
        include: {
            question: {
                include: {
                    room: {
                        select: {
                            createdById: true
                        }
                    }
                }
            }
        }
    });

    if (requests.length !== requestIds.length) {
        throw new ApiError(404, 'Some solve requests not found');
    }

    // Verify user is room creator for all requests
    const uniqueRoomCreators = [...new Set(requests.map(r => r.question.room.createdById))];
    if (uniqueRoomCreators.length !== 1 || uniqueRoomCreators[0] !== userId) {
        throw new ApiError(403, 'You are not authorized to perform this action on all requests');
    }

    // Perform bulk action
    let result;
    if (action === 'APPROVE') {
        result = await bulkApproveSolveRequests(requestIds, userId);
    } else {
        result = await bulkRejectSolveRequests(requestIds);
    }

    logger.info(`Bulk ${action} completed: ${result.count} requests updated`);

    res.status(200).json(
        new ApiResponse(200, `Successfully ${action.toLowerCase()}ed ${result.count} solve requests`, {
            updatedCount: result.count
        })
    );
});

/**
 * Get Team Statistics Controller
 * -----------------------------
 * Retrieves solve request statistics for a team
 */
export const GetTeamStatisticsController = asyncHandler(async (req, res, next) => {
    const { teamId } = req.params;
    const userId = req.user.id;

    logger.info(`Fetching solve request statistics for team: ${teamId}`);

    // Verify user is team member
    const isMember = await isTeamMember(userId, teamId);
    if (!isMember) {
        throw new ApiError(403, 'You are not a member of this team');
    }

    const statistics = await getSolveRequestStatistics(teamId);

    logger.info(`Statistics retrieved for team: ${teamId}`);

    res.status(200).json(
        new ApiResponse(200, 'Team statistics retrieved successfully', statistics)
    );
});

/**
 * Get Room Statistics Controller
 * -----------------------------
 * Retrieves solve request statistics for entire room
 */
export const GetRoomStatisticsController = asyncHandler(async (req, res, next) => {
    const { roomId } = req.params;
    const userId = req.user.id;

    logger.info(`Fetching solve request statistics for room: ${roomId}`);

    // Verify user is room creator
    const room = await prisma.room.findUnique({
        where: { id: roomId },
        select: {
            createdById: true
        }
    });

    if (!room) {
        throw new ApiError(404, 'Room not found');
    }

    if (room.createdById !== userId) {
        throw new ApiError(403, 'Only room creator can view room statistics');
    }

    const statistics = await getRoomSolveRequestStatistics(roomId);

    logger.info(`Statistics retrieved for room: ${roomId}`);

    res.status(200).json(
        new ApiResponse(200, 'Room statistics retrieved successfully', statistics)
    );
});

/**
 * Get Team Approved Questions Controller
 * -------------------------------------
 * Gets list of questions team can solve
 */
export const GetTeamApprovedQuestionsController = asyncHandler(async (req, res, next) => {
    const { teamId } = req.params;
    const userId = req.user.id;

    logger.info(`Fetching approved questions for team: ${teamId}`);

    // Verify user is team member
    const isMember = await isTeamMember(userId, teamId);
    if (!isMember) {
        throw new ApiError(403, 'You are not a member of this team');
    }

    // Get approved question IDs
    const approvedQuestionIds = await getTeamApprovedQuestions(teamId);

    // Get full question details
    const questions = await prisma.question.findMany({
        where: {
            id: {
                in: approvedQuestionIds
            }
        },
        select: {
            id: true,
            title: true,
            difficulty: true,
            points: true,
            topic: true,
            timeLimit: true,
            memoryLimit: true
        }
    });

    logger.info(`Retrieved ${questions.length} approved questions for team ${teamId}`);

    res.status(200).json(
        new ApiResponse(200, 'Approved questions retrieved successfully', questions)
    );
});