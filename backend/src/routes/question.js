const express = require('express');
const router = express.Router();
const questionController = require('../controllers/questionController');
const { authenticateToken } = require('../middleware/auth');
const { checkRoomAdmin, checkRole } = require('../middleware/roleCheck');

// ==================== PUBLIC ROUTES (No Authentication) ====================

// Get all questions (public access)

// ==================== AUTHENTICATED ROUTES ====================

// All routes below require authentication
// Public routes
// Public routes
router.put('/:questionId', questionController.updateQuestion);
router.get('/', questionController.getAllQuestions);

// All routes below require authentication
router.use(authenticateToken);



// Create global question (Admin only)
// Create global question (Admin only)
router.post('/many', questionController.createQuestion); // Bulk creation
router.post('/', questionController.createQuestion);
router.delete('/:questionId', questionController.deleteQuestion);

// Add questions to room (Admin only)
router.post('/rooms/:roomId/questions', checkRoomAdmin, questionController.addQuestions);


// Get room questions
router.get('/rooms/:roomId/questions', questionController.getRoomQuestions);

// Get question details
router.get('/:questionId', questionController.getQuestionDetails);

// Assign question to team member
router.post('/:questionId/assign', questionController.assignQuestion);

// Update question (Admin only)

// Delete question (Admin only)

module.exports = router;
