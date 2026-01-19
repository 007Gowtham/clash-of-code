const { errorResponse } = require('../utils/responseFormatter');
const LANGUAGE_MAP = require('../config/languageMap');

/**
 * Validate code submission payload
 */
exports.validateCodeSubmission = (req, res, next) => {
    const { code, language } = req.body;

    // 1. Check for empty inputs
    if (!code || typeof code !== 'string') {
        return errorResponse(res, 'Code is required and must be a string', 400);
    }

    if (code.trim() === '') {
        return errorResponse(res, 'Code cannot be empty', 400);
    }

    if (!language) {
        return errorResponse(res, 'Language is required', 400);
    }

    // 2. Validate Language
    if (!LANGUAGE_MAP[language]) {
        return errorResponse(res, `Unsupported language: ${language}`, 400);
    }

    // 3. Length Limit (Prevent huge payloads)
    const MAX_CODE_LENGTH = 10 * 1024; // 10KB
    if (code.length > MAX_CODE_LENGTH) {
        return errorResponse(res, 'Code exceeds maximum length limit (10KB)', 400);
    }

    // 4. Basic Sanitization (Prevent obvious malicious patterns)
    // Note: This is weak protection; Judge0 sandbox is the real defense.
    // We just block things that might mess up our logging or parsing.

    // Example: Blocking extremely long lines (minified overload)
    const lines = code.split('\n');
    if (lines.some(l => l.length > 2000)) {
        return errorResponse(res, 'Code contains lines that are too long (potential minified code or attack)', 400);
    }

    next();
};
