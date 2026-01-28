const bcrypt = require('bcryptjs');
const { prisma } = require('../config/database');
const { generateRoomCode, generateInviteLink } = require('../utils/generateCode');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

// Create Room
exports.createRoom = async (req, res, next) => {
    try {
        const {
            roomName,
            mode,
            maxTeamSize,
            duration,
            scoringMode,
            difficulty,
            privacy,
            password,
            leaderApprovalRequired,
            allowSolosInTeamMode,
        } = req.body;

        const existingRoom = await prisma.room.findFirst({
            where: {
                name: roomName,
                status: {
                    in: ['WAITING', 'ACTIVE']
                }
            }
        });

        if (existingRoom) {
            return errorResponse(res, 'Room name already exists', 400);
        }

        // Generate unique room code
        let code;
        let isUnique = false;
        while (!isUnique) {
            code = generateRoomCode();
            const existing = await prisma.room.findUnique({ where: { code } });
            if (!existing) isUnique = true;
        }

        const inviteLink = generateInviteLink(code);

        // Create room
        const room = await prisma.room.create({
            data: {
                name: roomName,
                code,
                inviteLink,
                password: password ? await bcrypt.hash(password, 10) : null,
                adminId: req.user.id,
                status: 'WAITING',
                duration: parseInt(duration),
                settings: {
                    mode,
                    maxTeamSize,
                    scoringMode,
                    difficulty,
                    privacy,
                    leaderApprovalRequired,
                    allowSolosInTeamMode,
                },
            },
        });

        // Seed 5 Template Questions (For Testing) - LeetCode Style
        // Centralized Question Bank Selection Logic
        console.log('User:', req.user); // Debug user

        let config = req.body.problemConfig;
        if (!config && req.body.settings && req.body.settings.difficulty) {
            config = req.body.settings.difficulty;
        }
        if (!config) {
            config = { easy: 1, medium: 2, hard: 1 }; // Default config
        }

        console.log('Problem Config:', config);

        // Helper to pick random questions
        const pickQuestions = async (diff, count) => {
            if (!count || count <= 0) return [];

            // Get all available global questions of this difficulty
            // Global questions have roomId: null
            const questions = await prisma.question.findMany({
                where: {
                    difficulty: diff.toUpperCase(),
                    roomId: null
                },
                select: { id: true }
            });

            if (questions.length < count) {
                // Determine missing counts for better error messaging 
                // but for now, we throw error as per requirements 'Fail early'
                throw new Error(`Not enough ${diff} questions available. Requested: ${count}, Available: ${questions.length}`);
            }

            // Fisher-Yates shuffle
            for (let i = questions.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [questions[i], questions[j]] = [questions[j], questions[i]];
            }

            // Take the first 'count' items
            return questions.slice(0, count).map(q => q.id);
        };

        const easyIds = await pickQuestions('EASY', config.easy);
        const mediumIds = await pickQuestions('MEDIUM', config.medium);
        const hardIds = await pickQuestions('HARD', config.hard);

        const selectedQuestionIds = [...easyIds, ...mediumIds, ...hardIds];

        if (selectedQuestionIds.length === 0) {
            // Rollback room creation if no questions selected (though pickQuestions throws if not enough)
            // But if config was all zeros?
            // The prompt says "Not enough hard problems -> Reject".
            // If user asks for 0, allowed.
            // If total is 0?
            // "Must select at least one question" is reasonable.
            // We can delete the room and return error
            await prisma.room.delete({ where: { id: room.id } });
            return errorResponse(res, 'Must select at least one question', 400);
        }

        // Shuffle the final set of questions (User requirement: "Shuffle after combining difficulties")
        for (let i = selectedQuestionIds.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [selectedQuestionIds[i], selectedQuestionIds[j]] = [selectedQuestionIds[j], selectedQuestionIds[i]];
        }

        // Link questions to room via RoomQuestion (Many-to-Many)
        await Promise.all(selectedQuestionIds.map((qId, index) => {
            return prisma.roomQuestion.create({
                data: {
                    roomId: room.id,
                    questionId: qId,
                    order: index
                }
            });
        }));

        // Fetch full question details for the response
        // Note: findMany does not guarantee order, so we need to map back to selectedQuestionIds
        const selectedQuestions = await prisma.question.findMany({
            where: {
                id: { in: selectedQuestionIds }
            },
            select: {
                id: true,
                title: true,
                difficulty: true,
                points: true,
                slug: true
            }
        });

        // Map back to the shuffled order
        const OrderedQuestionsResponse = selectedQuestionIds.map(id => {
            return selectedQuestions.find(q => q.id === id);
        }).filter(q => q); // filter out undefined just in case

        return successResponse(
            res,
            {
                id: room.id,
                roomName: room.name,
                code: room.code,
                inviteLink: room.inviteLink,
                mode,
                maxTeamSize,
                duration: room.duration,
                scoringMode,
                difficulty,
                privacy,
                hasPassword: !!password,
                status: room.status,
                adminId: room.adminId,
                createdAt: room.createdAt,
                questions: OrderedQuestionsResponse // Include the shuffled questions here
            },
            'Room created successfully',
            201
        );
    } catch (error) {
        next(error);
    }
};

// Get All Rooms
exports.getAllRooms = async (req, res, next) => {
    try {
        const { status, page = 1, limit = 10 } = req.query;
        const skip = (parseInt(page) - 1) * parseInt(limit);

        const where = {};
        if (status) {
            where.status = status;
        }

        const [rooms, totalRooms] = await Promise.all([
            prisma.room.findMany({
                where,
                skip,
                take: parseInt(limit),
                include: {
                    admin: {
                        select: {
                            id: true,
                            username: true,
                        },
                    },
                    teams: {
                        include: {
                            members: true,
                        },
                    },
                    questions: true,
                },
                orderBy: {
                    createdAt: 'desc',
                },
            }),
            prisma.room.count({ where }),
        ]);

        const formattedRooms = rooms.map((room) => ({
            id: room.id,
            name: room.name,
            code: room.code,
            hasPassword: !!room.password,
            status: room.status,
            admin: room.admin,
            teamsCount: room.teams.length,
            totalParticipants: room.teams.reduce((sum, team) => sum + team.members.length, 0),
            questionsCount: room.questions.length,
            duration: room.duration,
            startTime: room.startTime,
            endTime: room.endTime,
            createdAt: room.createdAt,
            settings: room.settings,
        }));

        return successResponse(res, {
            rooms: formattedRooms,
            pagination: {
                currentPage: parseInt(page),
                totalPages: Math.ceil(totalRooms / parseInt(limit)),
                totalRooms,
                hasMore: skip + formattedRooms.length < totalRooms,
            },
        });
    } catch (error) {
        next(error);
    }
};

// Get Room Details
exports.getRoomDetails = async (req, res, next) => {
    try {
        const { roomId } = req.params;
        const { language = 'cpp' } = req.query;

        const room = await prisma.room.findUnique({
            where: { id: roomId },
            include: {
                admin: {
                    select: {
                        id: true,
                        username: true,
                        email: true,
                    },
                },
                teams: {
                    include: {
                        leader: {
                            select: {
                                id: true,
                                username: true,
                            },
                        },
                        members: true,
                        assignments: {
                            where: {
                                status: 'SOLVED',
                            },
                        },
                    },
                },
                questions: {
                    select: {
                        id: true,
                        title: true,
                        difficulty: true,
                        points: true,
                        slug: true,
                        templates: {
                            // Fetch ALL languages
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
                    },
                },
            },
        });

        // Debug logging to verify definition field
        if (room?.questions?.length > 0 && room.questions[0].templates?.length > 0) {
            console.log('Template Definition Check:', room.questions[0].templates[0].definition ? 'PRESENT' : 'MISSING');
        }

        if (!room) {
            return errorResponse(res, 'Room not found', 404);
        }

        // Check if current user is in a team
        let myTeam = null;
        for (const team of room.teams) {
            const isMember = team.members.some((m) => m.userId === req.user.id);
            if (isMember) {
                myTeam = {
                    id: team.id,
                    name: team.name,
                    role: team.leaderId === req.user.id ? 'LEADER' : 'MEMBER',
                };
                break;
            }
        }

        const formattedTeams = room.teams.map((team) => ({
            id: team.id,
            name: team.name,
            leaderId: team.leaderId,
            leaderName: team.leader.username,
            visibility: team.visibility,
            totalPoints: team.totalPoints,
            membersCount: team.members.length,
            questionsSolved: team.assignments.length,
        }));

        // Format questions with flattened template data
        const formattedQuestions = room.questions.map(q => {
            // Group templates by language
            const templatesMap = {};
            if (q.templates) {
                q.templates.forEach(t => {
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

            return {
                id: q.id,
                title: q.title,
                difficulty: q.difficulty,
                points: q.points,
                slug: q.slug,
                // Return all templates
                templates: templatesMap,
                // For backward compatibility (optional, or remove if frontend updated)
                // Defaulting to cpp or first available if needed, but intended usage is `templates[lang]`
            };
        });

        const timeRemaining = room.endTime
            ? Math.max(0, new Date(room.endTime).getTime() - Date.now())
            : null;

        return successResponse(res, {
            id: room.id,
            name: room.name,
            code: room.code,
            inviteLink: room.inviteLink,
            hasPassword: !!room.password,
            status: room.status,
            duration: room.duration,
            startTime: room.startTime,
            endTime: room.endTime,
            timeRemaining,
            admin: room.admin,
            teams: formattedTeams,
            questions: formattedQuestions,
            isAdmin: room.adminId === req.user.id,
            isParticipant: !!myTeam,
            myTeam,
            createdAt: room.createdAt,
            settings: room.settings,
        });
    } catch (error) {
        next(error);
    }
};

// Join Room
exports.joinRoom = async (req, res, next) => {
    try {
        const { code, password } = req.body;

        const room = await prisma.room.findUnique({
            where: { code },
        });

        if (!room) {
            return errorResponse(res, 'Room not found with this code', 404);
        }

        // Check password if room has one
        if (room.password) {
            if (!password) {
                return errorResponse(res, 'Room password required', 401);
            }
            const isValidPassword = await bcrypt.compare(password, room.password);
            if (!isValidPassword) {
                return errorResponse(res, 'Incorrect room password', 401);
            }
        }

        // Check if room has started
        if (room.status === 'ACTIVE') {
            return errorResponse(res, 'Room has already started', 400);
        }

        if (room.status === 'COMPLETED') {
            return errorResponse(res, 'Room has ended', 400);
        }

        return successResponse(res, {
            room: {
                id: room.id,
                roomName: room.name,
                code: room.code,
                status: room.status,
                settings: room.settings,
            },
        }, 'Joined room successfully');
    } catch (error) {
        next(error);
    }
};

// Start Room
exports.startRoom = async (req, res, next) => {
    try {
        const { roomId } = req.params;

        const room = await prisma.room.findUnique({
            where: { id: roomId },
            include: {
                teams: true,
                questions: true,
            },
        });

        if (!room) {
            return errorResponse(res, 'Room not found', 404);
        }

        if (room.adminId !== req.user.id) {
            return errorResponse(res, 'Only room admin can start the room', 403);
        }

        if (room.status !== 'WAITING') {
            return errorResponse(res, 'Room has already started or ended', 400);
        }

        if (room.teams.length === 0) {
            return errorResponse(res, 'Cannot start room without teams', 400);
        }

        if (room.questions.length === 0) {
            return errorResponse(res, 'Cannot start room without questions', 400);
        }

        const startTime = new Date();
        const endTime = new Date(startTime.getTime() + room.duration * 60 * 1000);

        const updatedRoom = await prisma.room.update({
            where: { id: roomId },
            data: {
                status: 'ACTIVE',
                startTime,
                endTime,
            },
        });

        // TODO: Emit socket event to all participants

        return successResponse(res, {
            id: updatedRoom.id,
            status: updatedRoom.status,
            startTime: updatedRoom.startTime,
            endTime: updatedRoom.endTime,
        }, 'Room started successfully');
    } catch (error) {
        next(error);
    }
};

// End Room
exports.endRoom = async (req, res, next) => {
    try {
        const { roomId } = req.params;

        const room = await prisma.room.findUnique({
            where: { id: roomId },
            include: {
                teams: {
                    include: {
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
                            include: {
                                question: {
                                    select: {
                                        title: true,
                                    },
                                },
                            },
                        },
                    },
                },
            },
        });

        if (!room) {
            return errorResponse(res, 'Room not found', 404);
        }

        if (room.adminId !== req.user.id) {
            return errorResponse(res, 'Only room admin can end the room', 403);
        }

        const updatedRoom = await prisma.room.update({
            where: { id: roomId },
            data: {
                status: 'COMPLETED',
                endTime: new Date(),
            },
        });

        // Generate leaderboard
        const leaderboard = room.teams
            .map((team, index) => ({
                rank: index + 1,
                teamId: team.id,
                teamName: team.name,
                totalPoints: team.totalPoints,
                questionsSolved: team.assignments.length,
                members: team.members.map((m) => ({
                    userId: m.user.id,
                    username: m.user.username,
                })),
            }))
            .sort((a, b) => b.totalPoints - a.totalPoints)
            .map((team, index) => ({ ...team, rank: index + 1 }));

        return successResponse(res, {
            id: updatedRoom.id,
            status: updatedRoom.status,
            endTime: updatedRoom.endTime,
            leaderboard,
        }, 'Room ended successfully');
    } catch (error) {
        next(error);
    }
};

// Delete Room
exports.deleteRoom = async (req, res, next) => {
    try {
        const { roomId } = req.params;

        const room = await prisma.room.findUnique({
            where: { id: roomId },
        });

        if (!room) {
            return errorResponse(res, 'Room not found', 404);
        }

        if (room.adminId !== req.user.id) {
            return errorResponse(res, 'Only room admin can delete the room', 403);
        }

        if (room.status === 'ACTIVE') {
            return errorResponse(res, 'Cannot delete an active room', 400);
        }

        await prisma.room.delete({
            where: { id: roomId },
        });

        return successResponse(res, {}, 'Room deleted successfully');
    } catch (error) {
        next(error);
    }
};

module.exports = exports;
