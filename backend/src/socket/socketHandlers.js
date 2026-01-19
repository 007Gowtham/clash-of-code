const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');

module.exports = (io) => {
    // Socket authentication middleware
    io.use(async (socket, next) => {
        try {
            const token = socket.handshake.auth.token;

            if (!token) {
                return next(new Error('Authentication error: Token required'));
            }

            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    username: true,
                    email: true,
                    role: true,
                },
            });

            if (!user) {
                return next(new Error('Authentication error: User not found'));
            }

            socket.user = user;
            next();
        } catch (error) {
            next(new Error('Authentication error: Invalid token'));
        }
    });

    io.on('connection', (socket) => {
        console.log(`✅ User connected: ${socket.user.username} (${socket.id})`);

        // Join room channel
        socket.on('join-room', async (data) => {
            const { roomId } = data;
            socket.join(`room:${roomId}`);
            socket.emit('room-joined', { roomId, message: 'Joined room successfully' });
            console.log(`User ${socket.user.username} joined room ${roomId}`);
        });

        // Leave room channel
        socket.on('leave-room', (data) => {
            const { roomId } = data;
            socket.leave(`room:${roomId}`);
            console.log(`User ${socket.user.username} left room ${roomId}`);
        });

        // Join team channel
        socket.on('join-team', async (data) => {
            const { teamId } = data;
            socket.join(`team:${teamId}`);
            socket.emit('team-joined', { teamId, message: 'Joined team channel' });

            // Notify other team members
            socket.to(`team:${teamId}`).emit('team:member-joined', {
                teamId,
                member: {
                    userId: socket.user.id,
                    username: socket.user.username,
                    joinedAt: new Date(),
                },
            });

            console.log(`User ${socket.user.username} joined team ${teamId}`);
        });

        // Leave team channel
        socket.on('leave-team', (data) => {
            const { teamId } = data;
            socket.leave(`team:${teamId}`);

            // Notify other team members
            socket.to(`team:${teamId}`).emit('team:member-left', {
                teamId,
                userId: socket.user.id,
                username: socket.user.username,
            });

            console.log(`User ${socket.user.username} left team ${teamId}`);
        });

        // Start coding notification
        socket.on('start-coding', (data) => {
            const { questionId, teamId, language } = data;

            socket.to(`team:${teamId}`).emit('teammate:coding-started', {
                teamId,
                userId: socket.user.id,
                username: socket.user.username,
                questionId,
                language,
                startedAt: new Date(),
            });
        });

        // Stop coding notification
        socket.on('stop-coding', (data) => {
            const { questionId, teamId } = data;

            socket.to(`team:${teamId}`).emit('teammate:coding-stopped', {
                teamId,
                userId: socket.user.id,
                username: socket.user.username,
                questionId,
            });
        });

        // Code update (real-time code sharing)
        socket.on('code-update', (data) => {
            const { questionId, teamId, code, language, cursorPosition } = data;

            socket.to(`team:${teamId}`).emit('teammate:code-update', {
                teamId,
                userId: socket.user.id,
                username: socket.user.username,
                questionId,
                code,
                language,
                cursorPosition,
                timestamp: new Date(),
            });
        });

        // Typing indicator
        socket.on('typing', (data) => {
            const { teamId, isTyping } = data;

            socket.to(`team:${teamId}`).emit('teammate:typing', {
                teamId,
                userId: socket.user.id,
                username: socket.user.username,
                isTyping,
            });
        });

        // --- Assignment Workflow Handlers ---

        // Request assignment (Member -> Leader)
        socket.on('assignment:request', async (data) => {
            const { teamId, questionId, questionTitle } = data;

            try {
                // Check if user already has an assigned question
                const existingAssignment = await prisma.questionAssignment.findFirst({
                    where: {
                        teamId,
                        userId: socket.user.id,
                        status: 'ASSIGNED'
                    }
                });

                if (existingAssignment) {
                    return socket.emit('assignment:error', {
                        message: 'You already have a question assigned. Complete it first.'
                    });
                }

                // Check if question is already assigned to someone else
                const questionAssignment = await prisma.questionAssignment.findFirst({
                    where: {
                        questionId,
                        teamId,
                        status: 'ASSIGNED'
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true
                            }
                        }
                    }
                });

                if (questionAssignment && questionAssignment.userId) {
                    return socket.emit('assignment:error', {
                        message: `This question is already assigned to ${questionAssignment.user.username}`
                    });
                }

                // Check if there's already a pending request for this question from this user
                const existingRequest = await prisma.questionRequest.findFirst({
                    where: {
                        questionId,
                        teamId,
                        requesterId: socket.user.id,
                        status: 'PENDING'
                    }
                });

                if (existingRequest) {
                    return socket.emit('assignment:error', {
                        message: 'You already have a pending request for this question'
                    });
                }

                // Create the request
                const request = await prisma.questionRequest.create({
                    data: {
                        questionId,
                        teamId,
                        requesterId: socket.user.id,
                        status: 'PENDING'
                    }
                });

                // Broadcast to team channel (Frontend filters for Leader)
                io.to(`team:${teamId}`).emit('assignment:request_received', {
                    id: request.id,
                    teamId,
                    questionId,
                    questionTitle,
                    requesterId: socket.user.id,
                    requesterName: socket.user.username,
                    timestamp: new Date()
                });

                // Confirm to requester
                socket.emit('assignment:request_sent', {
                    questionId,
                    message: 'Request sent to team leader'
                });

            } catch (error) {
                console.error('Error creating assignment request:', error);
                socket.emit('assignment:error', { message: 'Failed to create request' });
            }
        });

        // Approve assignment (Leader -> Team)
        socket.on('assignment:approve', async (data) => {
            const { teamId, questionId, requesterId, requestId } = data;

            try {
                // Verify the user is the team leader
                const team = await prisma.team.findUnique({
                    where: { id: teamId },
                    select: { leaderId: true }
                });

                if (!team || team.leaderId !== socket.user.id) {
                    return socket.emit('assignment:error', {
                        message: 'Only team leader can approve requests'
                    });
                }

                // Check if requester already has an assigned question
                const existingAssignment = await prisma.questionAssignment.findFirst({
                    where: {
                        teamId,
                        userId: requesterId,
                        status: 'ASSIGNED'
                    }
                });

                if (existingAssignment) {
                    return socket.emit('assignment:error', {
                        message: 'User already has a question assigned'
                    });
                }

                // Check if question is already assigned to someone else
                const questionAssignment = await prisma.questionAssignment.findFirst({
                    where: {
                        questionId,
                        teamId,
                        status: 'ASSIGNED'
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true
                            }
                        }
                    }
                });

                if (questionAssignment && questionAssignment.userId) {
                    return socket.emit('assignment:error', {
                        message: `Question already assigned to ${questionAssignment.user.username}`
                    });
                }

                // Update the request status
                if (requestId) {
                    await prisma.questionRequest.update({
                        where: { id: requestId },
                        data: { status: 'APPROVED' }
                    });
                }

                // Update or create assignment
                const assignment = await prisma.questionAssignment.upsert({
                    where: {
                        questionId_teamId: {
                            questionId,
                            teamId
                        }
                    },
                    update: {
                        userId: requesterId,
                        status: 'ASSIGNED',
                        assignedAt: new Date()
                    },
                    create: {
                        questionId,
                        teamId,
                        userId: requesterId,
                        status: 'ASSIGNED',
                        assignedAt: new Date()
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true
                            }
                        }
                    }
                });

                // Notify team
                io.to(`team:${teamId}`).emit('assignment:updated', {
                    questionId,
                    assignedUserId: requesterId,
                    assignedUserName: assignment.user.username,
                    status: 'ASSIGNED',
                    timestamp: new Date()
                });

            } catch (error) {
                console.error('Error approving assignment:', error);
                socket.emit('assignment:error', { message: 'Failed to approve assignment' });
            }
        });

        // Reject assignment (Leader -> Team)
        socket.on('assignment:reject', async (data) => {
            const { teamId, questionId, requesterId, requestId } = data;

            try {
                // Verify the user is the team leader
                const team = await prisma.team.findUnique({
                    where: { id: teamId },
                    select: { leaderId: true }
                });

                if (!team || team.leaderId !== socket.user.id) {
                    return socket.emit('assignment:error', {
                        message: 'Only team leader can reject requests'
                    });
                }

                // Update the request status
                if (requestId) {
                    await prisma.questionRequest.update({
                        where: { id: requestId },
                        data: { status: 'REJECTED' }
                    });
                }

                // Notify team (so requester sees rejection and cooldown starts)
                io.to(`team:${teamId}`).emit('assignment:rejected', {
                    questionId,
                    requesterId,
                    timestamp: new Date()
                });

            } catch (error) {
                console.error('Error rejecting assignment:', error);
                socket.emit('assignment:error', { message: 'Failed to reject request' });
            }
        });

        // Direct assignment by leader (Leader -> Team)
        socket.on('assignment:direct', async (data) => {
            const { teamId, questionId, userId } = data;

            try {
                // Verify the user is the team leader
                const team = await prisma.team.findUnique({
                    where: { id: teamId },
                    select: { leaderId: true }
                });

                if (!team || team.leaderId !== socket.user.id) {
                    return socket.emit('assignment:error', {
                        message: 'Only team leader can directly assign questions'
                    });
                }

                // Check if user already has an assigned question
                const existingAssignment = await prisma.questionAssignment.findFirst({
                    where: {
                        teamId,
                        userId,
                        status: 'ASSIGNED'
                    }
                });

                if (existingAssignment) {
                    return socket.emit('assignment:error', {
                        message: 'User already has a question assigned'
                    });
                }

                // Check if question is already assigned to someone else
                const questionAssignment = await prisma.questionAssignment.findFirst({
                    where: {
                        questionId,
                        teamId,
                        status: 'ASSIGNED'
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true
                            }
                        }
                    }
                });

                if (questionAssignment && questionAssignment.userId) {
                    return socket.emit('assignment:error', {
                        message: `Question already assigned to ${questionAssignment.user.username}`
                    });
                }

                // Update or create assignment
                const assignment = await prisma.questionAssignment.upsert({
                    where: {
                        questionId_teamId: {
                            questionId,
                            teamId
                        }
                    },
                    update: {
                        userId,
                        status: 'ASSIGNED',
                        assignedAt: new Date()
                    },
                    create: {
                        questionId,
                        teamId,
                        userId,
                        status: 'ASSIGNED',
                        assignedAt: new Date()
                    },
                    include: {
                        user: {
                            select: {
                                id: true,
                                username: true
                            }
                        }
                    }
                });

                // Notify team
                io.to(`team:${teamId}`).emit('assignment:updated', {
                    questionId,
                    assignedUserId: userId,
                    assignedUserName: assignment.user.username,
                    status: 'ASSIGNED',
                    timestamp: new Date()
                });

            } catch (error) {
                console.error('Error with direct assignment:', error);
                socket.emit('assignment:error', { message: 'Failed to assign question' });
            }
        });


        // Disconnect
        socket.on('disconnect', () => {
            console.log(`❌ User disconnected: ${socket.user.username} (${socket.id})`);
        });
    });

    // Helper function to emit events from controllers
    io.emitToRoom = (roomId, event, data) => {
        io.to(`room:${roomId}`).emit(event, data);
    };

    io.emitToTeam = (teamId, event, data) => {
        io.to(`team:${teamId}`).emit(event, data);
    };

    return io;
};
