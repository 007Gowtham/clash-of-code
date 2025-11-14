import { body, param, query } from "express-validator";
import { AvailableDifficulty } from "../../../constants.js";

/**
 * Question Creation Validator
 * --------------------------
 * Validates input for creating a new question
 */
const createQuestionValidator = () => {
    return [
        body("roomId")
            .notEmpty()
            .withMessage("Room ID is required")
            .isString()
            .withMessage("Room ID must be a valid string"),
        
        body("title")
            .trim()
            .notEmpty()
            .withMessage("Question title is required")
            .isLength({ min: 5, max: 200 })
            .withMessage("Title must be between 5 and 200 characters"),
        
        body("description")
            .trim()
            .notEmpty()
            .withMessage("Question description is required")
            .isLength({ min: 10 })
            .withMessage("Description must be at least 10 characters"),
        
        body("topic")
            .trim()
            .notEmpty()
            .withMessage("Topic is required")
            .isLength({ max: 100 })
            .withMessage("Topic must not exceed 100 characters"),
        
        body("difficulty")
            .notEmpty()
            .withMessage("Difficulty is required")
            .isIn(AvailableDifficulty)
            .withMessage(`Difficulty must be one of: ${AvailableDifficulty.join(", ")}`),
        
        body("constraints")
            .optional()
            .isString()
            .withMessage("Constraints must be a string"),
        
        body("inputFormat")
            .optional()
            .isString()
            .withMessage("Input format must be a string"),
        
        body("outputFormat")
            .optional()
            .isString()
            .withMessage("Output format must be a string"),
        
        body("timeLimit")
            .optional()
            .isInt({ min: 100, max: 10000 })
            .withMessage("Time limit must be between 100ms and 10000ms"),
        
        body("memoryLimit")
            .optional()
            .isInt({ min: 64, max: 1024 })
            .withMessage("Memory limit must be between 64MB and 1024MB"),
        
        body("points")
            .optional()
            .isInt({ min: 1, max: 1000 })
            .withMessage("Points must be between 1 and 1000"),
        
        body("testCases")
            .notEmpty()
            .withMessage("Test cases are required")
            .isArray({ min: 1 })
            .withMessage("At least one test case is required"),
        
        body("testCases.*.input")
            .notEmpty()
            .withMessage("Test case input is required"),
        
        body("testCases.*.expectedOutput")
            .notEmpty()
            .withMessage("Test case expected output is required"),
        
        body("testCases.*.isHidden")
            .optional()
            .isBoolean()
            .withMessage("isHidden must be a boolean"),
        
        body("testCases.*.points")
            .optional()
            .isInt({ min: 0 })
            .withMessage("Test case points must be a non-negative integer"),
        
        body("examples")
            .optional()
            .isArray()
            .withMessage("Examples must be an array"),
        
        body("examples.*.input")
            .notEmpty()
            .withMessage("Example input is required"),
        
        body("examples.*.output")
            .notEmpty()
            .withMessage("Example output is required"),
        
        body("examples.*.explanation")
            .optional()
            .isString()
            .withMessage("Example explanation must be a string"),
        
        body("examples.*.orderIndex")
            .optional()
            .isInt({ min: 0 })
            .withMessage("Order index must be a non-negative integer")
    ];
};

/**
 * Update Question Validator
 * ------------------------
 * Validates input for updating question details
 */
const updateQuestionValidator = () => {
    return [
        param("questionId")
            .notEmpty()
            .withMessage("Question ID is required")
            .isInt()
            .withMessage("Question ID must be an integer"),
        
        body("title")
            .optional()
            .trim()
            .isLength({ min: 5, max: 200 })
            .withMessage("Title must be between 5 and 200 characters"),
        
        body("description")
            .optional()
            .trim()
            .isLength({ min: 10 })
            .withMessage("Description must be at least 10 characters"),
        
        body("topic")
            .optional()
            .trim()
            .isLength({ max: 100 })
            .withMessage("Topic must not exceed 100 characters"),
        
        body("difficulty")
            .optional()
            .isIn(AvailableDifficulty)
            .withMessage(`Difficulty must be one of: ${AvailableDifficulty.join(", ")}`),
        
        body("constraints")
            .optional()
            .isString()
            .withMessage("Constraints must be a string"),
        
        body("inputFormat")
            .optional()
            .isString()
            .withMessage("Input format must be a string"),
        
        body("outputFormat")
            .optional()
            .isString()
            .withMessage("Output format must be a string"),
        
        body("timeLimit")
            .optional()
            .isInt({ min: 100, max: 10000 })
            .withMessage("Time limit must be between 100ms and 10000ms"),
        
        body("memoryLimit")
            .optional()
            .isInt({ min: 64, max: 1024 })
            .withMessage("Memory limit must be between 64MB and 1024MB"),
        
        body("points")
            .optional()
            .isInt({ min: 1, max: 1000 })
            .withMessage("Points must be between 1 and 1000")
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
 * List Questions Validator
 * -----------------------
 * Validates query parameters for listing questions
 */
const listQuestionsValidator = () => {
    return [
        query("page")
            .optional()
            .isInt({ min: 1 })
            .withMessage("Page must be a positive integer"),
        
        query("limit")
            .optional()
            .isInt({ min: 1, max: 100 })
            .withMessage("Limit must be between 1 and 100"),
        
        query("difficulty")
            .optional()
            .isIn(AvailableDifficulty)
            .withMessage(`Difficulty must be one of: ${AvailableDifficulty.join(", ")}`),
        
        query("topic")
            .optional()
            .isString()
            .withMessage("Topic must be a string"),
        
        query("search")
            .optional()
            .isString()
            .withMessage("Search must be a string")
            .isLength({ max: 100 })
            .withMessage("Search query too long")
    ];
};

/**
 * Add Test Case Validator
 * ----------------------
 * Validates adding a new test case
 */
const addTestCaseValidator = () => {
    return [
        param("questionId")
            .notEmpty()
            .withMessage("Question ID is required")
            .isInt()
            .withMessage("Question ID must be an integer"),
        
        body("input")
            .notEmpty()
            .withMessage("Test case input is required"),
        
        body("expectedOutput")
            .notEmpty()
            .withMessage("Expected output is required"),
        
        body("isHidden")
            .optional()
            .isBoolean()
            .withMessage("isHidden must be a boolean"),
        
        body("points")
            .optional()
            .isInt({ min: 0 })
            .withMessage("Points must be a non-negative integer")
    ];
};

/**
 * Update Test Case Validator
 * -------------------------
 * Validates updating a test case
 */
const updateTestCaseValidator = () => {
    return [
        param("testCaseId")
            .notEmpty()
            .withMessage("Test case ID is required")
            .isInt()
            .withMessage("Test case ID must be an integer"),
        
        body("input")
            .optional()
            .isString()
            .withMessage("Input must be a string"),
        
        body("expectedOutput")
            .optional()
            .isString()
            .withMessage("Expected output must be a string"),
        
        body("isHidden")
            .optional()
            .isBoolean()
            .withMessage("isHidden must be a boolean"),
        
        body("points")
            .optional()
            .isInt({ min: 0 })
            .withMessage("Points must be a non-negative integer")
    ];
};

/**
 * Test Case ID Validator
 * ---------------------
 * Validates test case ID parameter
 */
const testCaseIdValidator = () => {
    return [
        param("testCaseId")
            .notEmpty()
            .withMessage("Test case ID is required")
            .isInt()
            .withMessage("Test case ID must be an integer")
    ];
};

/**
 * Add Example Validator
 * --------------------
 * Validates adding a new example
 */
const addExampleValidator = () => {
    return [
        param("questionId")
            .notEmpty()
            .withMessage("Question ID is required")
            .isInt()
            .withMessage("Question ID must be an integer"),
        
        body("input")
            .notEmpty()
            .withMessage("Example input is required"),
        
        body("output")
            .notEmpty()
            .withMessage("Example output is required"),
        
        body("explanation")
            .optional()
            .isString()
            .withMessage("Explanation must be a string"),
        
        body("orderIndex")
            .optional()
            .isInt({ min: 0 })
            .withMessage("Order index must be a non-negative integer")
    ];
};

/**
 * Example ID Validator
 * -------------------
 * Validates example ID parameter
 */
const exampleIdValidator = () => {
    return [
        param("exampleId")
            .notEmpty()
            .withMessage("Example ID is required")
            .isInt()
            .withMessage("Example ID must be an integer")
    ];
};

export { 
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
};