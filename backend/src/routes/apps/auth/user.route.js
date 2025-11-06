import { 
    userRegisterValidator,
    userloginValidator
} from "../../../validators/apps/user.validator.js";

import { 
    UserRegisterController,
    UserLoginController,
    refreshAccessTokenController,
    SocialLoginController,
    VerifyEmailController,
    ResendPasswordVerifyController,
    ForgotPasswordController,
    ResendEmailVerificationController,
    ResetPasswordController,
    getCurrentUserController,
    UserLogoutController,
    ChangePasswordController,

} from "../../../controllers/auth/user.controller.js";

import { validate } from "../../../validators/validate.js";
import { Router } from "express";
import verifyToken from "../../../middlewares/auth.middleware.js";
import passport from "passport";

const router = Router();

/**
 * Authentication Routes
 * -------------------
 * Basic email/password authentication endpoints
 * 
 * POST /register
 * @body {string} username - User's display name
 * @body {string} email - Valid email address
 * @body {string} password - Password (min 8 chars)
 * @returns {Object} Created user object with verification email sent
 * 
 * POST /login 
 * @body {string} email - Registered email address
 * @body {string} password - User's password
 * @returns {Object} Access token, refresh token and user data
 * 
 * POST /refresh-token
 * @header Authorization - Bearer refresh_token
 * @returns {Object} New access token
 * 
 * POST /logout
 * @header Authorization - Bearer access_token 
 * @returns {Object} Logout success message
 * 
 * GET /me
 * @header Authorization - Bearer access_token
 * @returns {Object} Current user profile data
 *
 * POST /change-password
 * @header Authorization - Bearer access_token
 * @body {string} currentPassword - Current password
 * @body {string} newPassword - New password
 * @returns {Object} Password change confirmation
 */
router.route('/register')
    .post(userRegisterValidator(), validate, UserRegisterController);

router.route('/login')
    .post(userloginValidator(), validate, UserLoginController);

router.route('/refresh-token')
    .post(validate, refreshAccessTokenController);

router.route('/logout')
    .post(verifyToken, UserLogoutController);

router.route('/me')
    .get(verifyToken, getCurrentUserController);

router.route('/change-password')
    .post(verifyToken, validate, ChangePasswordController);

/**
 * Email Verification Routes
 * -----------------------
 * Endpoints for verifying and managing email verification
 * 
 * GET /verify-email/:token
 * @param {string} token - Email verification token received in email
 * @returns {Redirect} Redirects to frontend after verification
 * 
 * POST /resend-email-verification
 * @body {string} email - Registered email address
 * @returns {Object} Confirmation of verification email resend
 */
router.route('/verify-email/:token')
    .get(VerifyEmailController);

router.route('/resend-email-verification')
    .post(ResendEmailVerificationController);

/**
 * Password Management Routes
 * ------------------------
 * Endpoints for password reset flow
 * 
 * POST /forgot-password
 * @body {string} email - Registered email address
 * @returns {Object} Confirmation of reset email sent
 * 
 * GET /reset-password/verify/:token
 * @param {string} token - Password reset token from email
 * @returns {Redirect} Redirects to frontend reset password page
 * 
 * POST /reset-password/:token
 * @param {string} token - Password reset token from email
 * @body {string} newPassword - New password to set
 * @returns {Object} Password reset confirmation
 */
router.route('/forgot-password')
    .post(validate, ForgotPasswordController);

router.route('/reset-password/verify/:token')
    .get(ResendPasswordVerifyController);

router.route('/reset-password/:token')
    .post(validate, ResetPasswordController);

/**
 * OAuth Routes
 * -----------
 * Social authentication endpoints
 * 
 * GET /github
 * Initiates GitHub OAuth flow
 * @returns {Redirect} Redirects to GitHub login
 * 
 * GET /github/callback
 * Handles GitHub OAuth callback
 * @returns {Object} Access token, refresh token and user data
 * 
 * GET /google  
 * Initiates Google OAuth flow
 * @returns {Redirect} Redirects to Google login
 * 
 * GET /google/callback
 * Handles Google OAuth callback
 * @returns {Object} Access token, refresh token and user data
 */
// GitHub OAuth
router.get('/github',
    passport.authenticate('github', { 
        scope: ['user:email'] 
    })
);

router.get('/github/callback',
    passport.authenticate('github', { 
        session: false 
    }),
    SocialLoginController
);

// Google OAuth
router.get('/google',
    passport.authenticate('google', { 
        scope: ['profile', 'email'] 
    })
);

router.get('/google/callback',
    passport.authenticate('google', { 
        session: false 
    }),
    SocialLoginController
);

export default router;
