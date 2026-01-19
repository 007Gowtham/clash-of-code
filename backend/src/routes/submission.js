const express = require('express');
const router = express.Router();
const testingController = require('../controllers/testingController');
const { authenticateToken } = require('../middleware/auth');
const { codeLimiter } = require('../middleware/rateLimiter');
const { validateCodeSubmission } = require('../middleware/codeValidation');

// Route matches frontend: /api/submissions/questions/:questionId/run
router.post('/questions/:questionId/run', authenticateToken, validateCodeSubmission, codeLimiter, testingController.runTestingCode);

// Route matches frontend: /api/submissions/questions/:questionId/submit
router.post('/questions/:questionId/submit', authenticateToken, validateCodeSubmission, codeLimiter, testingController.submitTestingCode);

module.exports = router;
