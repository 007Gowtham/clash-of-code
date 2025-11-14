import { body, param, query } from "express-validator";
import { AvailableRequestStatus } from "../../../constants.js";

/**
 * Create Solve Request Validator
 * ------------------------------
 * Validates solve request creation
 */
const createSolveRequestValidator = () => {
    return [
        body("teamId")
            .notEmpty()
            .withMessage("Team ID is required")
            .isString()
            .withMessage("Team ID must be a valid string"),
        
        body("questionId")
            .notEmpty()
            .withMessage("Question ID is required")
            .isInt()
            .withMessage("Question ID must be an integer")
    ];
};

/**
 * Solve Request ID Validator
 * -------------------------
 * Validates solve request ID parameter
 */
const solveRequestIdValidator = () => {
    return [
        param("requestId")
            .notEmpty()
            .withMessage("Request ID is required")
            .isInt()
            .withMessage("Request ID must be an integer")
    ];
};

/**
 * Team ID Validator
 * ----------------
 * Validates team ID parameter
 */
const teamIdValidator = () => {
    return [
        param("teamId")
            .notEmpty()
            .withMessage("Team ID is required")
            .isString()
            .withMessage("Team ID must be a valid string")
    ];
};

/**
 * Room ID Validator
 * ----------------
 * Validates room ID parameter
 */
const roomIdValidator = () => {
    return [
        param("roomId")
            .notEmpty()
            .withMessage("Room ID is required")
            .isString()
            .withMessage("Room ID must be a valid string")
    ];
};

/**
 * List Solve Requests Validator
 * ----------------------------
 * Validates query parameters for listing solve requests
 */
const listSolveRequestsValidator = () => {
    return [
        query("page")
            .optional()
            .isInt({ min: 1 })
            .withMessage("Page must be a positive integer"),
        
        query("limit")
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage("Limit must be between 1 and 100"),
        
        query("status")
            .optional()
            .isIn(AvailableRequestStatus)
            .withMessage(`Status must be one of: ${AvailableRequestStatus.join(", ")}`)
    ];
};

/**
 * Update Solve Request Status Validator
 * ------------------------------------
 * Validates status update for solve request
 */
const updateSolveRequestStatusValidator = () => {
    return [
        param("requestId")
            .notEmpty()
            .withMessage("Request ID is required")
            .isInt()
            .withMessage("Request ID must be an integer"),
        
        body("status")
            .notEmpty()
            .withMessage("Status is required")
            .isIn(['APPROVED', 'REJECTED'])
            .withMessage("Status must be either APPROVED or REJECTED")
    ];
};

/**
 * Bulk Action Validator
 * --------------------
 * Validates bulk approve/reject operations
 */
const bulkActionValidator = () => {
    return [
        body("requestIds")
            .notEmpty()
            .withMessage("Request IDs are required")
            .isArray({ min: 1 })
            .withMessage("Request IDs must be a non-empty array"),
        
        body("requestIds.*")
            .isInt()
            .withMessage("Each request ID must be an integer"),
        
        body("action")
            .notEmpty()
            .withMessage("Action is required")
            .isIn(['APPROVE', 'REJECT'])
            .withMessage("Action must be either APPROVE or REJECT")
    ];
};

/**
 * Question ID Validator
 * --------------------
 * Validates question ID parameter
 */
const questionIdValidator = () => {
    return [
        param("questionId")
            .notEmpty()
            .withMessage("Question ID is required")
            .isInt()
            .withMessage("Question ID must be an integer")
    ];
};

export { 
    createSolveRequestValidator,
    solveRequestIdValidator,
    teamIdValidator,
    roomIdValidator,
    listSolveRequestsValidator,
    updateSolveRequestStatusValidator,
    bulkActionValidator,
    questionIdValidator
};