import { 
    createRoomValidator,
    updateRoomValidator,
    roomIdValidator,
    listRoomsValidator,
    roomPasswordValidator,
    startRoomValidator,
    updateRoomStatusValidator
} from "../../../validators/apps/room/room.validators.js";
import {
    CreateRoomController,
    UpdateRoomController,
    DeleteRoomController,
    ListRoomsController,
    GetRoomByIdController,
    GetMyRoomsController,
    VerifyRoomPasswordController,
    StartRoomController,
    UpdateRoomStatusController,
    GetRoomStatisticsController
} from "../../../controllers/apps/room/room.controller.js";
import { validate } from "../../../validators/validate.js";
import { Router } from "express";
import verifyToken from "../../../middlewares/auth.middleware.js";
import { roomVerifyToken } from "../../../middlewares/room.admin.middleware.js";

const router = Router();

/**
 * Room Management Routes
 * --------------------
 * Endpoints for creating, managing, and accessing rooms
 * 
 * POST /
 * @header Authorization - Bearer access_token
 * @body {string} name - Room name (3-100 chars)
 * @body {string} password - Room password (min 6 chars)
 * @body {number} maxTeams - Maximum teams (1-100)
 * @body {number} maxTeamSize - Maximum team size (1-10)
 * @body {number} duration - Duration in minutes (15-480)
 * @returns {Object} Created room with admin token
 * 
 * GET /
 * @query {number} [page=1] - Page number
 * @query {number} [limit=10] - Items per page (max 100)
 * @query {string} [status] - Filter by status (WAITING, IN_PROGRESS, COMPLETED, CANCELLED)
 * @query {string} [search] - Search by room name
 * @returns {Object} Paginated list of rooms
 * 
 * GET /my-rooms
 * @header Authorization - Bearer access_token
 * @query {number} [page=1] - Page number
 * @query {number} [limit=10] - Items per page
 * @returns {Object} Paginated list of user's created rooms
 * 
 * GET /:roomId
 * @param {string} roomId - Room ID
 * @returns {Object} Detailed room information
 * 
 * PATCH /:roomId
 * @header Authorization - Bearer access_token
 * @param {string} roomId - Room ID
 * @body {string} [name] - Updated room name
 * @body {number} [maxTeams] - Updated max teams
 * @body {number} [maxTeamSize] - Updated max team size
 * @body {number} [duration] - Updated duration
 * @returns {Object} Updated room data
 * 
 * DELETE /:roomId
 * @header Authorization - Bearer access_token
 * @param {string} roomId - Room ID to delete
 * @returns {Object} Deletion confirmation
 * 
 * POST /:roomId/verify-password
 * @param {string} roomId - Room ID
 * @body {string} password - Room password
 * @returns {Object} Password verification result
 * 
 * POST /:roomId/start
 * @header Authorization - Bearer access_token
 * @param {string} roomId - Room ID
 * @body {string} [startTime] - Optional start time (ISO 8601)
 * @returns {Object} Started room data
 * 
 * PATCH /:roomId/status
 * @header Authorization - Bearer access_token
 * @param {string} roomId - Room ID
 * @body {string} status - New status
 * @returns {Object} Updated room data
 * 
 * GET /:roomId/statistics
 * @header Authorization - Bearer access_token
 * @param {string} roomId - Room ID
 * @returns {Object} Room statistics and analytics
 */
/**
 * @openapi
 * /api/v1/rooms:
 *   get:
 *     tags:
 *       - Rooms
 *     summary: Get all rooms
 *     description: Returns a list of rooms.
 *     responses:
 *       200:
 *         description: List of rooms
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                     example: "room_123"
 *                   name:
 *                     type: string
 *                     example: "DSA Practice Room"
 */
router.route('/')
    .post(verifyToken, createRoomValidator(), validate, CreateRoomController)
    .get(verifyToken,listRoomsValidator(), validate, ListRoomsController);

router.route('/my-rooms')
    .get(verifyToken, listRoomsValidator(), validate, GetMyRoomsController);

router.route('/:roomId')
    .get(verifyToken,roomIdValidator(), validate, GetRoomByIdController)
    .patch(verifyToken, updateRoomValidator(), validate, UpdateRoomController)
    .delete(verifyToken, roomIdValidator(), validate, DeleteRoomController);

/**
 * Room Password Verification Routes
 * --------------------------------
 * Endpoint for verifying room password before joining
 * 
 * POST /:roomId/verify-password
 * @param {string} roomId - Room ID
 * @body {string} password - Room password to verify
 * @returns {Object} Verification result with room access confirmation
 */
router.route('/:roomId/verify-password')
    .post(verifyToken,roomPasswordValidator(), validate, VerifyRoomPasswordController);

/**
 * Room Control Routes
 * -----------------
 * Endpoints for managing room state and lifecycle
 * 
 * POST /:roomId/start
 * @header Authorization - Bearer access_token
 * @param {string} roomId - Room ID to start
 * @body {string} [startTime] - Optional custom start time (ISO 8601 format)
 * @returns {Object} Started room with start/end times
 * 
 * PATCH /:roomId/status
 * @header Authorization - Bearer access_token
 * @param {string} roomId - Room ID
 * @body {string} status - New room status (WAITING, IN_PROGRESS, COMPLETED, CANCELLED)
 * @returns {Object} Room with updated status
 */
router.route('/:roomId/start')
    .post(verifyToken,roomVerifyToken, validate, StartRoomController);

router.route('/:roomId/status')
    .patch(verifyToken, updateRoomStatusValidator(), validate, UpdateRoomStatusController);

/**
 * Room Analytics Routes
 * -------------------
 * Endpoint for retrieving room statistics
 * 
 * GET /:roomId/statistics
 * @header Authorization - Bearer access_token
 * @param {string} roomId - Room ID
 * @returns {Object} Comprehensive room statistics including:
 *   - Total teams, questions, participants
 *   - Submission statistics
 *   - Room status and timing information
 */
router.route('/:roomId/statistics')
    .get(verifyToken, roomIdValidator(), validate, GetRoomStatisticsController);

export default router;                      