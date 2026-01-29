const express = require('express');
const router = express.Router();
const teamController = require('../controllers/teamController');
const { authenticateToken } = require('../middleware/auth');
const { checkTeamLeader } = require('../middleware/roleCheck');
const { createTeamValidation } = require('../middleware/validation');

// All routes require authentication
router.use(authenticateToken);

// Team CRUD
router.post('/', createTeamValidation, teamController.createTeam);
router.get('/:teamId', teamController.getTeamDetails);
router.delete('/:teamId', checkTeamLeader, teamController.deleteTeam);

// Team actions
router.post('/:teamId/join', teamController.joinTeam);
router.post('/:teamId/request', teamController.requestToJoinTeam);
router.post('/:teamId/leave', teamController.leaveTeam);
router.delete('/:teamId/members/:userId', checkTeamLeader, teamController.kickMember);

// Join requests (team leader only)
router.get('/:teamId/requests', checkTeamLeader, teamController.getJoinRequests);
router.post('/:teamId/requests/:requestId/accept', checkTeamLeader, teamController.acceptJoinRequest);
router.post('/:teamId/requests/:requestId/reject', checkTeamLeader, teamController.rejectJoinRequest);

// Room-specific team routes
router.get('/room/:roomId', teamController.getTeamsInRoom);

module.exports = router;