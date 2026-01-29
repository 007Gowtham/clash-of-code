const express = require('express');
const router = express.Router();
const testingController = require('../controllers/testingController');
const { authenticateToken } = require('../middleware/auth');

// All testing routes require authentication
router.use(authenticateToken);

// Get all questions for testing
router.get('/questions', testingController.getTestingQuestions);

// Run code against sample test cases
router.post('/run/:questionId', testingController.runCode);

// Submit code against all test cases
router.post('/submit/:questionId', testingController.submitCode);

module.exports = router;
