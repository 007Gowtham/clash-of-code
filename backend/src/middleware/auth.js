const jwt = require('jsonwebtoken');
const { prisma } = require('../config/database');

const authenticateToken = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Access token required',
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Fetch user from database
        const user = await prisma.user.findUnique({
            where: { id: decoded.userId },
            select: {
                id: true,
                email: true,
                username: true,
                role: true,
                isEmailVerified: true,
            },
        });

        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'Invalid token - user not found',
            });
        }

        req.user = user;
        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                error: 'Invalid token',
            });
        }
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                error: 'Token expired',
            });
        }
        return res.status(500).json({
            success: false,
            error: 'Authentication error',
        });
    }
};

const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];
        const token = authHeader && authHeader.split(' ')[1];

        if (token) {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await prisma.user.findUnique({
                where: { id: decoded.userId },
                select: {
                    id: true,
                    email: true,
                    username: true,
                    role: true,
                    isEmailVerified: true,
                },
            });
            req.user = user;
        }
        next();
    } catch (error) {
        next(); // Continue without authentication
    }
};

module.exports = { authenticateToken, optionalAuth };
