/**
 * Problem Routes
 * Routes for problem templates, code execution, and submissions
 */

const express = require('express');
const router = express.Router();
const problemController = require('../controllers/problemController');
const { authenticateToken } = require('../middleware/auth');
const { validate } = require('../middleware/validation');
const { body, param, query } = require('express-validator');

/**
 * Get problem with code template
 * GET /api/problems/:slug?language=python
 */
router.get(
    '/:slug',
    [
        param('slug').isString().notEmpty(),
        query('language').optional().isIn(['python', 'javascript', 'java', 'cpp'])
    ],
    validate,
    problemController.getProblem
);


// Execution routes removed as per request to rebuild pipeline.
module.exports = router;

module.exports = router;
