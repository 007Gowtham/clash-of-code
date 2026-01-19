const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const passport = require('../config/passport');
const { authenticateToken } = require('../middleware/auth');
const {
    registerValidation,
    loginValidation,
    verifyEmailValidation,
} = require('../middleware/validation');
const { authLimiter } = require('../middleware/rateLimiter');

// Public routes
router.post('/register', authLimiter, registerValidation, authController.register);
router.post('/verify-email', authLimiter, verifyEmailValidation, authController.verifyEmail);
router.post('/login', authLimiter, loginValidation, authController.login);
router.post('/refresh', authController.refreshAccessToken);
router.post('/logout', authController.logout);
router.post('/resend-verification', authLimiter, authController.resendVerification);
router.post('/forgot-password', authLimiter, authController.forgotPassword);
router.post('/verify-reset-code', authLimiter, authController.verifyResetCode);
router.post('/reset-password', authLimiter, authController.resetPassword);

// Google OAuth routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get('/google/callback',
    passport.authenticate('google', { session: false, failureRedirect: '/login' }),
    authController.googleCallback
);

// Protected routes
router.get('/me', authenticateToken, authController.getCurrentUser);
router.post('/logout-all', authenticateToken, authController.logoutAllDevices);

module.exports = router;
