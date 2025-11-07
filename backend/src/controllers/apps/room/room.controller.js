import { createRoomController } from "../../../models/apps/room/room.model";
import prisma from "../../../db/index.js";
import { ApiError } from "../../../utils/ApiError.js";
import {asyncHandler} from "../../../utils/asyncHandler.js";
import crypto from "crypto";
import logger from "../../../logger/winston.logger.js";


export const CreateRoomController = asyncHandler(async (req, res, next) => {
    const {
        name,
        password,
        maxTeams,
        maxTeamSize,
        duration,
        status,
        startTime,
        endTime
    } = req.body;
    
    const adminToken = crypto.randomBytes(16).toString('hex');
    const createdById = req.user.id;
    const roomData = {
        name,
        password,   
        maxTeams,
        maxTeamSize,
        duration,
        status,
        startTime,
        endTime,
        adminToken,
        createdById
    };
    
    const room = await createRoomController(roomData);

    logger.info(`Room created with ID: ${room.id} by User ID: ${createdById}`);
    res.status(201).json({
        success: true,
        data: room
    });
});
