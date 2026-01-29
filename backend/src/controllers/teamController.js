const { prisma } = require('../config/database');
const { successResponse, errorResponse } = require('../utils/responseFormatter');
const { generateTeamCode } = require('../utils/generateCode');

// Create Team
exports.createTeam = async (req, res, next) => {
    try {
        const { name, roomId, visibility = 'PUBLIC' } = req.body;

        // Check if room exists
        const room = await prisma.room.findUnique({
            where: { id: roomId },
        });

        if (!room) {
            return errorResponse(res, 'Room not found', 404);
        }

        // Check for duplicate team name in this room
        const existingTeamName = await prisma.team.findFirst({
            where: {
                roomId,
                name
            }
        });

        if (existingTeamName) {
            return errorResponse(res, 'Team name already exists in this room', 400);
        }

        if (room.status !== 'WAITING') {
            return errorResponse(res, 'Cannot create team after room has started', 400);
        }

        // Check if user is already in a team in this room
        const existingMembership = await prisma.teamMember.findFirst({
            where: {
                userId: req.user.id,
                team: {
                    roomId,
                },
            },
        });

        if (existingMembership) {
            return errorResponse(res, 'You are already in a team in this room', 400);
        }

        // Generate team code for private teams
        const teamCode = visibility === 'PRIVATE' ? generateTeamCode(name) : null;

        // Create team
        const team = await prisma.team.create({
            data: {
                name,
                roomId,
                leaderId: req.user.id,
                visibility,
                code: teamCode,
            },
            include: {
                leader: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
        });

        // Add leader as team member
        const member = await prisma.teamMember.create({
            data: {
                teamId: team.id,
                userId: req.user.id,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
        });

        // TODO: Create RoomEvent for team creation
        // TODO: Emit socket event

        return successResponse(
            res,
            {
                id: team.id,
                name: team.name,
                code: team.code,
                roomId: team.roomId,
                leaderId: team.leaderId,
                visibility: team.visibility,
                totalPoints: team.totalPoints,
                members: [
                    {
                        id: member.id,
                        userId: member.user.id,
                        username: member.user.username,
                        role: 'TEAM_LEADER',
                        joinedAt: member.joinedAt,
                    },
                ],
                createdAt: team.createdAt,
            },
            'Team created successfully',
            201
        );
    } catch (error) {
        next(error);
    }
};

// Get Teams in Room
exports.getTeamsInRoom = async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const { visibility, search } = req.query;

        const room = await prisma.room.findUnique({
            where: { id: roomId },
            select: { settings: true }
        });
        const maxMembers = room?.settings?.maxTeamSize || 100;

        const where = { roomId };
        if (visibility) {
            where.visibility = visibility;
        }
        if (search) {
            where.name = {
                contains: search,
            };
        }

        const teams = await prisma.team.findMany({
            where,
            include: {
                leader: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                            },
                        },
                    },
                },
                assignments: {
                    where: {
                        status: 'SOLVED',
                    },
                },
                joinRequests: {
                    where: {
                        userId: req.user.id,
                        status: 'PENDING',
                    },
                },
            },
            orderBy: {
                totalPoints: 'desc',
            },
        });

        const formattedTeams = teams.map((team) => {
            const isMember = team.members.some((m) => m.userId === req.user.id);
            const hasPendingRequest = team.joinRequests.length > 0;

            return {
                id: team.id,
                name: team.name,
                code: isMember ? team.code : undefined, // Only show code to members
                leaderId: team.leaderId,
                leaderName: team.leader.username,
                visibility: team.visibility,
                totalPoints: team.totalPoints,
                membersCount: team.members.length,
                maxMembers,
                members: team.members.map(m => ({
                    userId: m.userId,
                    username: m.user.username,
                    joinedAt: m.joinedAt
                })),
                questionsSolved: team.assignments.length,
                canJoin: !isMember && team.visibility === 'PUBLIC',
                isPending: hasPendingRequest,
                isMember,
            };
        });

        return successResponse(res, {
            teams: formattedTeams,
            totalTeams: formattedTeams.length,
        });
    } catch (error) {
        next(error);
    }
};

// Get Team Details
exports.getTeamDetails = async (req, res, next) => {
    try {
        const { teamId } = req.params;

        const team = await prisma.team.findUnique({
            where: { id: teamId },
            include: {
                room: {
                    select: {
                        id: true,
                        name: true,
                    },
                },
                leader: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
                members: {
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true,
                                email: true,
                            },
                        },
                    },
                },
                assignments: {
                    include: {
                        question: {
                            select: {
                                id: true,
                                title: true,
                                difficulty: true,
                                points: true,
                            },
                        },
                        user: {
                            select: {
                                id: true,
                                username: true,
                            },
                        },
                    },
                },
                joinRequests: {
                    where: {
                        status: 'PENDING',
                    },
                },
            },
        });

        if (!team) {
            return errorResponse(res, 'Team not found', 404);
        }

        const isMember = team.members.some((m) => m.userId === req.user.id);
        const isLeader = team.leaderId === req.user.id;

        // Calculate rank
        const allTeams = await prisma.team.findMany({
            where: { roomId: team.roomId },
            orderBy: { totalPoints: 'desc' },
            select: { id: true },
        });
        const rank = allTeams.findIndex((t) => t.id === team.id) + 1;

        const formattedMembers = team.members.map((m) => ({
            id: m.id,
            userId: m.user.id,
            username: m.user.username,
            email: m.user.email,
            joinedAt: m.joinedAt,
            questionsSolved: team.assignments.filter((a) => a.userId === m.userId && a.status === 'SOLVED').length,
            individualPoints: team.assignments
                .filter((a) => a.userId === m.userId && a.status === 'SOLVED')
                .reduce((sum, a) => sum + a.pointsEarned, 0),
        }));

        const formattedAssignments = team.assignments.map((a) => ({
            id: a.id,
            questionId: a.question.id,
            questionTitle: a.question.title,
            difficulty: a.question.difficulty,
            points: a.question.points,
            status: a.status,
            assignedTo: a.user
                ? {
                    userId: a.user.id,
                    username: a.user.username,
                }
                : null,
            assignedAt: a.assignedAt,
            solvedAt: a.solvedAt,
            pointsEarned: a.pointsEarned,
        }));

        return successResponse(res, {
            id: team.id,
            name: team.name,
            roomId: team.roomId,
            roomName: team.room.name,
            leaderId: team.leaderId,
            visibility: team.visibility,
            totalPoints: team.totalPoints,
            rank,
            leader: team.leader,
            members: formattedMembers,
            assignments: formattedAssignments,
            pendingRequests: team.joinRequests.length,
            isLeader,
            isMember,
            createdAt: team.createdAt,
        });
    } catch (error) {
        next(error);
    }
};

// Join Team (Unified - handles both public and private with optional code)
exports.joinTeam = async (req, res, next) => {
    try {
        const { teamId } = req.params;
        const { code } = req.body; // Optional code from request body

        const team = await prisma.team.findUnique({
            where: { id: teamId },
            include: {
                room: true,
                members: true,
            },
        });

        if (!team) {
            return errorResponse(res, 'Team not found', 404);
        }

        // Check if room has started
        if (team.room.status !== 'WAITING') {
            return errorResponse(res, 'Cannot join team after room has started', 400);
        }

        // Check if already a member
        const existingMember = team.members.find((m) => m.userId === req.user.id);
        if (existingMember) {
            return errorResponse(res, 'You are already a member of this team', 400);
        }

        // Check if in another team in same room
        const otherTeamMembership = await prisma.teamMember.findFirst({
            where: {
                userId: req.user.id,
                team: {
                    roomId: team.roomId,
                },
            },
        });

        if (otherTeamMembership) {
            return errorResponse(res, 'You are already in a team in this room', 400);
        }

        // Validate code for private teams
        if (team.visibility === 'PRIVATE') {
            if (!code) {
                return errorResponse(res, 'Team code is required for private teams', 400);
            }

            if (team.code && team.code !== code) {
                return errorResponse(res, 'Invalid team code', 403);
            }
        }

        // Check Team Size Limit
        const maxTeamSize = team.room.settings?.maxTeamSize || 100; // Default to high if not set
        if (team.members.length >= maxTeamSize) {
            return errorResponse(res, `Team is full (Max: ${maxTeamSize})`, 400);
        }

        // Add member
        const member = await prisma.teamMember.create({
            data: {
                teamId,
                userId: req.user.id,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
        });

        // TODO: Emit socket event

        return successResponse(res, {
            team: {
                id: team.id,
                name: team.name,
                roomId: team.roomId,
            },
            member: {
                id: member.id,
                userId: member.user.id,
                username: member.user.username,
                joinedAt: member.joinedAt,
            },
        }, 'Joined team successfully');
    } catch (error) {
        next(error);
    }
};

// Request to Join Team (Private)
exports.requestToJoinTeam = async (req, res, next) => {
    try {
        const { teamId } = req.params;

        const team = await prisma.team.findUnique({
            where: { id: teamId },
            include: {
                room: true,
            },
        });

        if (!team) {
            return errorResponse(res, 'Team not found', 404);
        }

        if (team.room.status !== 'WAITING') {
            return errorResponse(res, 'Cannot request to join after room has started', 400);
        }

        // Check if already has pending request
        const existingRequest = await prisma.joinRequest.findUnique({
            where: {
                teamId_userId: {
                    teamId,
                    userId: req.user.id,
                },
            },
        });

        if (existingRequest) {
            if (existingRequest.status === 'PENDING') {
                return errorResponse(res, 'You already have a pending request for this team', 400);
            }
            if (existingRequest.status === 'ACCEPTED') {
                return errorResponse(res, 'You are already a member of this team', 400);
            }
        }

        const request = await prisma.joinRequest.create({
            data: {
                teamId,
                userId: req.user.id,
                status: 'PENDING',
            },
        });

        // TODO: Emit socket event to team leader

        return successResponse(res, {
            request: {
                id: request.id,
                teamId: request.teamId,
                userId: request.userId,
                status: request.status,
                createdAt: request.createdAt,
            },
        }, 'Join request sent successfully');
    } catch (error) {
        next(error);
    }
};

// Get Join Requests (Team Leader)
exports.getJoinRequests = async (req, res, next) => {
    try {
        const { teamId } = req.params;
        const { status = 'PENDING' } = req.query;

        const team = await prisma.team.findUnique({
            where: { id: teamId },
        });

        if (!team) {
            return errorResponse(res, 'Team not found', 404);
        }

        if (team.leaderId !== req.user.id) {
            return errorResponse(res, 'Only team leader can view join requests', 403);
        }

        const requests = await prisma.joinRequest.findMany({
            where: {
                teamId,
                status,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
            },
            orderBy: {
                createdAt: 'desc',
            },
        });

        const formattedRequests = requests.map((r) => ({
            id: r.id,
            userId: r.user.id,
            username: r.user.username,
            email: r.user.email,
            status: r.status,
            createdAt: r.createdAt,
        }));

        return successResponse(res, {
            requests: formattedRequests,
            totalPending: formattedRequests.filter((r) => r.status === 'PENDING').length,
        });
    } catch (error) {
        next(error);
    }
};

// Accept Join Request
exports.acceptJoinRequest = async (req, res, next) => {
    try {
        const { teamId, requestId } = req.params;

        const team = await prisma.team.findUnique({
            where: { id: teamId },
        });

        if (!team) {
            return errorResponse(res, 'Team not found', 404);
        }

        if (team.leaderId !== req.user.id) {
            return errorResponse(res, 'Only team leader can accept join requests', 403);
        }

        const request = await prisma.joinRequest.findUnique({
            where: { id: requestId },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
        });

        if (!request || request.teamId !== teamId) {
            return errorResponse(res, 'Join request not found', 404);
        }

        if (request.status !== 'PENDING') {
            return errorResponse(res, 'This request has already been processed', 400);
        }

        // Update request status
        await prisma.joinRequest.update({
            where: { id: requestId },
            data: { status: 'ACCEPTED' },
        });

        // Add member to team
        const member = await prisma.teamMember.create({
            data: {
                teamId,
                userId: request.userId,
            },
            include: {
                user: {
                    select: {
                        id: true,
                        username: true,
                    },
                },
            },
        });

        // TODO: Emit socket events

        return successResponse(res, {
            member: {
                id: member.id,
                userId: member.user.id,
                username: member.user.username,
                joinedAt: member.joinedAt,
            },
        }, 'Join request accepted');
    } catch (error) {
        next(error);
    }
};

// Reject Join Request
exports.rejectJoinRequest = async (req, res, next) => {
    try {
        const { teamId, requestId } = req.params;

        const team = await prisma.team.findUnique({
            where: { id: teamId },
        });

        if (!team) {
            return errorResponse(res, 'Team not found', 404);
        }

        if (team.leaderId !== req.user.id) {
            return errorResponse(res, 'Only team leader can reject join requests', 403);
        }

        const request = await prisma.joinRequest.findUnique({
            where: { id: requestId },
        });

        if (!request || request.teamId !== teamId) {
            return errorResponse(res, 'Join request not found', 404);
        }

        await prisma.joinRequest.update({
            where: { id: requestId },
            data: { status: 'REJECTED' },
        });

        // TODO: Emit socket event

        return successResponse(res, {}, 'Join request rejected');
    } catch (error) {
        next(error);
    }
};

// Leave Team
exports.leaveTeam = async (req, res, next) => {
    try {
        const { teamId } = req.params;

        const team = await prisma.team.findUnique({
            where: { id: teamId },
            include: {
                members: {
                    include: {
                        user: true
                    }
                },
                room: true
            }
        });

        if (!team) {
            return errorResponse(res, 'Team not found', 404);
        }

        // If leader leaves, delete the entire team (kicks all members)
        if (team.leaderId === req.user.id) {
            // Check if room is active
            if (team.room.status === 'ACTIVE') {
                return errorResponse(res, 'Cannot leave team while room is active', 400);
            }

            // Delete the team (cascade will remove all members)
            await prisma.team.delete({
                where: { id: teamId }
            });

            // TODO: Emit socket event to all team members
            // io.to(teamId).emit('teamDeleted', {
            //     message: 'Team has been disbanded as the leader left',
            //     teamName: team.name
            // });

            return successResponse(res, {}, 'Team deleted successfully. All members have been removed.');
        }

        // Regular member leaving
        await prisma.teamMember.delete({
            where: {
                teamId_userId: {
                    teamId,
                    userId: req.user.id,
                },
            },
        });

        // TODO: Emit socket event
        // io.to(teamId).emit('memberLeft', {
        //     userId: req.user.id,
        //     username: req.user.username
        // });

        return successResponse(res, {}, 'Left team successfully');
    } catch (error) {
        next(error);
    }
};

// Delete Team
exports.deleteTeam = async (req, res, next) => {
    try {
        const { teamId } = req.params;

        const team = await prisma.team.findUnique({
            where: { id: teamId },
            include: {
                room: true,
            },
        });

        if (!team) {
            return errorResponse(res, 'Team not found', 404);
        }

        if (team.leaderId !== req.user.id) {
            return errorResponse(res, 'Only team leader can delete the team', 403);
        }

        if (team.room.status === 'ACTIVE') {
            return errorResponse(res, 'Cannot delete team while room is active', 400);
        }

        await prisma.team.delete({
            where: { id: teamId },
        });

        return successResponse(res, {}, 'Team deleted successfully');
    } catch (error) {
        next(error);
    }
};

// Kick Member
exports.kickMember = async (req, res, next) => {
    try {
        const { teamId, userId } = req.params;

        if (userId === req.user.id) {
            return errorResponse(res, 'Cannot kick yourself. Use leave team instead.', 400);
        }

        const member = await prisma.teamMember.findUnique({
            where: {
                teamId_userId: {
                    teamId,
                    userId,
                },
            },
        });

        if (!member) {
            return errorResponse(res, 'Member not found in this team', 404);
        }

        await prisma.teamMember.delete({
            where: {
                teamId_userId: {
                    teamId,
                    userId,
                },
            },
        });

        // TODO: Emit socket event

        return successResponse(res, {}, 'Member kicked successfully');
    } catch (error) {
        next(error);
    }
};

module.exports = exports;