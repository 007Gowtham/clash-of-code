const jwt = require('jsonwebtoken');

const generateToken = (userId, expiresIn = process.env.JWT_EXPIRES_IN || '15m') => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn });
};

const generateRefreshToken = (userId) => {
    return jwt.sign(
        { userId },
        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
        { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d' }
    );
};

const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid token');
    }
};

const verifyRefreshToken = (token) => {
    try {
        return jwt.verify(
            token,
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
        );
    } catch (error) {
        throw new Error('Invalid refresh token');
    }
};

module.exports = {
    generateToken,
    generateRefreshToken,
    verifyToken,
    verifyRefreshToken,
};
