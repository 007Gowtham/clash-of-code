const express = require('express');
const router = express.Router();
const testingController = require('../controllers/testingController');
const { authenticateToken } = require('../middleware/auth');
const { codeLimiter } = require('../middleware/rateLimiter');



const { validateCodeSubmission } = require('../middleware/codeValidation');

// Get all questions for testing
router.get('/questions', authenticateToken, testingController.getTestingQuestions);

// Get question details
router.get('/questions/:questionId', authenticateToken, testingController.getTestingQuestionDetails);

// Run code (test with sample test cases)
router.post('/run/:questionId', authenticateToken, validateCodeSubmission, codeLimiter, testingController.runTestingCode);

// Submit solution (test with all test cases)
router.post('/submit/:questionId', authenticateToken, validateCodeSubmission, codeLimiter, testingController.submitTestingCode);

module.exports = router;
