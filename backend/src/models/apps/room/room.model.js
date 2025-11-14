import { prisma } from "../../../db/index.js";
import bcrypt from 'bcryptjs';
import { ApiError } from "../../../utils/ApiError.js";

/**
 * Room Model Functions
 * ------------------
 * Database operations for room management
 */

/**
 * Verify Room Password
 * ------------------
 * Checks if provided password matches hashed room password
 * 
 * @param {string} hashedPassword - Stored hashed password
 * @param {string} plainPassword - Password to verify
 * @returns {Promise<boolean>} True if passwords match
 */
export const isRoomPasswordCorrect = async (hashedPassword, plainPassword) => {
    return await bcrypt.compare(plainPassword, hashedPassword);
};

/**
 * Check Room Capacity
 * -----------------
 * Verifies if room can accept more teams
 * 
 * @param {string} roomId - Room ID
 * @returns {Promise<Object>} Capacity information
 */
export const checkRoomCapacity = async (roomId) => {
    const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
            _count: {
                select: { teams: true }
            }
        }
    });

    if (!room) {
        throw new ApiError(404, 'Room not found');
    }

    return {
        currentTeams: room._count.teams,
        maxTeams: room.maxTeams,
        hasCapacity: room._count.teams < room.maxTeams,
        availableSlots: room.maxTeams - room._count.teams
    };
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
 * Get Room Statistics
 * -----------------
 * Retrieves comprehensive statistics for a room
 * 
 * @param {string} roomId - Room ID
 * @returns {Promise<Object>} Room statistics
 */
export const getRoomStatistics = async (roomId) => {
    const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
            _count: {
                select: {
                    teams: true,
                    questions: true,
                    memberships: true,
                }
            }
        }
    });

    if (!room) {
        throw new ApiError(404, 'Room not found');
    }

    // Get total submissions
    const totalSubmissions = await prisma.submission.count({
        where: {
            team: {
                roomId: roomId
            }
        }
    });

    // Get accepted submissions
    const acceptedSubmissions = await prisma.submission.count({
        where: {
            team: {
                roomId: roomId
            },
            status: 'ACCEPTED'
        }
    });

    return {
        totalTeams: room._count.teams,
        totalQuestions: room._count.questions,
        totalParticipants: room._count.memberships,
        totalSubmissions,
        acceptedSubmissions,
        status: room.status,
        duration: room.duration,
        startTime: room.startTime,
        endTime: room.endTime
    };
};

/**
 * Validate Room Status Transition
 * ------------------------------
 * Checks if status transition is valid
 * 
 * @param {string} currentStatus - Current room status
 * @param {string} newStatus - Desired new status
 * @returns {boolean} True if transition is valid
 */
export const isValidStatusTransition = (currentStatus, newStatus) => {
    const validTransitions = {
        WAITING: ['IN_PROGRESS', 'CANCELLED'],
        IN_PROGRESS: ['COMPLETED', 'CANCELLED'],
        COMPLETED: [],
        CANCELLED: []
    };

    return validTransitions[currentStatus]?.includes(newStatus) || false;
};