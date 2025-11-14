import { 
    createSolveRequestValidator,
    solveRequestIdValidator,
    teamIdValidator,
    roomIdValidator,
    listSolveRequestsValidator,
    updateSolveRequestStatusValidator,
    bulkActionValidator
} from "../../../validators/apps/solveRequest/solveRequest.validator.js";
import {
    CreateSolveRequestController,
    GetTeamSolveRequestsController,
    GetRoomSolveRequestsController,
    GetSolveRequestByIdController,
    UpdateSolveRequestStatusController,
    DeleteSolveRequestController,
    BulkActionController,
    GetTeamStatisticsController,
    GetRoomStatisticsController,
    GetTeamApprovedQuestionsController
} from "../../../controllers/apps/solveRequest/solveRequest.controller.js";
import { validate } from "../../../validators/validate.js";
import { Router } from "express";
import verifyToken from "../../../middlewares/auth.middleware.js";

const router = Router();

/**
 * Solve Request Management Routes
 * ------------------------------
 * Endpoints for creating and managing solve requests
 * 
 * POST /
 * @header Authorization - Bearer access_token
 * @body {string} teamId - Team ID
 * @body {number} questionId - Question ID
 * @returns {Object} Created solve request
 * 
 * GET /team/:teamId
 * @header Authorization - Bearer access_token
 * @param {string} teamId - Team ID
 * @query {number} [page=1] - Page number
 * @query {number} [limit=10] - Items per page (max 100)
 * @query {string} [status] - Filter by status (PENDING, APPROVED, REJECTED)
 * @returns {Object} Paginated list of team's solve requests
 * 
 * GET /room/:roomId
 * @header Authorization - Bearer access_token
 * @param {string} roomId - Room ID
 * @query {number} [page=1] - Page number
 * @query {number} [limit=10] - Items per page
 * @query {string} [status] - Filter by status
 * @returns {Object} Paginated list of room's solve requests
 * 
 * GET /:requestId
 * @header Authorization - Bearer access_token
 * @param {number} requestId - Request ID
 * @returns {Object} Detailed solve request information
 * 
 * PATCH /:requestId
 * @header Authorization - Bearer access_token
 * @param {number} requestId - Request ID
 * @body {string} status - APPROVED or REJECTED
 * @returns {Object} Updated solve request
 * 
 * DELETE /:requestId
 * @header Authorization - Bearer access_token
 * @param {number} requestId - Request ID to delete
 * @returns {Object} Deletion confirmation
 */

router.route('/')
    .post(verifyToken, createSolveRequestValidator(), validate, CreateSolveRequestController);

router.route('/team/:teamId')
    .get(verifyToken, teamIdValidator(), listSolveRequestsValidator(), validate, GetTeamSolveRequestsController);

router.route('/room/:roomId')
    .get(verifyToken, roomIdValidator(), listSolveRequestsValidator(), validate, GetRoomSolveRequestsController);

router.route('/:requestId')
    .get(verifyToken, solveRequestIdValidator(), validate, GetSolveRequestByIdController)
    .patch(verifyToken, updateSolveRequestStatusValidator(), validate, UpdateSolveRequestStatusController)
    .delete(verifyToken, solveRequestIdValidator(), validate, DeleteSolveRequestController);

/**
 * Bulk Operations Routes
 * --------------------
 * Endpoints for bulk operations on solve requests
 * 
 * POST /bulk-action
 * @header Authorization - Bearer access_token
 * @body {Array<number>} requestIds - Array of request IDs
 * @body {string} action - APPROVE or REJECT
 * @returns {Object} Bulk action result with count
 */

router.route('/bulk-action')
    .post(verifyToken, bulkActionValidator(), validate, BulkActionController);

/**
 * Statistics Routes
 * ---------------
 * Endpoints for retrieving solve request statistics
 * 
 * GET /team/:teamId/statistics
 * @header Authorization - Bearer access_token
 * @param {string} teamId - Team ID
 * @returns {Object} Team solve request statistics including:
 *   - Total, pending, approved, rejected counts
 *   - Approval rate
 * 
 * GET /room/:roomId/statistics
 * @header Authorization - Bearer access_token
 * @param {string} roomId - Room ID
 * @returns {Object} Room-wide solve request statistics
 * 
 * GET /team/:teamId/approved-questions
 * @header Authorization - Bearer access_token
 * @param {string} teamId - Team ID
 * @returns {Object} List of questions team is approved to solve
 */

router.route('/team/:teamId/statistics')
    .get(verifyToken, teamIdValidator(), validate, GetTeamStatisticsController);

router.route('/room/:roomId/statistics')
    .get(verifyToken, roomIdValidator(), validate, GetRoomStatisticsController);

router.route('/team/:teamId/approved-questions')
    .get(verifyToken, teamIdValidator(), validate, GetTeamApprovedQuestionsController);

export default router;