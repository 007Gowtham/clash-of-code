const express = require('express');
const router = express.Router();
const { authenticateToken } = require('../middleware/auth');
const { codeLimiter } = require('../middleware/rateLimiter');
const { validateCodeSubmission } = require('../middleware/codeValidation');
const submissionController = require('../controllers/submissionController');

// ==================== USER FUNCTION SUBMISSION ROUTES ====================

/**
 * Run user function code against sample test cases
 * POST /api/submission/run-function/:questionId
 * Body: { userFunctionCode, language }
 */
router.post(
    '/run-function/:questionId',
   
    codeLimiter,
    submissionController.runUserFunction
);

/**
 * Submit user function code against all test cases
 * POST /api/submission/submit-function/:questionId
 * Body: { userFunctionCode, language }
 */
router.post(
    '/submit-function/:questionId',
   
    codeLimiter,
    validateCodeSubmission,
    submissionController.submitUserFunction
);

module.exports = router;

