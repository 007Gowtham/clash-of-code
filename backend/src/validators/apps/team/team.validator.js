import { body, param, query } from "express-validator";
import { AvailableMembershipStatus, AvailableRequestStatus } from "../../../constants.js";

/**
 * Team Creation Validator
 * ----------------------
 * Validates input for creating a new team
 */
const createTeamValidator = () => {
    return [
        body("name")
            .trim()
            .notEmpty()
            .withMessage("Team name is required")
            .isLength({ min: 3, max: 50 })
            .withMessage("Team name must be between 3 and 50 characters"),
        
        body("roomId")
            .notEmpty()
            .withMessage("Room ID is required")
            .isString()
            .withMessage("Room ID must be a valid string")
    ];
};

/**
 * Update Team Validator
 * --------------------
 * Validates input for updating team details
 */
const updateTeamValidator = () => {
    return [
        param("teamId")
            .notEmpty()
            .withMessage("Team ID is required"),
        
        body("name")
            .optional()
            .trim()
            .isLength({ min: 3, max: 50 })
            .withMessage("Team name must be between 3 and 50 characters")
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
 * List Teams Validator
 * -------------------
 * Validates query parameters for listing teams
 */
const listTeamsValidator = () => {
    return [
        query("page")
            .optional()
            .isInt({ min: 1 })
            .withMessage("Page must be a positive integer"),
        
        query("limit")
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage("Limit must be between 1 and 100"),
        
        query("search")
            .optional()
            .isString()
            .withMessage("Search must be a string")
            .isLength({ max: 100 })
            .withMessage("Search query too long")
    ];
};

/**
 * Join Team Request Validator
 * --------------------------
 * Validates team join request
 */
const joinTeamValidator = () => {
    return [
        param("teamId")
            .notEmpty()
            .withMessage("Team ID is required"),
        
        body("userId")
            .optional()
            .isInt()
            .withMessage("User ID must be an integer")
    ];
};

/**
 * Membership Action Validator
 * --------------------------
 * Validates membership approval/rejection
 */
const membershipActionValidator = () => {
    return [
        param("teamId")
            .notEmpty()
            .withMessage("Team ID is required"),
        
        param("membershipId")
            .notEmpty()
            .withMessage("Membership ID is required")
            .isInt()
            .withMessage("Membership ID must be an integer"),
        
        body("status")
            .notEmpty()
            .withMessage("Status is required")
            .isIn(['APPROVED', 'REJECTED'])
            .withMessage("Status must be either APPROVED or REJECTED")
    ];
};

/**
 * Leave Team Validator
 * -------------------
 * Validates team leave request
 */
const leaveTeamValidator = () => {
    return [
        param("teamId")
            .notEmpty()
            .withMessage("Team ID is required")
    ];
};

/**
 * Remove Member Validator
 * ----------------------
 * Validates member removal by leader
 */
const removeMemberValidator = () => {
    return [
        param("teamId")
            .notEmpty()
            .withMessage("Team ID is required"),
        
        param("userId")
            .notEmpty()
            .withMessage("User ID is required")
            .isInt()
            .withMessage("User ID must be an integer")
    ];
};

/**
 * Membership ID Validator
 * ----------------------
 * Validates membership ID parameter
 */
const membershipIdValidator = () => {
    return [
        param("membershipId")
            .notEmpty()
            .withMessage("Membership ID is required")
            .isInt()
            .withMessage("Membership ID must be an integer")
    ];
};

export { 
    createTeamValidator,
    updateTeamValidator,
    teamIdValidator,
    roomIdValidator,
    listTeamsValidator,
    joinTeamValidator,
    membershipActionValidator,
    leaveTeamValidator,
    removeMemberValidator,
    membershipIdValidator
};