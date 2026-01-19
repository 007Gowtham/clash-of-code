const express = require('express');
const router = express.Router();
const roomController = require('../controllers/roomController');
const { authenticateToken } = require('../middleware/auth');
const { checkRoomAdmin } = require('../middleware/roleCheck');
const { createRoomValidation } = require('../middleware/validation');

// All routes require authentication
router.use(authenticateToken);

// Room CRUD
router.post('/', createRoomValidation, roomController.createRoom);
router.get('/', roomController.getAllRooms);
router.get('/:roomId', roomController.getRoomDetails);
router.delete('/:roomId', checkRoomAdmin, roomController.deleteRoom);

// Room actions
router.post('/join', roomController.joinRoom);
router.post('/:roomId/start', checkRoomAdmin, roomController.startRoom);
router.post('/:roomId/end', checkRoomAdmin, roomController.endRoom);

module.exports = router;
