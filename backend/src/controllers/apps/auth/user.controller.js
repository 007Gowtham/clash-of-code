import {
    UserRegisterModel,
    generateAccessToken,
    generateRefreshToken,
    isPasswordCorrect,
    generateTemporaryToken
} from "../../../models/apps/auth/user.model.js";
import {
    sendEmail,
    emailVerification,
    forgotPassword  
} from "../../../utils/mail.js";
import { asyncHandler } from "../../../utils/asyncHandler.js";
import { ApiError } from "../../../utils/ApiError.js";
import { ApiResponse } from "../../../utils/ApiResponse.js";
import { prisma } from "../../../db/index.js";
import { LoginTypesEnum } from "../../../constants.js";
import logger from "../../../logger/winston.logger.js";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';


/**
 * User Registration Controller
 * --------------------------
 * Registers a new user and sends verification email
 * 
 * @param {Object} req.body
 * @param {string} req.body.username - User's display name
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password (will be hashed)
 * @param {string} [req.body.role="USER"] - User's role (defaults to "USER")
 */
export const UserRegisterController = asyncHandler(async (req, res, next) => {
    const { username, email, password, role = "USER" } = req.body;

    const data = {
        username,
        email,
        password,
        role,
    };

    const user = await UserRegisterModel(data);

    if (!user) {
        throw new ApiError(500, 'User registration failed');
    }
 
    logger.info(`Generating email verification token for user: ${user.email}`);
    const { unhashedToken, hashedToken, tokenExpiry } = generateTemporaryToken();

    logger.info(`Storing email verification token for user: ${user.email}`);
    await prisma.user.update({
        where: { id: user.id },
        data: {
            emailVerificationToken: hashedToken,
            emailVerificationExpiry: tokenExpiry,
        },
    });
        // Use the stored user name if available, otherwise fall back to the provided username
        const displayName = user.name || username || user.email;
        const verificationUrl = `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unhashedToken}`;

        await sendEmail(email, 'Email Verification', emailVerification(displayName, verificationUrl));

   

    logger.info(`User registered successfully: ${user.email}`);

    res.status(201).json(new ApiResponse(201, 'User registered successfully', user));
});



/**
 * User Login Controller
 * -------------------
 * Authenticates user and returns access/refresh tokens
 * 
 * @param {Object} req.body
 * @param {string} req.body.email - User's email address
 * @param {string} req.body.password - User's password to verify
 * @returns {Object} Tokens and user data
 */
export const UserLoginController = asyncHandler(async (req, res, next) => {
    const { email, password } = req.body;
    

    const user = await prisma.user.findUnique({
        where: {
            email: email,
        },
    });


     if(!user)
     {
        throw new ApiError(404,"user not found please provide correct email");
     }

      
    if(user.loginType !==LoginTypesEnum.EMAIL_PASSWORD){
        throw new ApiError(400, `Please login using ${user.loginType}`);
    }
    
    if(!user.isEmailVerified)
    {
        throw new ApiError(403,"please verify your the email ");
        logger.error("email is not verifyed");
    }
    if (!user) {
        throw new ApiError(404, 'User not found');
    }
    const isPasswordValid = await isPasswordCorrect(user.password, password);

    if (!isPasswordValid) {
        throw new ApiError(401, 'Invalid credentials');
    }

    const accessToken = await generateAccessToken(user.id);
    const refreshToken = await generateRefreshToken(user.id);
    
    const responseData = await prisma.user.update({
        where: {
            id: user.id,
        },
        data: {
            refreshToken: refreshToken,
        },
    });

    res
    .cookie('refreshToken', refreshToken)
    .cookie('accessToken', accessToken)
    .status(200).json(new ApiResponse(200, 'User logged in successfully', {
        accessToken,
        refreshToken,
        user: responseData,
    }));
});

export const refreshAccessTokenController = asyncHandler(async (req, res, next) => {
    const token = req.headers['authorization']?.replace('Bearer ', '');

    if (!token) {
        return next(new ApiError(401, 'No token provided'));
    }
      logger.info(`Refreshing access token with refresh token: ${token}`);
    try {
        logger.info(`Attempting to verify token with secret: ${process.env.JWT_REFRESH_SECRET?.substring(0, 3)}...`);
        const decoded = await jwt.verify(token, process.env.JWT_REFRESH_SECRET);
        logger.info(`Token verified successfully. Decoded payload: ${JSON.stringify(decoded)}`);
        
        const user = await prisma.user.findUnique({
            where: { id: decoded.id },
        });

        if (!user) {
            logger.error(`User not found for decoded id: ${decoded.id}`);
            return next(new ApiError(401, 'User not found'));
        }

        if (user.refreshToken !== token) {
            logger.error(`Token mismatch. Stored: ${user.refreshToken?.substring(0, 10)}..., Received: ${token.substring(0, 10)}...`);
            throw new ApiError(401, "Refresh token is expired or used");
        }

        const newAccessToken = await generateAccessToken(user.id);
        logger.info(`Generated new access token for user ${user.id}`);
        
        res.status(200).json(new ApiResponse(200, 'Access token refreshed successfully', {
            accessToken: newAccessToken,
        }));
    } catch (error) {
        logger.error(`Token verification failed: ${error.message}`);
        return next(new ApiError(401, `Invalid token: ${error.message}`));
    }
});

export const SocialLoginController = asyncHandler(async (req, res, next) => {
    const user = await prisma.user.findUnique({
        where: {
            id: req.user.id,
        },
    });
    
    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    const accessToken = await generateAccessToken(user.id);
    const refreshToken = await generateRefreshToken(user.id);
    
    const responseData = await prisma.user.update({
        where: {
            id: user.id,
        },
        data: {
            refreshToken: refreshToken,
        },
    });

    res
    .cookie('refreshToken', refreshToken)
    .cookie('accessToken', accessToken)
    .status(200).json(new ApiResponse(200, 'User logged in successfully via social login', {
        accessToken,
        refreshToken,
        user: responseData,
    }));
});

/**
 * Email Verification Controller
 * --------------------------
 * Verifies user's email using token from email link
 * 
 * @param {Object} req.params
 * @param {string} req.params.token - Verification token from email
 * @param {string} [req.query.token] - Alternative: token from query string
 * @param {string} [req.body.token] - Alternative: token from request body
 */
export const VerifyEmailController = asyncHandler(async (req, res, next) => {
    logger.info('Starting email verification process');
    // Get token from params, query, or body and ensure it's a string
    const token = req.params.token || req.query.token || req.body.token || '';
    
    if (!token) {
        logger.error('No verification token provided');
        return next(new ApiError(400, 'Verification token is required'));
    }

    // Ensure token is a string before hashing
    const tokenString = token.toString();
    const hashedToken = crypto.createHash('sha256').update(tokenString).digest('hex');
    
    const user = await prisma.user.findFirst({
        where: {
            emailVerificationToken: hashedToken,
            emailVerificationExpiry: {
                gt: new Date(),
            },
        },
    });

    if (!user) {
        throw new ApiError(400, 'Invalid or expired email verification token');
    }

    await prisma.user.update({
        where: { id: user.id },
        data: {
            isEmailVerified: true,
            emailVerificationToken: null,
            emailVerificationExpiry: null,
        },
    });

    res.redirect('http://localhost:5173/');
    
});


export const ForgotPasswordController = asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
        where: {
            email: email,
        },
    });

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    logger.info(`Generating password reset token for user: ${user.email}`);
    const { unhashedToken, hashedToken, tokenExpiry } = generateTemporaryToken();
    
    // Log token details (first 10 chars only for security)
    logger.info(`Generated tokens for ${user.email}:`);
    logger.info(`- Unhashed (first 10): ${unhashedToken.substring(0, 10)}...`);
    logger.info(`- Hashed (first 10): ${hashedToken.substring(0, 10)}...`);
    logger.info(`- Expires: ${tokenExpiry}`);

    // Update user with reset token
    logger.info(`Storing password reset token for user: ${user.email}`);
    const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: {
            forgetPasswordToken: hashedToken,
            forgetPasswordExpiry: tokenExpiry,
        },
        select: {
            id: true,
            email: true,
            forgetPasswordToken: true,
            forgetPasswordExpiry: true
        }
    });

    // Verify token was stored correctly
    logger.info(`Token stored. Verification:
        - Token stored: ${updatedUser.forgetPasswordToken.substring(0, 10)}...
        - Expiry set to: ${updatedUser.forgetPasswordExpiry}
    `);

    const displayName = user.name || user.email;
    const resetUrl = `${req.protocol}://${req.get("host")}/api/v1/users/reset-password/verify/${unhashedToken}`;

    await sendEmail(email, 'Password Reset Request', forgotPassword(displayName, resetUrl));

    logger.info(`Password reset email sent to: ${user.email}`);

   
    res.status(200).json(new ApiResponse(200, 'Password reset email sent successfully'));
});

export const ResendPasswordVerifyController = asyncHandler(async (req, res, next) => {
    logger.info('Starting password reset token verification process');
    
    // 1. Get and validate token
    const token = req.params.token || req.query.token || req.body.token;
    logger.info(`Received token: ${token?.substring(0, 10)}...`);

    if (!token) {
        logger.error('No token provided in request');
        return next(new ApiError(400, 'Password reset token is required'));
    }

    // 2. Hash the token
    const hashedToken = crypto.createHash('sha256').update(token.toString()).digest('hex');
    logger.info(`Hashed token: ${hashedToken.substring(0, 10)}...`);

    // 3. Log the search criteria
    const searchCriteria = {
        forgetPasswordToken: hashedToken,
        forgetPasswordExpiry: { gt: new Date() }
    };
    logger.info('Searching for user with criteria:', searchCriteria);

    // 4. Search for user with valid token
    const user = await prisma.user.findFirst({
        where: {
            forgetPasswordToken: hashedToken,
            forgetPasswordExpiry: {
                gt: new Date(),
            },
        },
        select: {
            id: true,
            email: true,
            forgetPasswordToken: true,
            forgetPasswordExpiry: true
        }
    });

    // 5. Log search results
    if (!user) {
        logger.error('No user found with matching token and valid expiry');
        
        // Check if user exists with this token but expired
        const expiredUser = await prisma.user.findFirst({
            where: { forgetPasswordToken: hashedToken },
            select: {
                forgetPasswordExpiry: true
            }
        });

        if (expiredUser) {
            logger.error(`Token found but expired. Expiry was: ${expiredUser.forgetPasswordExpiry}`);
            throw new ApiError(400, 'Password reset token has expired');
        } else {
            logger.error('No user found with this token at all');
            throw new ApiError(400, 'Invalid password reset token');
        }
    }

    logger.info(`Found user with ID: ${user.id}. Token is valid.`);



    res.redirect('http://localhost:5173/');

});

export const ResendEmailVerificationController = asyncHandler(async (req, res, next) => {
    const { email } = req.body;

    const user = await prisma.user.findUnique({
        where: {
            email: email,
        },
    });

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    if (user.isEmailVerified) {
        throw new ApiError(400, 'Email is already verified');
    }

    logger.info(`Generating new email verification token for user: ${user.email}`);
    const { unhashedToken, hashedToken, tokenExpiry } = generateTemporaryToken();

    logger.info(`Storing new email verification token for user: ${user.email}`);
    await prisma.user.update({
        where: { id: user.id },
        data: {
            emailVerificationToken: hashedToken,
            emailVerificationExpiry: tokenExpiry,
        },
    });

    const displayName = user.name || user.email;
    const verificationUrl = `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unhashedToken}`;

    await sendEmail(email, 'Resend Email Verification', emailVerification(displayName, verificationUrl));

    logger.info(`Resent email verification to: ${user.email}`);

    res.status(200).json(new ApiResponse(200, 'Verification email resent successfully'));
});


export const ResetPasswordController = asyncHandler(async (req, res, next) => {
    const { newPassword } = req.body;
    const token = req.params.token; // Get token from params and default to empty string

    if (!token) {
        return next(new ApiError(400, 'Password reset token is required'));
    }

    logger.info(`Starting password reset process with token: ${token}...`);
    
const hashedToken = crypto.createHash('sha256').update(token.toString()).digest('hex');
    const user = await prisma.user.findFirst({
        where: {
            forgetPasswordToken: hashedToken,
            forgetPasswordExpiry: {
                gt: new Date(),
            },
        },
    });

    if (!user) {
        throw new ApiError(400, 'Invalid or expired password reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { id: user.id },
        data: {
            password: hashedPassword,
            forgetPasswordToken: null,
            forgetPasswordExpiry: null,
        },
    });

    res.status(200).json(new ApiResponse(200, 'Password has been reset successfully'));
});

export const UserLogoutController = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;

    await prisma.user.update({
        where: { id: userId },
        data: {
            refreshToken: null,
        },
    });

    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');

    res.status(200).json(new ApiResponse(200, 'User logged out successfully'));
}); 

export const ChangePasswordController = asyncHandler(async (req, res, next) => {
    const userId = req.user.id;
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    const isPasswordValid = await isPasswordCorrect(user.password, currentPassword);

    if (!isPasswordValid) {
        throw new ApiError(401, 'Current password is incorrect');
    }

    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
        where: { id: userId },
        data: {
            password: hashedNewPassword,
        },
    });

    res.status(200).json(new ApiResponse(200, 'Password changed successfully'));
});

export const getCurrentUserController = asyncHandler(async (req, res, next) => {
    const userid = req.user.id;

    logger.info(`Fetching current user with ID: ${userid}`);

    const user = await prisma.user.findUnique({
        where: { id: userid },
    });

    if (!user) {
        throw new ApiError(404, 'User not found');
    }

    res.status(200).json(new ApiResponse(200, 'Current user fetched successfully', user));
});

