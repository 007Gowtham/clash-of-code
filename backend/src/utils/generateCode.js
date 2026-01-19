const crypto = require('crypto');

/**
 * Generate 6-digit verification code
 */
const generateVerificationCode = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Generate readable room code (no 0/O, 1/I confusion)
 * Format: ABC123 (6 characters)
 */
const generateRoomCode = () => {
    // Use readable characters only (no 0/O, 1/I confusion)
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    let code = '';
    for (let i = 0; i < 6; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return code;
};

/**
 * Generate semantic team code
 * Format: T-ALPHA-X9K (Team prefix + name hint + unique suffix)
 */
const generateTeamCode = (teamName) => {
    const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

    // Extract first 3-5 chars from team name (alphanumeric only)
    const nameHint = teamName
        .toUpperCase()
        .replace(/[^A-Z0-9]/g, '')
        .substring(0, 5)
        .padEnd(3, 'X'); // Ensure at least 3 chars

    // Generate unique suffix (3 chars)
    let suffix = '';
    for (let i = 0; i < 3; i++) {
        suffix += chars.charAt(Math.floor(Math.random() * chars.length));
    }

    return `T-${nameHint}-${suffix}`;
};

/**
 * Generate invite link for room
 */
const generateInviteLink = (roomCode) => {
    return `${process.env.FRONTEND_URL || 'http://localhost:3000'}/join-room/${roomCode}`;
};

/**
 * Generate reset token for password recovery
 */
const generateResetToken = () => {
    return crypto.randomBytes(32).toString('hex');
};

module.exports = {
    generateVerificationCode,
    generateRoomCode,
    generateTeamCode,
    generateInviteLink,
    generateResetToken,
};
