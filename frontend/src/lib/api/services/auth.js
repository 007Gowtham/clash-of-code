/**
 * Authentication API Service
 * Handles all authentication-related API calls
 */

import apiClient, { TokenManager } from '../client';

class AuthAPI {
    /**
     * Register a new user
     * @param {Object} userData - User registration data
     * @param {string} userData.username - Username
     * @param {string} userData.email - Email address
     * @param {string} userData.password - Password
     * @returns {Promise<Object>} Registration response
     */
    async register(userData) {
        const response = await apiClient.post('/api/auth/register', userData);
        return response.data;
    }

    /**
     * Verify email with code
     * @param {string} email - User email
     * @param {string} code - Verification code
     * @returns {Promise<Object>} Verification response with token
     */
    async verifyEmail(email, code) {
        const response = await apiClient.post('/api/auth/verify-email', { email, code });

        if (response.success && (response.data.accessToken || response.data.token)) {
            TokenManager.setToken(response.data.accessToken || response.data.token);
            TokenManager.setUser(response.data.user);
        }

        return response.data;
    }

    /**
     * Login with email and password
     * @param {string} email - User email
     * @param {string} password - User password
     * @returns {Promise<Object>} Login response with token
     */
    async login(email, password) {
        const response = await apiClient.post('/api/auth/login', { email, password });

        if (response.success && (response.data.accessToken || response.data.token)) {
            TokenManager.setToken(response.data.accessToken || response.data.token);
            TokenManager.setUser(response.data.user);
        }

        return response.data;
    }

    /**
     * Resend verification code
     * @param {string} email - User email
     * @returns {Promise<Object>} Response
     */
    async resendVerification(email) {
        const response = await apiClient.post('/api/auth/resend-verification', { email });
        return response.data;
    }

    /**
     * Request password reset
     * @param {string} email - User email
     * @returns {Promise<Object>} Response
     */
    async forgotPassword(email) {
        const response = await apiClient.post('/api/auth/forgot-password', { email });
        return response.data;
    }

    /**
     * Verify password reset code
     * @param {string} email - User email
     * @param {string} code - Reset code
     * @returns {Promise<Object>} Response with reset token
     */
    async verifyResetCode(email, code) {
        const response = await apiClient.post('/api/auth/verify-reset-code', { email, code });
        return response.data;
    }

    /**
     * Reset password
     * @param {string} resetToken - Reset token from verify step
     * @param {string} newPassword - New password
     * @returns {Promise<Object>} Response
     */
    async resetPassword(resetToken, newPassword) {
        const response = await apiClient.post('/api/auth/reset-password', {
            resetToken,
            newPassword,
        });
        return response.data;
    }

    /**
     * Get current user profile
     * @returns {Promise<Object>} User profile
     */
    async getCurrentUser() {
        const response = await apiClient.get('/api/auth/me');

        if (response.success && response.data) {
            TokenManager.setUser(response.data);
        }

        return response.data;
    }

    /**
     * Logout user
     */
    async logout() {
        try {
            await apiClient.post('/api/auth/logout');
        } catch (error) {
            console.error('Logout failed:', error);
        }
        TokenManager.removeToken();
        if (typeof window !== 'undefined') {
            window.location.href = '/auth/login';
        }
    }

    /**
     * Check if user is authenticated
     * @returns {boolean}
     */
    isAuthenticated() {
        return !!TokenManager.getToken();
    }

    /**
     * Get stored user data
     * @returns {Object|null}
     */
    getUser() {
        return TokenManager.getUser();
    }

    /**
     * Initiate Google OAuth login
     */
    loginWithGoogle() {
        if (typeof window !== 'undefined') {
            window.location.href = `${process.env.NEXT_PUBLIC_API_URL}/api/auth/google`;
        }
    }

    /**
     * Handle Google OAuth callback
     * @param {string} token - Token from URL params
     */
    handleGoogleCallback(token) {
        if (token) {
            TokenManager.setToken(token);
            return this.getCurrentUser();
        }
        throw new Error('No token provided');
    }
}

// Create singleton instance
const authAPI = new AuthAPI();

export default authAPI;
