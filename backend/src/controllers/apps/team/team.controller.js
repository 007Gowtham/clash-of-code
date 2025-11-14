import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { prisma } from "../../../db/index.js";
import { MembershipStatus, RoomStatus } from "../../../constants.js";
import logger from "../../../logger/winston.logger.js";
import { 
    generateTeamLeaderToken,
    generateTeamMemberToken,
    checkTeamCapacity,
    isUserInRoomTeam,
    getTeamStatistics,
    calculateTeamScore,
    updateTeamRankings,
    isUserTeamLeader,
    isUserTeamMember
} from "../../../models/apps/team/team.model.js";

/**
 * Create Team Controller
 * ---------------------
 * Creates a new team within a room
 */
export const CreateTeamController = asyncHandler(async (req, res, next) => {
    const { name, roomId } = req.body;
    const userId = req.user.id;

    logger.info(`User ${userId} attempting to create team: ${name} in room: ${roomId}`);

    // Check if room exists
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

    // Check if room has capacity
    if (room._count.teams >= room.maxTeams) {
        throw new ApiError(400, 'Room has reached maximum team capacity');
    }

    // Check if room is waiting or in progress
    if (room.status !== RoomStatus.WAITING && room.status !== RoomStatus.IN_PROGRESS) {
        throw new ApiError(400, 'Cannot create team in a room that is not waiting or in progress');
    }

    // Check if user is already in a team for this room
    const alreadyInTeam = await isUserInRoomTeam(userId, roomId);
    if (alreadyInTeam) {
        throw new ApiError(400, 'You are already in a team for this room');
    }

    // Check if team name already exists in room
    const existingTeam = await prisma.team.findFirst({
        where: {
            name,
            roomId
        }
    });

    if (existingTeam) {
        throw new ApiError(400, 'Team name already exists in this room');
    }

    // Generate leader token
    const leaderToken = generateTeamLeaderToken(name, userId);

    // Create team with leader as first member
    const team = await prisma.team.create({
        data: {
            name,
            roomId,
            leaderId: userId,
            leaderToken,
            memberships: {
                create: {
                    userId,
                    status: MembershipStatus.APPROVED,
                    approvedAt: new Date()
                }
            }
        },
        include: {
            leader: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true
                }
            },
            room: {
                select: {
                    id: true,
                    name: true,
                    maxTeamSize: true
                }
            },
            memberships: {
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true
                        }
                    }
                }
            }
        }
    });

    logger.info(`Team created successfully with ID: ${team.id}`);

    res.status(201).json(
        new ApiResponse(201, 'Team created successfully', {
            team,
            leaderToken
        })
    );
});

/**
 * Get Teams By Room Controller
 * ---------------------------
 * Retrieves all teams in a specific room
 */
export const GetTeamsByRoomController = asyncHandler(async (req, res, next) => {
    const { roomId } = req.params;
    const { page = 1, limit = 10, search } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    logger.info(`Fetching teams for room: ${roomId}`);

    // Build where clause
    const whereClause = { roomId };

    if (search) {
        whereClause.name = {
            contains: search,
            mode: 'insensitive'
        };
    }

    // Get total count
    const totalTeams = await prisma.team.count({
        where: whereClause
    });

    // Get teams with pagination
    const teams = await prisma.team.findMany({
        where: whereClause,
        skip,
        take: limitNum,
        orderBy: [
            { totalScore: 'desc' },
            { createdAt: 'asc' }
        ],
        include: {
            leader: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true
                }
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

    const totalPages = Math.ceil(totalTeams / limitNum);

    logger.info(`Retrieved ${teams.length} teams out of ${totalTeams} total`);

    res.status(200).json(
        new ApiResponse(200, 'Teams retrieved successfully', {
            teams,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalTeams,
                limit: limitNum,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1,
            }
        })
    );
});

/**
 * Get Team By ID Controller
 * ------------------------
 * Retrieves detailed information about a specific team
 */
export const GetTeamByIdController = asyncHandler(async (req, res, next) => {
    const { teamId } = req.params;

    logger.info(`Fetching team details for ID: ${teamId}`);

    const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: {
            leader: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true
                }
            },
            room: {
                select: {
                    id: true,
                    name: true,
                    status: true,
                    maxTeamSize: true,
                    duration: true
                }
            },
            memberships: {
                where: {
                    status: 'APPROVED'
                },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true
                        }
                    }
                }
            },
            _count: {
                select: {
                    submissions: true,
                    solveRequests: true
                }
            }
        }
    });

    if (!team) {
        throw new ApiError(404, 'Team not found');
    }

    logger.info(`Team ${teamId} details retrieved successfully`);

    res.status(200).json(
        new ApiResponse(200, 'Team retrieved successfully', team)
    );
});

/**
 * Update Team Controller
 * ---------------------
 * Updates team details (only leader can update)
 */
export const UpdateTeamController = asyncHandler(async (req, res, next) => {
    const { teamId } = req.params;
    const userId = req.user.id;
    const { name } = req.body;

    logger.info(`User ${userId} attempting to update team: ${teamId}`);

    // Check if user is team leader
    const isLeader = await isUserTeamLeader(userId, teamId);
    if (!isLeader) {
        throw new ApiError(403, 'You are not authorized to update this team');
    }

    // Check if new name already exists in room
    if (name) {
        const team = await prisma.team.findUnique({
            where: { id: teamId },
            select: { roomId: true }
        });

        const existingTeam = await prisma.team.findFirst({
            where: {
                name,
                roomId: team.roomId,
                id: { not: teamId }
            }
        });

        if (existingTeam) {
            throw new ApiError(400, 'Team name already exists in this room');
        }
    }

    // Update team
    const updatedTeam = await prisma.team.update({
        where: { id: teamId },
        data: { name },
        include: {
            leader: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true
                }
            },
            memberships: {
                where: { status: 'APPROVED' },
                include: {
                    user: {
                        select: {
                            id: true,
                            name: true,
                            email: true,
                            avatar: true
                        }
                    }
                }
            }
        }
    });

    logger.info(`Team ${teamId} updated successfully`);

    res.status(200).json(
        new ApiResponse(200, 'Team updated successfully', updatedTeam)
    );
});

/**
 * Delete Team Controller
 * ---------------------
 * Deletes a team (only leader can delete)
 */
export const DeleteTeamController = asyncHandler(async (req, res, next) => {
    const { teamId } = req.params;
    const userId = req.user.id;

    logger.info(`User ${userId} attempting to delete team: ${teamId}`);

    // Check if user is team leader
    const isLeader = await isUserTeamLeader(userId, teamId);
    if (!isLeader) {
        throw new ApiError(403, 'You are not authorized to delete this team');
    }

    const team = await prisma.team.findUnique({
        where: { id: teamId },
        select: {
            id: true,
            name: true,
            room: {
                select: { status: true }
            }
        }
    });

    if (!team) {
        throw new ApiError(404, 'Team not found');
    }

    // Prevent deletion if room is in progress
    if (team.room.status === RoomStatus.IN_PROGRESS) {
        throw new ApiError(400, 'Cannot delete team while contest is in progress');
    }

    // Delete team
    await prisma.team.delete({
        where: { id: teamId }
    });

    logger.info(`Team ${teamId} deleted successfully`);

    res.status(200).json(
        new ApiResponse(200, 'Team deleted successfully', {
            teamId: team.id,
            name: team.name
        })
    );
});

/**
 * Join Team Controller
 * ------------------
 * Request to join a team
 */
export const JoinTeamController = asyncHandler(async (req, res, next) => {
    const { teamId } = req.params;
    const userId = req.user.id;

    logger.info(`User ${userId} requesting to join team: ${teamId}`);

    const team = await prisma.team.findUnique({
        where: { id: teamId },
        include: {
            room: {
                select: {
                    id: true,
                    status: true,
                    maxTeamSize: true
                }
            }
        }
    });

    if (!team) {
        throw new ApiError(404, 'Team not found');
    }

    // Check if room is accepting members
    if (team.room.status === RoomStatus.COMPLETED || team.room.status === RoomStatus.CANCELLED) {
        throw new ApiError(400, 'Cannot join team in a completed or cancelled room');
    }

    // Check if user is already in a team for this room
    const alreadyInTeam = await isUserInRoomTeam(userId, team.room.id);
    if (alreadyInTeam) {
        throw new ApiError(400, 'You are already in a team for this room');
    }

    // Check team capacity
    const capacity = await checkTeamCapacity(teamId);
    if (!capacity.hasCapacity) {
        throw new ApiError(400, 'Team has reached maximum capacity');
    }

    // Create membership request
    const membership = await prisma.teamMembership.create({
        data: {
            userId,
            teamId,
            status: MembershipStatus.PENDING
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true
                }
            },
            team: {
                select: {
                    id: true,
                    name: true
                }
            }
        }
    });

    logger.info(`Join request created for user ${userId} to team ${teamId}`);

    res.status(201).json(
        new ApiResponse(201, 'Join request sent successfully', membership)
    );
});

/**
 * Approve/Reject Membership Controller
 * -----------------------------------
 * Leader approves or rejects membership request
 */
export const MembershipActionController = asyncHandler(async (req, res, next) => {
    const { teamId, membershipId } = req.params;
    const { status } = req.body;
    const userId = req.user.id;

    logger.info(`User ${userId} attempting to ${status} membership ${membershipId}`);

    // Check if user is team leader
    const isLeader = await isUserTeamLeader(userId, teamId);
    if (!isLeader) {
        throw new ApiError(403, 'Only team leader can approve/reject memberships');
    }

    // Get membership
    const membership = await prisma.teamMembership.findUnique({
        where: { id: parseInt(membershipId) },
        include: {
            team: true
        }
    });

    if (!membership) {
        throw new ApiError(404, 'Membership request not found');
    }

    if (membership.teamId !== teamId) {
        throw new ApiError(400, 'Membership does not belong to this team');
    }

    if (membership.status !== MembershipStatus.PENDING) {
        throw new ApiError(400, 'Membership request has already been processed');
    }

    // If approving, check team capacity
    if (status === MembershipStatus.APPROVED) {
        const capacity = await checkTeamCapacity(teamId);
        if (!capacity.hasCapacity) {
            throw new ApiError(400, 'Team has reached maximum capacity');
        }
    }

    // Generate member token if approved
    let memberToken = null;
    if (status === MembershipStatus.APPROVED) {
        memberToken = generateTeamMemberToken(teamId, membership.userId);
    }

    // Update membership
    const updatedMembership = await prisma.teamMembership.update({
        where: { id: parseInt(membershipId) },
        data: {
            status,
            approvedAt: status === MembershipStatus.APPROVED ? new Date() : null,
            memberToken: memberToken
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true
                }
            }
        }
    });

    logger.info(`Membership ${membershipId} ${status} successfully`);

    res.status(200).json(
        new ApiResponse(200, `Membership ${status.toLowerCase()} successfully`, updatedMembership)
    );
});

/**
 * Leave Team Controller
 * -------------------
 * Member leaves a team
 */
export const LeaveTeamController = asyncHandler(async (req, res, next) => {
    const { teamId } = req.params;
    const userId = req.user.id;

    logger.info(`User ${userId} attempting to leave team: ${teamId}`);

    const team = await prisma.team.findUnique({
        where: { id: teamId },
        select: {
            leaderId: true,
            room: {
                select: { status: true }
            }
        }
    });

    if (!team) {
        throw new ApiError(404, 'Team not found');
    }

    // Team leader cannot leave, must delete team instead
    if (team.leaderId === userId) {
        throw new ApiError(400, 'Team leader cannot leave. Delete the team instead.');
    }

    // Find membership
    const membership = await prisma.teamMembership.findFirst({
        where: {
            userId,
            teamId,
            status: MembershipStatus.APPROVED
        }
    });

    if (!membership) {
        throw new ApiError(404, 'You are not a member of this team');
    }

    // Prevent leaving during contest
    if (team.room.status === RoomStatus.IN_PROGRESS) {
        throw new ApiError(400, 'Cannot leave team while contest is in progress');
    }

    // Update membership status
    await prisma.teamMembership.update({
        where: { id: membership.id },
        data: {
            status: MembershipStatus.LEFT
        }
    });

    logger.info(`User ${userId} left team ${teamId}`);

    res.status(200).json(
        new ApiResponse(200, 'Left team successfully')
    );
});

/**
 * Remove Member Controller
 * ----------------------
 * Leader removes a member from team
 */
export const RemoveMemberController = asyncHandler(async (req, res, next) => {
    const { teamId, userId: targetUserId } = req.params;
    const userId = req.user.id;

    logger.info(`User ${userId} attempting to remove user ${targetUserId} from team ${teamId}`);

    // Check if user is team leader
    const isLeader = await isUserTeamLeader(userId, teamId);
    if (!isLeader) {
        throw new ApiError(403, 'Only team leader can remove members');
    }

    // Cannot remove self
    if (userId === parseInt(targetUserId)) {
        throw new ApiError(400, 'Cannot remove yourself. Delete the team instead.');
    }

    const team = await prisma.team.findUnique({
        where: { id: teamId },
        select: {
            room: {
                select: { status: true }
            }
        }
    });

    // Prevent removal during contest
    if (team.room.status === RoomStatus.IN_PROGRESS) {
        throw new ApiError(400, 'Cannot remove members while contest is in progress');
    }

    // Find membership
    const membership = await prisma.teamMembership.findFirst({
        where: {
            userId: parseInt(targetUserId),
            teamId,
            status: MembershipStatus.APPROVED
        }
    });

    if (!membership) {
        throw new ApiError(404, 'Member not found in this team');
    }

    // Delete membership
    await prisma.teamMembership.delete({
        where: { id: membership.id }
    });

    logger.info(`User ${targetUserId} removed from team ${teamId}`);

    res.status(200).json(
        new ApiResponse(200, 'Member removed successfully')
    );
});

/**
 * Get Team Statistics Controller
 * -----------------------------
 * Retrieves team statistics
 */
export const GetTeamStatisticsController = asyncHandler(async (req, res, next) => {
    const { teamId } = req.params;

    logger.info(`Fetching statistics for team: ${teamId}`);

    const statistics = await getTeamStatistics(teamId);

    logger.info(`Statistics retrieved for team: ${teamId}`);

    res.status(200).json(
        new ApiResponse(200, 'Team statistics retrieved successfully', statistics)
    );
});

/**
 * Get Pending Memberships Controller
 * ---------------------------------
 * Get all pending membership requests for a team
 */
export const GetPendingMembershipsController = asyncHandler(async (req, res, next) => {
    const { teamId } = req.params;
    const userId = req.user.id;

    logger.info(`Fetching pending memberships for team: ${teamId}`);

    // Check if user is team leader
    const isLeader = await isUserTeamLeader(userId, teamId);
    if (!isLeader) {
        throw new ApiError(403, 'Only team leader can view pending memberships');
    }

    const pendingMemberships = await prisma.teamMembership.findMany({
        where: {
            teamId,
            status: MembershipStatus.PENDING
        },
        include: {
            user: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true
                }
            }
        },
        orderBy: {
            joinedAt: 'asc'
        }
    });

    res.status(200).json(
        new ApiResponse(200, 'Pending memberships retrieved successfully', pendingMemberships)
    );
});