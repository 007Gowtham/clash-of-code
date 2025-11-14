import { prisma } from "../../../db/index.js";
import { ApiError } from "../../../utils/ApiError.js";

/**
 * Solve Request Model Functions
 * ----------------------------
 * Database operations for solve request management
 */

/**
 * Check Existing Solve Request
 * ---------------------------
 * Checks if team already has a solve request for this question
 * 
 * @param {string} teamId - Team ID
 * @param {number} questionId - Question ID
 * @returns {Promise<Object|null>} Existing solve request or null
 */
export const getExistingSolveRequest = async (teamId, questionId) => {
    return await prisma.solveRequest.findFirst({
        where: {
            teamId,
            questionId,
            status: {
                in: ['PENDING', 'APPROVED']
            }
        }
    });
};

/**
 * Check Team Member Authorization
 * ------------------------------
 * Verifies if user is a member of the team
 * 
 * @param {number} userId - User ID
 * @param {string} teamId - Team ID
 * @returns {Promise<boolean>} True if user is team member
 */
export const isTeamMember = async (userId, teamId) => {
    const membership = await prisma.teamMembership.findFirst({
        where: {
            userId,
            teamId,
            status: 'APPROVED'
        }
    });

    return !!membership;
};

/**
 * Check Team Leader Authorization
 * ------------------------------
 * Verifies if user is the team leader
 * 
 * @param {number} userId - User ID
 * @param {string} teamId - Team ID
 * @returns {Promise<boolean>} True if user is team leader
 */
export const isTeamLeader = async (userId, teamId) => {
    const team = await prisma.team.findUnique({
        where: { id: teamId },
        select: { leaderId: true }
    });

    if (!team) {
        throw new ApiError(404, 'Team not found');
    }

    return team.leaderId === userId;
};

/**
 * Get Solve Request Statistics
 * ---------------------------
 * Retrieves statistics for solve requests
 * 
 * @param {string} teamId - Team ID
 * @returns {Promise<Object>} Solve request statistics
 */
export const getSolveRequestStatistics = async (teamId) => {
    const totalRequests = await prisma.solveRequest.count({
        where: { teamId }
    });

    const pendingRequests = await prisma.solveRequest.count({
        where: {
            teamId,
            status: 'PENDING'
        }
    });

    const approvedRequests = await prisma.solveRequest.count({
        where: {
            teamId,
            status: 'APPROVED'
        }
    });

    const rejectedRequests = await prisma.solveRequest.count({
        where: {
            teamId,
            status: 'REJECTED'
        }
    });

    const approvalRate = totalRequests > 0 
        ? ((approvedRequests / totalRequests) * 100).toFixed(2)
        : 0;

    return {
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests,
        approvalRate: parseFloat(approvalRate)
    };
};

/**
 * Get Team Pending Requests Count
 * ------------------------------
 * Gets count of pending solve requests for a team
 * 
 * @param {string} teamId - Team ID
 * @returns {Promise<number>} Count of pending requests
 */
export const getTeamPendingRequestsCount = async (teamId) => {
    return await prisma.solveRequest.count({
        where: {
            teamId,
            status: 'PENDING'
        }
    });
};

/**
 * Get Question Pending Requests Count
 * ----------------------------------
 * Gets count of pending requests for a specific question
 * 
 * @param {number} questionId - Question ID
 * @returns {Promise<number>} Count of pending requests
 */
export const getQuestionPendingRequestsCount = async (questionId) => {
    return await prisma.solveRequest.count({
        where: {
            questionId,
            status: 'PENDING'
        }
    });
};

/**
 * Check if Team Can Solve Question
 * -------------------------------
 * Verifies if team has approved solve request for question
 * 
 * @param {string} teamId - Team ID
 * @param {number} questionId - Question ID
 * @returns {Promise<boolean>} True if team can solve
 */
export const canTeamSolveQuestion = async (teamId, questionId) => {
    const approvedRequest = await prisma.solveRequest.findFirst({
        where: {
            teamId,
            questionId,
            status: 'APPROVED'
        }
    });

    return !!approvedRequest;
};

/**
 * Get Team Approved Questions
 * --------------------------
 * Gets all questions team has approval to solve
 * 
 * @param {string} teamId - Team ID
 * @returns {Promise<Array>} Array of question IDs
 */
export const getTeamApprovedQuestions = async (teamId) => {
    const approvedRequests = await prisma.solveRequest.findMany({
        where: {
            teamId,
            status: 'APPROVED'
        },
        select: {
            questionId: true
        }
    });

    return approvedRequests.map(req => req.questionId);
};

/**
 * Bulk Approve Solve Requests
 * --------------------------
 * Approves multiple solve requests at once
 * 
 * @param {Array<number>} requestIds - Array of request IDs
 * @param {number} approverId - User ID approving requests
 * @returns {Promise<Object>} Update result
 */
export const bulkApproveSolveRequests = async (requestIds, approverId) => {
    return await prisma.solveRequest.updateMany({
        where: {
            id: {
                in: requestIds
            },
            status: 'PENDING'
        },
        data: {
            status: 'APPROVED',
            respondedAt: new Date()
        }
    });
};

/**
 * Bulk Reject Solve Requests
 * -------------------------
 * Rejects multiple solve requests at once
 * 
 * @param {Array<number>} requestIds - Array of request IDs
 * @returns {Promise<Object>} Update result
 */
export const bulkRejectSolveRequests = async (requestIds) => {
    return await prisma.solveRequest.updateMany({
        where: {
            id: {
                in: requestIds
            },
            status: 'PENDING'
        },
        data: {
            status: 'REJECTED',
            respondedAt: new Date()
        }
    });
};

/**
 * Get Room Statistics
 * -----------------
 * Gets solve request statistics for entire room
 * 
 * @param {string} roomId - Room ID
 * @returns {Promise<Object>} Room-wide statistics
 */
export const getRoomSolveRequestStatistics = async (roomId) => {
    const totalRequests = await prisma.solveRequest.count({
        where: {
            team: {
                roomId
            }
        }
    });

    const pendingRequests = await prisma.solveRequest.count({
        where: {
            team: {
                roomId
            },
            status: 'PENDING'
        }
    });

    const approvedRequests = await prisma.solveRequest.count({
        where: {
            team: {
                roomId
            },
            status: 'APPROVED'
        }
    });

    return {
        totalRequests,
        pendingRequests,
        approvedRequests,
        rejectedRequests: totalRequests - pendingRequests - approvedRequests
    };
};