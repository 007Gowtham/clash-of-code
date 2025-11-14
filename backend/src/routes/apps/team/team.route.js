import { 
    createTeamValidator,
    updateTeamValidator,
    teamIdValidator,
    roomIdValidator,
    listTeamsValidator,
    joinTeamValidator,
    membershipActionValidator,
    leaveTeamValidator,
    removeMemberValidator
} from "../../../validators/apps/team/team.validator.js";
import {
    CreateTeamController,
    GetTeamsByRoomController,
    GetTeamByIdController,
    UpdateTeamController,
    DeleteTeamController,
    JoinTeamController,
    MembershipActionController,
    LeaveTeamController,
    RemoveMemberController,
    GetTeamStatisticsController,
    GetPendingMembershipsController
} from "../../../controllers/apps/team/team.controller.js";
import { validate } from "../../../validators/validate.js";
import { Router } from "express";
import verifyToken from "../../../middlewares/auth.middleware.js";

const router = Router();

/**
 * Team Management Routes
 * --------------------
 * Endpoints for creating, managing, and accessing teams
 * 
 * POST /
 * @header Authorization - Bearer access_token
 * @body {string} name - Team name (3-50 chars)
 * @body {string} roomId - Room ID
 * @returns {Object} Created team with leader token
 * 
 * GET /room/:roomId
 * @param {string} roomId - Room ID
 * @query {number} [page=1] - Page number
 * @query {number} [limit=10] - Items per page (max 100)
 * @query {string} [search] - Search by team name
 * @returns {Object} Paginated list of teams in room
 * 
 * GET /:teamId
 * @param {string} teamId - Team ID
 * @returns {Object} Detailed team information
 * 
 * PATCH /:teamId
 * @header Authorization - Bearer access_token
 * @param {string} teamId - Team ID
 * @body {string} [name] - Updated team name
 * @returns {Object} Updated team data
 * 
 * DELETE /:teamId
 * @header Authorization - Bearer access_token
 * @param {string} teamId - Team ID to delete
 * @returns {Object} Deletion confirmation
 */

router.route('/')
    .post(verifyToken, createTeamValidator(), validate, CreateTeamController);

router.route('/room/:roomId')
    .get(roomIdValidator(), listTeamsValidator(), validate, GetTeamsByRoomController);

router.route('/:teamId')
    .get(teamIdValidator(), validate, GetTeamByIdController)
    .patch(verifyToken, updateTeamValidator(), validate, UpdateTeamController)
    .delete(verifyToken, teamIdValidator(), validate, DeleteTeamController);

/**
 * Team Membership Routes
 * ---------------------
 * Endpoints for managing team memberships
 * 
 * POST /:teamId/join
 * @header Authorization - Bearer access_token
 * @param {string} teamId - Team ID to join
 * @returns {Object} Membership request created
 * 
 * GET /:teamId/pending
 * @header Authorization - Bearer access_token
 * @param {string} teamId - Team ID
 * @returns {Object} List of pending membership requests
 * 
 * PATCH /:teamId/membership/:membershipId
 * @header Authorization - Bearer access_token
 * @param {string} teamId - Team ID
 * @param {number} membershipId - Membership ID
 * @body {string} status - APPROVED or REJECTED
 * @returns {Object} Updated membership data
 * 
 * POST /:teamId/leave
 * @header Authorization - Bearer access_token
 * @param {string} teamId - Team ID to leave
 * @returns {Object} Leave confirmation
 * 
 * DELETE /:teamId/member/:userId
 * @header Authorization - Bearer access_token
 * @param {string} teamId - Team ID
 * @param {number} userId - User ID to remove
 * @returns {Object} Removal confirmation
 */

router.route('/:teamId/join')
    .post(verifyToken, joinTeamValidator(), validate, JoinTeamController);

router.route('/:teamId/pending')
    .get(verifyToken, teamIdValidator(), validate, GetPendingMembershipsController);

router.route('/:teamId/membership/:membershipId')
    .patch(verifyToken, membershipActionValidator(), validate, MembershipActionController);

router.route('/:teamId/leave')
    .post(verifyToken, leaveTeamValidator(), validate, LeaveTeamController);

router.route('/:teamId/member/:userId')
    .delete(verifyToken, removeMemberValidator(), validate, RemoveMemberController);

/**
 * Team Analytics Routes
 * -------------------
 * Endpoint for retrieving team statistics
 * 
 * GET /:teamId/statistics
 * @header Authorization - Bearer access_token
 * @param {string} teamId - Team ID
 * @returns {Object} Comprehensive team statistics including:
 *   - Total members, submissions, solve requests
 *   - Team score and rank
 */

router.route('/:teamId/statistics')
    .get(verifyToken, teamIdValidator(), validate, GetTeamStatisticsController);

export default router;