const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { authenticateToken } = require('../middleware/auth');
const { checkRoomAdmin } = require('../middleware/roleCheck');

// All routes require authentication


// Add questions to room (Admin only)
router.post('/rooms/:roomId/questions', checkRoomAdmin, questionController.addQuestions);

// Get room questions
router.get('/rooms/:roomId/questions', questionController.getRoomQuestions);

// Get question details
router.get('/:questionId', questionController.getQuestionDetails);

// Assign question to team member
router.post('/:questionId/assign', questionController.assignQuestion);

// Update question (Admin only)
router.put('/:questionId', questionController.updateQuestion);

// Delete question (Admin only)
router.delete('/:questionId', questionController.deleteQuestion);

module.exports = router;
