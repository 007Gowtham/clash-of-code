import { prisma } from "../../../db/index.js";
import { ApiError } from "../../../utils/ApiError.js";
import jwt from 'jsonwebtoken';

/**
 * Team Model Functions
 * ------------------
 * Database operations for team management
 */

/**
 * Generate Team Leader Token
 * -------------------------
 * Creates JWT token for team leader authentication
 * 
 * @param {string} teamId - Team ID
 * @param {number} leaderId - Leader user ID
 * @returns {string} JWT token
 */
export const generateTeamLeaderToken = (teamId, leaderId) => {
    return jwt.sign(
        { 
            type: 'team_leader',
            teamId,
            leaderId 
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

/**
 * Generate Team Member Token
 * -------------------------
 * Creates JWT token for team member authentication
 * 
 * @param {string} teamId - Team ID
 * @param {number} userId - Member user ID
 * @returns {string} JWT token
 */
export const generateTeamMemberToken = (teamId, userId) => {
    return jwt.sign(
        { 
            type: 'team_member',
            teamId,
            userId 
        },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );
};

/**
 * Check Team Capacity
 * -----------------
 * Verifies if team can accept more members
 * 
 * @param {string} teamId - Team ID
 * @returns {Promise<Object>} Team capacity information
 */
export const checkTeamCapacity = async (teamId) => {
    const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: {
            room: {
                select: { maxTeamSize: true }
            },
            _count: {
                select: { 
                    memberships: {
                        where: { status: 'APPROVED' }
                    }
                }
            }
        }
    });

    if (!team) {
        throw new ApiError(404, 'Team not found');
    }

    return {
        currentMembers: team._count.memberships,
        maxMembers: team.room.maxTeamSize,
        hasCapacity: team._count.memberships < team.room.maxTeamSize,
        availableSlots: team.room.maxTeamSize - team._count.memberships
    };
};

/**
 * Check User Team Membership
 * ------------------------
 * Checks if user is already in a team for a specific room
 * 
 * @param {number} userId - User ID
 * @param {string} roomId - Room ID
 * @returns {Promise<boolean>} True if user is already in a team
 */
export const isUserInRoomTeam = async (userId, roomId) => {
    const existingMembership = await prisma.teamMembership.findFirst({
        where: {
            userId,
            team: {
                roomId
            },
            status: {
                in: ['PENDING', 'APPROVED']
            }
        }
    });

    return !!existingMembership;
};

/**
 * Get Team Statistics
 * -----------------
 * Retrieves comprehensive statistics for a team
 * 
 * @param {string} teamId - Team ID
 * @returns {Promise<Object>} Team statistics
 */
export const getTeamStatistics = async (teamId) => {
    const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: {
            _count: {
                select: {
                    memberships: {
                        where: { status: 'APPROVED' }
                    },
                    submissions: true,
                    solveRequests: true
                }
            }
        }
    });

    if (!team) {
        throw new ApiError(404, 'Team not found');
    }

    // Get accepted submissions
    const acceptedSubmissions = await prisma.submission.count({
        where: {
            teamId: teamId,
            status: 'ACCEPTED'
        }
    });

    // Get pending solve requests
    const pendingSolveRequests = await prisma.solveRequest.count({
        where: {
            teamId: teamId,
            status: 'PENDING'
        }
    });

    return {
        totalMembers: team._count.memberships,
        totalSubmissions: team._count.submissions,
        acceptedSubmissions,
        totalSolveRequests: team._count.solveRequests,
        pendingSolveRequests,
        totalScore: team.totalScore,
        rank: team.rank
    };
};

/**
 * Calculate Team Score
 * ------------------
 * Calculates total score from all accepted submissions
 * 
 * @param {string} teamId - Team ID
 * @returns {Promise<number>} Total team score
 */
export const calculateTeamScore = async (teamId) => {
    const submissions = await prisma.submission.findMany({
        where: {
            teamId,
            status: 'ACCEPTED'
        },
        include: {
            question: {
                select: {
                    points: true
                }
            }
        },
        distinct: ['questionId'] // Only count each question once
    });

    const totalScore = submissions.reduce((sum, submission) => {
        return sum + submission.question.points;
    }, 0);

    return totalScore;
};

/**
 * Update Team Rankings
 * ------------------
 * Updates rankings for all teams in a room
 * 
 * @param {string} roomId - Room ID
 * @returns {Promise<void>}
 */
export const updateTeamRankings = async (roomId) => {
    // Get all teams sorted by score
    const teams = await prisma.team.findMany({
        where: { roomId },
        orderBy: {
            totalScore: 'desc'
        }
    });

    // Update ranks
    const updatePromises = teams.map((team, index) => {
        return prisma.team.update({
            where: { id: team.id },
            data: { rank: index + 1 }
        });
    });

    await Promise.all(updatePromises);
};

/**
 * Is User Team Leader
 * -----------------
 * Checks if user is the leader of a specific team
 * 
 * @param {number} userId - User ID
 * @param {string} teamId - Team ID
 * @returns {Promise<boolean>} True if user is team leader
 */
export const isUserTeamLeader = async (userId, teamId) => {
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
 * Is User Team Member
 * -----------------
 * Checks if user is an approved member of a team
 * 
 * @param {number} userId - User ID
 * @param {string} teamId - Team ID
 * @returns {Promise<boolean>} True if user is approved team member
 */
export const isUserTeamMember = async (userId, teamId) => {
    const membership = await prisma.teamMembership.findFirst({
        where: {
            userId,
            teamId,
            status: 'APPROVED'
        }
    });

    return !!membership;
};