const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const { prisma } = require('../config/database');
const { generateToken, generateRefreshToken } = require('../services/jwtService');
const { sendVerificationEmail, sendPasswordResetEmail } = require('../services/emailService');
const { generateVerificationCode } = require('../utils/generateCode');
const { successResponse, errorResponse } = require('../utils/responseFormatter');

// Helper function to hash tokens
const hashToken = (token) => {
    return crypto.createHash('sha256').update(token).digest('hex');
};

// Register
exports.register = async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return errorResponse(res, 'Email already exists', 400);
        }

        // Check username if provided
        if (username) {
            const existingUsername = await prisma.user.findUnique({
                where: { username },
            });
            if (existingUsername) {
                return errorResponse(res, 'Username already taken', 400);
            }
        }

        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create user
        const user = await prisma.user.create({
            data: {
                username,
                email,
                password: hashedPassword,
                isEmailVerified: false,
            },
        });

        // Generate verification code
        const code = generateVerificationCode();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes

        await prisma.verificationCode.create({
            data: {
                userId: user.id,
                code,
                expiresAt,
            },
        });

        // Send verification email
        try {
            await sendVerificationEmail(email, code);
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
            // Continue even if email fails
        }

        return successResponse(
            res,
            {
                userId: user.id,
                email: user.email,
                username: user.username,
            },
            'Registration successful. Please check your email for verification code.',
            201
        );
    } catch (error) {
        next(error);
    }
};

// Verify Email
exports.verifyEmail = async (req, res, next) => {
    try {
        const { email, code } = req.body;

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        if (user.isEmailVerified) {
            return errorResponse(res, 'Email already verified', 400);
        }

        // Find verification code
        const verificationCode = await prisma.verificationCode.findFirst({
            where: {
                userId: user.id,
                code,
                expiresAt: {
                    gte: new Date(),
                },
            },
        });

        if (!verificationCode) {
            return errorResponse(res, 'Invalid or expired verification code', 400);
        }

        // Update user
        await prisma.user.update({
            where: { id: user.id },
            data: { isEmailVerified: true },
        });

        // Delete verification code
        await prisma.verificationCode.delete({
            where: { id: verificationCode.id },
        });

        // Generate tokens
        const accessToken = generateToken(user.id, '15m');
        const refreshToken = generateRefreshToken(user.id);

        // Store refresh token
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                tokenHash: hashToken(refreshToken),
                userId: user.id,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
            },
        });

        // Set cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        return successResponse(res, {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
                isEmailVerified: true,
            },
        }, 'Email verified successfully');
    } catch (error) {
        next(error);
    }
};

// Login
exports.login = async (req, res, next) => {
    try {
        const { email, password } = req.body;
        const ipAddress = req.ip || req.connection.remoteAddress;
        const deviceInfo = req.headers['user-agent'] || 'Unknown Device';

        // Find user
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return errorResponse(res, 'Invalid credentials', 401);
        }

        // Check if account is locked
        if (user.lockedUntil && user.lockedUntil > new Date()) {
            const minutesLeft = Math.ceil((user.lockedUntil - new Date()) / 60000);
            return errorResponse(res, `Account temporarily locked. Please try again in ${minutesLeft} minutes.`, 403);
        }

        // Check password (if user has one)
        const isValidPassword = user.password && await bcrypt.compare(password, user.password);

        if (!isValidPassword) {
            // Increment failed attempts
            const newAttempts = (user.loginAttempts || 0) + 1;
            let updateData = { loginAttempts: newAttempts };

            // Lock if attempts >= 5
            if (newAttempts >= 5) {
                updateData.lockedUntil = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
            }

            await prisma.user.update({
                where: { id: user.id },
                data: updateData,
            });

            return errorResponse(res, 'Invalid credentials', 401);
        }

        // Check if email is verified
        if (!user.isEmailVerified) {
            return errorResponse(res, 'Please verify your email before logging in', 403);
        }

        // Successful Login: Reset attempts & Update tracking
        await prisma.user.update({
            where: { id: user.id },
            data: {
                loginAttempts: 0,
                lockedUntil: null,
                lastLoginAt: new Date(),
                lastLoginIp: ipAddress,
            },
        });

        // Generate tokens
        const accessToken = generateToken(user.id, '15m');
        const refreshToken = generateRefreshToken(user.id);

        // Store refresh token with session details
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                tokenHash: hashToken(refreshToken),
                userId: user.id,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                ipAddress,
                deviceInfo,
            },
        });

        // Set cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        return successResponse(res, {
            accessToken,
            refreshToken,
            user: {
                id: user.id,
                email: user.email,
                username: user.username,
                role: user.role,
                isEmailVerified: user.isEmailVerified,
            },
        }, 'Login successful');
    } catch (error) {
        next(error);
    }
};

// Refresh Access Token
exports.refreshAccessToken = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (!refreshToken) {
            return errorResponse(res, 'Refresh token required', 401);
        }

        // Verify token signature
        // Note: verifyRefreshToken throws if invalid
        const decoded = require('../services/jwtService').verifyRefreshToken(refreshToken);

        // Check in database
        const storedToken = await prisma.refreshToken.findUnique({
            where: { tokenHash: hashToken(refreshToken) },
        });

        if (!storedToken) {
            // Token reuse detection! (Optional: Revoke all user tokens if reused likely)
            return errorResponse(res, 'Invalid refresh token', 401);
        }

        if (storedToken.revoked) {
            // Revoked token usage! Revoke all tokens for this user for security
            await prisma.refreshToken.updateMany({
                where: { userId: storedToken.userId },
                data: { revoked: true },
            });
            return errorResponse(res, 'Token has been revoked', 401);
        }

        if (new Date() > storedToken.expiresAt) {
            return errorResponse(res, 'Refresh token expired', 401);
        }

        // Rotation: Revoke old token
        await prisma.refreshToken.update({
            where: { id: storedToken.id },
            data: { revoked: true },
        });

        // Generate new tokens
        const newAccessToken = generateToken(storedToken.userId, '15m');
        const newRefreshToken = generateRefreshToken(storedToken.userId);

        const ipAddress = req.ip || req.connection.remoteAddress;
        const deviceInfo = req.headers['user-agent'] || 'Unknown Device';

        // Store new refresh token with session details
        await prisma.refreshToken.create({
            data: {
                token: newRefreshToken,
                tokenHash: hashToken(newRefreshToken),
                userId: storedToken.userId,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                ipAddress,
                deviceInfo,
            },
        });

        // Update cookie
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        return successResponse(res, {
            accessToken: newAccessToken,
            refreshToken: newRefreshToken,
        }, 'Token refreshed successfully');

    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return errorResponse(res, 'Invalid or expired refresh token', 401);
        }
        next(error);
    }
};

// Logout
exports.logout = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

        if (refreshToken) {
            await prisma.refreshToken.updateMany({
                where: { tokenHash: hashToken(refreshToken) },
                data: { revoked: true },
            });
        }

        res.clearCookie('refreshToken');
        return successResponse(res, {}, 'Logged out successfully');
    } catch (error) {
        next(error);
    }
};

// Logout All
exports.logoutAllDevices = async (req, res, next) => {
    try {
        await prisma.refreshToken.updateMany({
            where: { userId: req.user.id },
            data: { revoked: true },
        });

        res.clearCookie('refreshToken');
        return successResponse(res, {}, 'Logged out from all devices');
    } catch (error) {
        next(error);
    }
};

// Resend Verification Code
exports.resendVerification = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Don't reveal if user exists
            return successResponse(res, {}, 'If the email exists, a verification code has been sent');
        }

        if (user.isEmailVerified) {
            return errorResponse(res, 'Email already verified', 400);
        }

        // Delete old codes
        await prisma.verificationCode.deleteMany({
            where: { userId: user.id },
        });

        // Generate new code
        const code = generateVerificationCode();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await prisma.verificationCode.create({
            data: {
                userId: user.id,
                code,
                expiresAt,
            },
        });

        try {
            await sendVerificationEmail(email, code);
        } catch (emailError) {
            console.error('Failed to send verification email:', emailError);
        }

        return successResponse(res, {}, 'Verification code sent to your email');
    } catch (error) {
        next(error);
    }
};

// Forgot Password
exports.forgotPassword = async (req, res, next) => {
    try {
        const { email } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // Don't reveal if user exists
            return successResponse(res, {}, 'If the email exists, a password reset code has been sent');
        }

        // Delete old reset codes
        await prisma.passwordReset.deleteMany({
            where: { userId: user.id },
        });

        // Generate reset code
        const code = generateVerificationCode();
        const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

        await prisma.passwordReset.create({
            data: {
                userId: user.id,
                code,
                expiresAt,
            },
        });

        try {
            await sendPasswordResetEmail(email, code);
        } catch (emailError) {
            console.error('Failed to send password reset email:', emailError);
        }

        return successResponse(res, {}, 'Password reset code sent to your email');
    } catch (error) {
        next(error);
    }
};

// Verify Reset Code
exports.verifyResetCode = async (req, res, next) => {
    try {
        const { email, code } = req.body;

        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            return errorResponse(res, 'User not found', 404);
        }

        const resetCode = await prisma.passwordReset.findFirst({
            where: {
                userId: user.id,
                code,
                expiresAt: {
                    gte: new Date(),
                },
                used: false,
            },
        });

        if (!resetCode) {
            return errorResponse(res, 'Invalid or expired reset code', 400);
        }

        // Generate temporary reset token
        const resetToken = generateToken(user.id, '15m');

        return successResponse(res, {
            resetToken,
        }, 'Code verified successfully');
    } catch (error) {
        next(error);
    }
};

// Reset Password
exports.resetPassword = async (req, res, next) => {
    try {
        const { resetToken, newPassword } = req.body;

        // Verify reset token
        const decoded = require('jsonwebtoken').verify(resetToken, process.env.JWT_SECRET);
        const userId = decoded.userId;

        // Hash new password
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update password
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
        });

        // Mark all reset codes as used
        await prisma.passwordReset.updateMany({
            where: { userId },
            data: { used: true },
        });

        return successResponse(res, {}, 'Password reset successfully');
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return errorResponse(res, 'Invalid or expired reset token', 400);
        }
        next(error);
    }
};

// Get Current User
exports.getCurrentUser = async (req, res, next) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: req.user.id },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                isEmailVerified: true,
                createdAt: true,
                updatedAt: true,
            },
        });

        return successResponse(res, user);
    } catch (error) {
        next(error);
    }
};

// Google OAuth Callback
exports.googleCallback = async (req, res, next) => {
    try {
        // User is already authenticated by passport
        const user = req.user;

        // Generate tokens
        const accessToken = generateToken(user.id, '15m');
        const refreshToken = generateRefreshToken(user.id);

        const ipAddress = req.ip || req.connection.remoteAddress;
        const deviceInfo = req.headers['user-agent'] || 'Unknown Device';

        // Update user tracking
        await prisma.user.update({
            where: { id: user.id },
            data: {
                lastLoginAt: new Date(),
                lastLoginIp: ipAddress,
                loginAttempts: 0,
                lockedUntil: null,
            },
        });

        // Store refresh token with session details
        await prisma.refreshToken.create({
            data: {
                token: refreshToken,
                tokenHash: hashToken(refreshToken),
                userId: user.id,
                expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
                ipAddress,
                deviceInfo,
            },
        });

        // Set cookie
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 30 * 24 * 60 * 60 * 1000,
        });

        // Redirect to frontend with token
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/auth/callback?token=${accessToken}`);
    } catch (error) {
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
        res.redirect(`${frontendUrl}/login?error=authentication_failed`);
    }
};

module.exports = exports;
