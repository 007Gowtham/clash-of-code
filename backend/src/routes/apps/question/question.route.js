import { 
    createQuestionValidator,
    updateQuestionValidator,
    questionIdValidator,
    roomIdValidator,
    listQuestionsValidator,
    addTestCaseValidator,
    updateTestCaseValidator,
    testCaseIdValidator,
    addExampleValidator,
    exampleIdValidator
} from "../../../validators/apps/question/question.validator.js";
import {
    CreateQuestionController,
    GetQuestionsByRoomController,
    GetQuestionByIdController,
    UpdateQuestionController,
    DeleteQuestionController,
    AddTestCaseController,
    UpdateTestCaseController,
    DeleteTestCaseController,
    AddExampleController,
    DeleteExampleController,
    GetQuestionStatisticsController
} from "../../../controllers/apps/question/question.controller.js";
import { validate } from "../../../validators/validate.js";
import { Router } from "express";
import verifyToken from "../../../middlewares/auth.middleware.js";

const router = Router();

/**
 * Question Management Routes
 * -------------------------
 * Endpoints for creating, managing, and accessing questions
 * 
 * POST /
 * @header Authorization - Bearer access_token
 * @body {string} roomId - Room ID
 * @body {string} title - Question title (5-200 chars)
 * @body {string} description - Question description
 * @body {string} topic - Question topic
 * @body {string} difficulty - EASY, MEDIUM, or HARD
 * @body {Array} testCases - Array of test case objects
 * @body {Array} [examples] - Optional array of example objects
 * @returns {Object} Created question with test cases and examples
 * 
 * GET /room/:roomId
 * @param {string} roomId - Room ID
 * @query {number} [page=1] - Page number
 * @query {number} [limit=10] - Items per page (max 100)
 * @query {string} [difficulty] - Filter by difficulty
 * @query {string} [topic] - Filter by topic
 * @query {string} [search] - Search in title/description
 * @returns {Object} Paginated list of questions in room
 * 
 * GET /:questionId
 * @param {number} questionId - Question ID
 * @returns {Object} Detailed question information
 * 
 * PATCH /:questionId
 * @header Authorization - Bearer access_token
 * @param {number} questionId - Question ID
 * @body {Object} updateData - Fields to update
 * @returns {Object} Updated question data
 * 
 * DELETE /:questionId
 * @header Authorization - Bearer access_token
 * @param {number} questionId - Question ID to delete
 * @returns {Object} Deletion confirmation
 */

router.route('/')
    .post(verifyToken, createQuestionValidator(), validate, CreateQuestionController);

router.route('/room/:roomId')
    .get(roomIdValidator(), listQuestionsValidator(), validate, GetQuestionsByRoomController);

router.route('/:questionId')
    .get(questionIdValidator(), validate, GetQuestionByIdController)
    .patch(verifyToken, updateQuestionValidator(), validate, UpdateQuestionController)
    .delete(verifyToken, questionIdValidator(), validate, DeleteQuestionController);

/**
 * Test Case Management Routes
 * --------------------------
 * Endpoints for managing question test cases
 * 
 * POST /:questionId/testcases
 * @header Authorization - Bearer access_token
 * @param {number} questionId - Question ID
 * @body {string} input - Test case input
 * @body {string} expectedOutput - Expected output
 * @body {boolean} [isHidden] - Whether test case is hidden
 * @body {number} [points] - Points for this test case
 * @returns {Object} Created test case
 * 
 * PATCH /testcases/:testCaseId
 * @header Authorization - Bearer access_token
 * @param {number} testCaseId - Test case ID
 * @body {Object} updateData - Fields to update
 * @returns {Object} Updated test case
 * 
 * DELETE /testcases/:testCaseId
 * @header Authorization - Bearer access_token
 * @param {number} testCaseId - Test case ID to delete
 * @returns {Object} Deletion confirmation
 */

router.route('/:questionId/testcases')
    .post(verifyToken, addTestCaseValidator(), validate, AddTestCaseController);

router.route('/testcases/:testCaseId')
    .patch(verifyToken, updateTestCaseValidator(), validate, UpdateTestCaseController)
    .delete(verifyToken, testCaseIdValidator(), validate, DeleteTestCaseController);

/**
 * Example Management Routes
 * ------------------------
 * Endpoints for managing question examples
 * 
 * POST /:questionId/examples
 * @header Authorization - Bearer access_token
 * @param {number} questionId - Question ID
 * @body {string} input - Example input
 * @body {string} output - Example output
 * @body {string} [explanation] - Example explanation
 * @body {number} [orderIndex] - Display order
 * @returns {Object} Created example
 * 
 * DELETE /examples/:exampleId
 * @header Authorization - Bearer access_token
 * @param {number} exampleId - Example ID to delete
 * @returns {Object} Deletion confirmation
 */

router.route('/:questionId/examples')
    .post(verifyToken, addExampleValidator(), validate, AddExampleController);

router.route('/examples/:exampleId')
    .delete(verifyToken, exampleIdValidator(), validate, DeleteExampleController);

/**
 * Question Analytics Routes
 * ------------------------
 * Endpoint for retrieving question statistics
 * 
 * GET /:questionId/statistics
 * @param {number} questionId - Question ID
 * @returns {Object} Comprehensive question statistics including:
 *   - Total submissions, accepted submissions
 *   - Acceptance rate
 *   - Test case and example counts
 *   - Unique teams solved
 */

router.route('/:questionId/statistics')
    .get(questionIdValidator(), validate, GetQuestionStatisticsController);

export default router;