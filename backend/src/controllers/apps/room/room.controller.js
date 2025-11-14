import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { prisma } from "../../../db/index.js";
import { RoomStatus } from "../../../constants.js";
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import logger from "../../../logger/winston.logger.js";
import { 
    isRoomPasswordCorrect, 
    getRoomStatistics,
    isValidStatusTransition 
} from "../../../models/apps/room/room.model.js";

/**
 * Create Room Controller
 * ---------------------
 * Creates a new room with hashed password and admin token
 */
export const CreateRoomController = asyncHandler(async (req, res, next) => {
    const { name, password, maxTeams, maxTeamSize, duration } = req.body;
    const userId = req.user.id;

    logger.info(`User ${userId} attempting to create room: ${name}`);

    // Hash the room password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate admin token
    const adminToken = jwt.sign(
        { type: 'admin', userId, roomName: name },
        process.env.JWT_SECRET,
        { expiresIn: '7d' }
    );

    // Create room
    const room = await prisma.room.create({
        data: {
            name,
            password: hashedPassword,
            maxTeams,
            maxTeamSize,
            duration,
            status: RoomStatus.WAITING,
            createdById: userId,
            adminToken,
        },
        include: {
            createdBy: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                    avatar: true,
                }
            }
        }
    });

    logger.info(`Room created successfully with ID: ${room.id}`);

    res.status(201).json(
        new ApiResponse(201, 'Room created successfully', {
            room,
            adminToken
        })
    );
});

/**
 * Update Room Controller
 * ---------------------
 * Updates room details (only creator can update)
 */
export const UpdateRoomController = asyncHandler(async (req, res, next) => {
    const { roomId } = req.params;
    const userId = req.user.id;
    const { name, maxTeams, maxTeamSize, duration } = req.body;

    logger.info(`User ${userId} attempting to update room: ${roomId}`);

    // Find room
    const room = await prisma.room.findUnique({
        where: { id: roomId },
    });

    if (!room) {
        throw new ApiError(404, 'Room not found');
    }

    // Check if user is the creator
    if (room.createdById !== userId) {
        throw new ApiError(403, 'You are not authorized to update this room');
    }

    // Prevent updates if room is in progress or completed
    if (room.status === RoomStatus.IN_PROGRESS || room.status === RoomStatus.COMPLETED) {
        throw new ApiError(400, 'Cannot update a room that is in progress or completed');
    }

    // Build update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (maxTeams !== undefined) updateData.maxTeams = maxTeams;
    if (maxTeamSize !== undefined) updateData.maxTeamSize = maxTeamSize;
    if (duration !== undefined) updateData.duration = duration;

    // Update room
    const updatedRoom = await prisma.room.update({
        where: { id: roomId },
        data: updateData,
        include: {
            createdBy: {
                select: {
                    id: true,
                    email: true,
                    name: true,
                    avatar: true,
                }
            }
        }
    });

    logger.info(`Room ${roomId} updated successfully`);

    res.status(200).json(
        new ApiResponse(200, 'Room updated successfully', updatedRoom)
    );
});

/**
 * Delete Room Controller
 * ---------------------
 * Deletes a room (only creator can delete)
 */
export const DeleteRoomController = asyncHandler(async (req, res, next) => {
    const { roomId } = req.params;
    const userId = req.user.id;

    logger.info(`User ${userId} attempting to delete room: ${roomId}`);

    // Find room
    const room = await prisma.room.findUnique({
        where: { id: roomId },
        select: {
            id: true,
            name: true,
            createdById: true,
            status: true,
        }
    });

    if (!room) {
        throw new ApiError(404, 'Room not found');
    }

    // Check if user is the creator
    if (room.createdById !== userId) {
        throw new ApiError(403, 'You are not authorized to delete this room');
    }

    // Prevent deletion of in-progress rooms
    if (room.status === RoomStatus.IN_PROGRESS) {
        throw new ApiError(400, 'Cannot delete a room that is in progress');
    }

    // Delete room (cascade will handle related records)
    await prisma.room.delete({
        where: { id: roomId }
    });

    logger.info(`Room ${roomId} deleted successfully by user ${userId}`);

    res.status(200).json(
        new ApiResponse(200, 'Room deleted successfully', { 
            roomId: room.id, 
            name: room.name 
        })
    );
});

/**
 * List Rooms Controller
 * --------------------
 * Retrieves paginated list of rooms with filters
 */
export const ListRoomsController = asyncHandler(async (req, res, next) => {
    const { 
        page = 1, 
        limit = 10, 
        status, 
        search 
    } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    logger.info(`Fetching rooms - Page: ${pageNum}, Limit: ${limitNum}`);

    // Build where clause
    const whereClause = {};

    if (status) {
        whereClause.status = status;
    }

    if (search) {
        whereClause.name = {
            contains: search,
            mode: 'insensitive'
        };
    }

    // Get total count
    const totalRooms = await prisma.room.count({
        where: whereClause
    });

    // Get rooms with pagination
    const rooms = await prisma.room.findMany({
        where: whereClause,
        skip,
        take: limitNum,
        orderBy: {
            createdAt: 'desc'
        },
        include: {
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                }
            },
            teams: {
                select: {
                    id: true,
                    name: true,
                }
            },
            _count: {
                select: {
                    teams: true,
                    questions: true,
                    memberships: true,
                }
            }
        }
    });

    const totalPages = Math.ceil(totalRooms / limitNum);

    logger.info(`Retrieved ${rooms.length} rooms out of ${totalRooms} total`);

    res.status(200).json(
        new ApiResponse(200, 'Rooms retrieved successfully', {
            rooms,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalRooms,
                limit: limitNum,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1,
            }
        })
    );
});

/**
 * Get Room By ID Controller
 * ------------------------
 * Retrieves detailed information about a specific room
 */
export const GetRoomByIdController = asyncHandler(async (req, res, next) => {
    const { roomId } = req.params;

    logger.info(`Fetching room details for ID: ${roomId}`);

    const room = await prisma.room.findUnique({
        where: { id: roomId },
        include: {
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                    avatar: true,
                }
            },
            teams: {
                select: {
                    id: true,
                    name: true,
                    totalScore: true,
                    rank: true,
                    _count: {
                        select: {
                            memberships: true,
                        }
                    }
                },
                orderBy: {
                    totalScore: 'desc'
                }
            },
            questions: {
                select: {
                    id: true,
                    title: true,
                    difficulty: true,
                    points: true,
                    topic: true,
                }
            },
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

    logger.info(`Room ${roomId} details retrieved successfully`);

    res.status(200).json(
        new ApiResponse(200, 'Room retrieved successfully', room)
    );
});

/**
 * Get My Rooms Controller
 * ----------------------
 * Retrieves rooms created by the current user
 */
export const GetMyRoomsController = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const { page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);
    const skip = (pageNum - 1) * limitNum;

    logger.info(`Fetching rooms created by user ${userId}`);

    const totalRooms = await prisma.room.count({
        where: { createdById: userId }
    });

    const rooms = await prisma.room.findMany({
        where: { createdById: userId },
        skip,
        take: limitNum,
        orderBy: {
            createdAt: 'desc'
        },
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

    const totalPages = Math.ceil(totalRooms / limitNum);

    res.status(200).json(
        new ApiResponse(200, 'Your rooms retrieved successfully', {
            rooms,
            pagination: {
                currentPage: pageNum,
                totalPages,
                totalRooms,
                limit: limitNum,
                hasNextPage: pageNum < totalPages,
                hasPrevPage: pageNum > 1,
            }
        })
    );
});

/**
 * Verify Room Password Controller
 * ------------------------------
 * Verifies room password before allowing access
 */
export const VerifyRoomPasswordController = asyncHandler(async (req, res, next) => {
    const { roomId } = req.params;
    const { password } = req.body;

    logger.info(`Verifying password for room: ${roomId}`);

    const room = await prisma.room.findUnique({
        where: { id: roomId },
        select: {
            id: true,
            name: true,
            password: true,
            status: true,
        }
    });

    if (!room) {
        throw new ApiError(404, 'Room not found');
    }

    const isPasswordValid = await isRoomPasswordCorrect(room.password, password);

    if (!isPasswordValid) {
        throw new ApiError(401, 'Incorrect room password');
    }

    logger.info(`Password verified successfully for room: ${roomId}`);

    res.status(200).json(
        new ApiResponse(200, 'Password verified successfully', {
            roomId: room.id,
            roomName: room.name,
            verified: true
        })
    );
});

/**
 * Start Room Controller
 * -------------------
 * Starts a room (changes status to IN_PROGRESS)
 */
export const StartRoomController = asyncHandler(async (req, res, next) => {
    const { roomId } = req.params;
    const userId = req.user.id;
    const { startTime } = req.body;

    logger.info(`User ${userId} attempting to start room: ${roomId}`);

    const room = await prisma.room.findUnique({
        where: { id: roomId }
    });

    if (!room) {
        throw new ApiError(404, 'Room not found');
    }

    if (room.createdById !== userId) {
        throw new ApiError(403, 'You are not authorized to start this room');
    }

    if (room.status !== RoomStatus.WAITING) {
        throw new ApiError(400, `Cannot start room with status: ${room.status}`);
    }

    const now = new Date();
    const start = startTime ? new Date(startTime) : now;
    const end = new Date(start.getTime() + room.duration * 60000);

    const updatedRoom = await prisma.room.update({
        where: { id: roomId },
        data: {
            status: RoomStatus.IN_PROGRESS,
            startTime: start,
            endTime: end,
        },
        include: {
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                }
            }
        }
    });

    logger.info(`Room ${roomId} started successfully`);

    res.status(200).json(
        new ApiResponse(200, 'Room started successfully', updatedRoom)
    );
});

/**
 * Update Room Status Controller
 * ----------------------------
 * Updates room status with validation
 */
export const UpdateRoomStatusController = asyncHandler(async (req, res, next) => {
    const { roomId } = req.params;
    const userId = req.user.id;
    const { status } = req.body;

    logger.info(`User ${userId} attempting to update room ${roomId} status to: ${status}`);

    const room = await prisma.room.findUnique({
        where: { id: roomId }
    });

    if (!room) {
        throw new ApiError(404, 'Room not found');
    }

    if (room.createdById !== userId) {
        throw new ApiError(403, 'You are not authorized to update this room status');
    }

    if (!isValidStatusTransition(room.status, status)) {
        throw new ApiError(400, `Invalid status transition from ${room.status} to ${status}`);
    }

    const updateData = { status };
    
    // Set endTime if completing the room
    if (status === RoomStatus.COMPLETED && !room.endTime) {
        updateData.endTime = new Date();
    }

    const updatedRoom = await prisma.room.update({
        where: { id: roomId },
        data: updateData,
        include: {
            createdBy: {
                select: {
                    id: true,
                    name: true,
                    email: true,
                }
            }
        }
    });

    logger.info(`Room ${roomId} status updated to: ${status}`);

    res.status(200).json(
        new ApiResponse(200, 'Room status updated successfully', updatedRoom)
    );
});

/**
 * Get Room Statistics Controller
 * -----------------------------
 * Retrieves comprehensive room statistics
 */
export const GetRoomStatisticsController = asyncHandler(async (req, res, next) => {
    const { roomId } = req.params;

    logger.info(`Fetching statistics for room: ${roomId}`);

    const statistics = await getRoomStatistics(roomId);

    logger.info(`Statistics retrieved for room: ${roomId}`);

    res.status(200).json(
        new ApiResponse(200, 'Room statistics retrieved successfully', statistics)
    );
});