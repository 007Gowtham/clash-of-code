const { body, param, query, validationResult } = require('express-validator');

const validate = (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).json({
            success: false,
            errors: errors.array().map((err) => ({
                field: err.path || err.param,
                message: err.msg,
            })),
        });
    }
    next();
};

// Auth validations
const registerValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
        .withMessage('Password must contain uppercase, lowercase, and number'),
    body('username')
        .optional()
        .isLength({ min: 3, max: 30 })
        .withMessage('Username must be 3-30 characters')
        .matches(/^[a-zA-Z0-9_]+$/)
        .withMessage('Username can only contain letters, numbers, and underscores'),
    validate,
];

const loginValidation = [
    body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required'),
    validate,
];

const verifyEmailValidation = [
    body('email').isEmail().normalizeEmail(),
    body('code').isLength({ min: 6, max: 6 }).isNumeric(),
    validate,
];

// Room validations
const createRoomValidation = [
    body('roomName')
        .isLength({ min: 3, max: 100 })
        .withMessage('Room name must be 3-100 characters'),
    body('duration')
        .isInt({ min: 10, max: 300 })
        .withMessage('Duration must be between 10 and 300 minutes'),
    body('mode')
        .isIn(['team', 'solo'])
        .withMessage('Mode must be either team or solo'),
    validate,
];

// Team validations
const createTeamValidation = [
    body('name')
        .isLength({ min: 3, max: 50 })
        .withMessage('Team name must be 3-50 characters'),
    body('roomId').isUUID().withMessage('Valid room ID is required'),
    body('visibility')
        .optional()
        .isIn(['PUBLIC', 'PRIVATE'])
        .withMessage('Visibility must be PUBLIC or PRIVATE'),
    validate,
];

// Question validations
const addQuestionsValidation = [
    body('questions').isArray({ min: 1, max: 20 }).withMessage('Must provide 1-20 questions'),
    body('questions.*.title').notEmpty().withMessage('Question title is required'),
    body('questions.*.description').notEmpty().withMessage('Question description is required'),
    body('questions.*.sampleInput').notEmpty().withMessage('Sample input is required'),
    body('questions.*.sampleOutput').notEmpty().withMessage('Sample output is required'),
    body('questions.*.difficulty')
        .isIn(['EASY', 'MEDIUM', 'HARD'])
        .withMessage('Difficulty must be EASY, MEDIUM, or HARD'),
    body('questions.*.testCases')
        .isArray({ min: 1 })
        .withMessage('At least one test case is required'),
    validate,
];

// Submission validations
const submitCodeValidation = [
    body('code').notEmpty().withMessage('Code is required'),
    body('language')
        .isIn(['python', 'javascript', 'cpp', 'java', 'c'])
        .withMessage('Unsupported language'),
    body('teamId').isUUID().withMessage('Valid team ID is required'),
    validate,
];

module.exports = {
    validate,
    registerValidation,
    loginValidation,
    verifyEmailValidation,
    createRoomValidation,
    createTeamValidation,
    addQuestionsValidation,
    submitCodeValidation,
};
