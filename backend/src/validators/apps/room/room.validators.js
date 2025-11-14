import { body, param, query } from "express-validator";
import { AvailableRoomStatus } from "../../../constants.js";

/**
 * Room Creation Validator
 * ----------------------
 * Validates input for creating a new room
 */
const createRoomValidator = () => {
    return [
        body("name")
            .trim()
            .notEmpty()
            .withMessage("Room name is required")
            .isLength({ min: 3, max: 100 })
            .withMessage("Room name must be between 3 and 100 characters"),
        
        body("password")
            .notEmpty()
            .withMessage("Room password is required")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters long"),
        
        body("maxTeams")
            .notEmpty()
            .withMessage("Maximum teams is required")
            .isInt({ min: 1, max: 100 })
            .withMessage("Maximum teams must be between 1 and 100"),
        
        body("maxTeamSize")
            .notEmpty()
            .withMessage("Maximum team size is required")
            .isInt({ min: 1, max: 10 })
            .withMessage("Maximum team size must be between 1 and 10"),
        
        body("duration")
            .notEmpty()
            .withMessage("Contest duration is required")
            .isInt({ min: 15, max: 480 })
            .withMessage("Duration must be between 15 minutes and 8 hours (480 minutes)")
    ];
};

/**
 * Update Room Validator
 * --------------------
 * Validates input for updating room details
 */
const updateRoomValidator = () => {
    return [
        param("roomId")
            .notEmpty()
            .withMessage("Room ID is required"),
        
        body("name")
            .optional()
            .trim()
            .isLength({ min: 3, max: 100 })
            .withMessage("Room name must be between 3 and 100 characters"),
        
        body("maxTeams")
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage("Maximum teams must be between 1 and 100"),
        
        body("maxTeamSize")
            .optional()
            .isInt({ min: 1, max: 10 })
            .withMessage("Maximum team size must be between 1 and 10"),
        
        body("duration")
            .optional()
            .isInt({ min: 15, max: 480 })
            .withMessage("Duration must be between 15 minutes and 8 hours (480 minutes)")
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
 * List Rooms Validator
 * -------------------
 * Validates query parameters for listing rooms
 */
const listRoomsValidator = () => {
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
            .isIn(AvailableRoomStatus)
            .withMessage(`Status must be one of: ${AvailableRoomStatus.join(", ")}`),
        
        query("search")
            .optional()
            .isString()
            .withMessage("Search must be a string")
            .isLength({ max: 100 })
            .withMessage("Search query too long")
    ];
};

/**
 * Room Password Validator
 * ----------------------
 * Validates room password for joining/verification
 */
const roomPasswordValidator = () => {
    return [
        param("roomId")
            .notEmpty()
            .withMessage("Room ID is required"),
        
        body("password")
            .notEmpty()
            .withMessage("Room password is required")
            .isLength({ min: 6 })
            .withMessage("Password must be at least 6 characters long")
    ];
};

/**
 * Start Room Validator
 * -------------------
 * Validates room start request
 */
const startRoomValidator = () => {
    return [
        param("roomId")
            .notEmpty()
            .withMessage("Room ID is required"),
        
        body("startTime")
            .optional()
            .isISO8601()
            .withMessage("Start time must be a valid ISO 8601 date")
    ];
};

/**
 * Update Room Status Validator
 * ---------------------------
 * Validates room status update
 */
const updateRoomStatusValidator = () => {
    return [
        param("roomId")
            .notEmpty()
            .withMessage("Room ID is required"),
        
        body("status")
            .notEmpty()
            .withMessage("Status is required")
            .isIn(AvailableRoomStatus)
            .withMessage(`Status must be one of: ${AvailableRoomStatus.join(", ")}`)
    ];
};

export { 
    createRoomValidator, 
    updateRoomValidator,
    roomIdValidator, 
    listRoomsValidator,
    roomPasswordValidator,
    startRoomValidator,
    updateRoomStatusValidator
};