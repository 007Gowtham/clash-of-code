/**
 * Advanced API Client with Error Handling, Retry Logic, and Request Interceptors
 * Production-ready implementation with comprehensive error management
 */

import { toast } from 'react-hot-toast';

// API Configuration
const API_CONFIG = {
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001',
    timeout: 20000, // 20 seconds
    retryAttempts: 3,
    retryDelay: 1000, // 1 second
};

// Error Types for better error handling
export const ErrorTypes = {
    NETWORK_ERROR: 'NETWORK_ERROR',
    TIMEOUT_ERROR: 'TIMEOUT_ERROR',
    VALIDATION_ERROR: 'VALIDATION_ERROR',
    AUTHENTICATION_ERROR: 'AUTHENTICATION_ERROR',
    AUTHORIZATION_ERROR: 'AUTHORIZATION_ERROR',
    NOT_FOUND_ERROR: 'NOT_FOUND_ERROR',
    SERVER_ERROR: 'SERVER_ERROR',
    RATE_LIMIT_ERROR: 'RATE_LIMIT_ERROR',
    UNKNOWN_ERROR: 'UNKNOWN_ERROR',
};

// Custom API Error Class
export class APIError extends Error {
    constructor(message, type, statusCode, errors = null, originalError = null) {
        super(message);
        this.name = 'APIError';
        this.type = type;
        this.statusCode = statusCode;
        this.errors = errors;
        this.originalError = originalError;
        this.timestamp = new Date().toISOString();
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            type: this.type,
            statusCode: this.statusCode,
            errors: this.errors,
            timestamp: this.timestamp,
        };
    }
}

// Token Management
class TokenManager {
    static getToken() {
        if (typeof window === 'undefined') return null;
        return localStorage.getItem('token');
    }

    static setToken(token) {
        if (typeof window === 'undefined') return;
        localStorage.setItem('token', token);
    }

    static removeToken() {
        if (typeof window === 'undefined') return;
        localStorage.removeItem('token');
        localStorage.removeItem('user');
    }

    static getUser() {
        if (typeof window === 'undefined') return null;
        const user = localStorage.getItem('user');
        return user ? JSON.parse(user) : null;
    }

    static setUser(user) {
        if (typeof window === 'undefined') return;
        localStorage.setItem('user', JSON.stringify(user));
    }
}

// Request Queue for retry logic
class RequestQueue {
    constructor() {
        this.queue = [];
        this.processing = false;
    }

    add(request) {
        this.queue.push(request);
        if (!this.processing) {
            this.process();
        }
    }

    async process() {
        this.processing = true;
        while (this.queue.length > 0) {
            const request = this.queue.shift();
            try {
                await request();
            } catch (error) {
                console.log('Request failed:', error);
            }
        }
        this.processing = false;
    }
}

const requestQueue = new RequestQueue();

// Error Parser - Converts API errors to user-friendly messages
class ErrorParser {
    static parse(error, response) {
        // Log for debugging
        if (process.env.NODE_ENV === 'development') {
            console.log('[API Error]', { error, response });
        }

        // Network errors (CORS, connection refused, etc.)
        if (!response && (error.message === 'Failed to fetch' || error.message.includes('fetch'))) {
            return new APIError(
                'Unable to connect to server. Please check if the backend is running on http://localhost:3001',
                ErrorTypes.NETWORK_ERROR,
                0,
                null,
                error
            );
        }

        // Timeout errors
        if (error.name === 'AbortError') {
            return new APIError(
                'Request timed out. Please try again.',
                ErrorTypes.TIMEOUT_ERROR,
                0,
                null,
                error
            );
        }

        // TypeError usually means CORS or network issue
        if (error instanceof TypeError) {
            return new APIError(
                'Network error. Please ensure the backend server is running and CORS is configured.',
                ErrorTypes.NETWORK_ERROR,
                0,
                null,
                error
            );
        }

        if (!response) {
            return new APIError(
                `Connection error: ${error.message || 'Unable to reach server'}`,
                ErrorTypes.UNKNOWN_ERROR,
                0,
                null,
                error
            );
        }

        const { status, data } = response;

        // Parse based on status code
        switch (status) {
            case 400:
                const error = new APIError(
                    data?.error || 'Invalid request',
                    ErrorTypes.VALIDATION_ERROR,
                    400,
                    data?.errors || null
                );
                return error;

            case 401:
                // Don't remove token on login/register failures
                // Only remove on actual auth failures
                const isLoginEndpoint = data?.message?.includes('Invalid') || data?.error?.includes('Invalid');
                if (!isLoginEndpoint) {
                    TokenManager.removeToken();
                }
                return new APIError(
                    data?.error || data?.message || 'Authentication failed. Please check your credentials.',
                    ErrorTypes.AUTHENTICATION_ERROR,
                    401
                );

            case 403:
                return new APIError(
                    data?.error || 'You do not have permission to perform this action.',
                    ErrorTypes.AUTHORIZATION_ERROR,
                    403
                );

            case 404:
                return new APIError(
                    data?.error || 'The requested resource was not found.',
                    ErrorTypes.NOT_FOUND_ERROR,
                    404
                );

            case 422:
                return new APIError(
                    'Validation failed. Please check your input.',
                    ErrorTypes.VALIDATION_ERROR,
                    422,
                    data?.errors || null
                );

            case 429:
                return new APIError(
                    'Too many requests. Please slow down and try again later.',
                    ErrorTypes.RATE_LIMIT_ERROR,
                    429
                );

            case 500:
            case 502:
            case 503:
            case 504:
                return new APIError(
                    'Server error. Our team has been notified. Please try again later.',
                    ErrorTypes.SERVER_ERROR,
                    status
                );

            default:
                return new APIError(
                    data?.error || 'An unexpected error occurred.',
                    ErrorTypes.UNKNOWN_ERROR,
                    status
                );
        }
    }

    static getUserMessage(error) {
        if (error instanceof APIError) {
            return error.message;
        }
        return 'An unexpected error occurred. Please try again.';
    }
}

// Request Interceptor
class RequestInterceptor {
    static async beforeRequest(url, options) {
        // Add authentication token
        const token = TokenManager.getToken();
        if (token) {
            options.headers = {
                ...options.headers,
                Authorization: `Bearer ${token}`,
            };
        }

        // Add default headers
        options.headers = {
            'Content-Type': 'application/json',
            ...options.headers,
        };

        // Log request in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`[API Request] ${options.method || 'GET'} ${url}`, {
                headers: options.headers,
                body: options.body,
            });
        }

        return { url, options };
    }

    static async afterResponse(response, url, options) {
        // Log response in development
        if (process.env.NODE_ENV === 'development') {
            console.log(`[API Response] ${options.method || 'GET'} ${url}`, {
                status: response.status,
                ok: response.ok,
            });
        }

        return response;
    }
}

// Main API Client
class APIClient {
    constructor(config = {}) {
        this.config = { ...API_CONFIG, ...config };
        this.abortControllers = new Map();
        this.isRefreshing = false;
        this.refreshSubscribers = [];
    }

    // Create abort controller for request cancellation
    createAbortController(requestId) {
        const controller = new AbortController();
        this.abortControllers.set(requestId, controller);
        return controller;
    }

    // Cancel specific request
    cancelRequest(requestId) {
        const controller = this.abortControllers.get(requestId);
        if (controller) {
            controller.abort();
            this.abortControllers.delete(requestId);
        }
    }

    // Cancel all pending requests
    cancelAllRequests() {
        this.abortControllers.forEach((controller) => controller.abort());
        this.abortControllers.clear();
    }

    // Sleep utility for retry delay
    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    subscribeTokenRefresh(cb) {
        this.refreshSubscribers.push(cb);
    }

    onTokenRefreshed(token) {
        this.refreshSubscribers.map((cb) => cb(token));
        this.refreshSubscribers = [];
    }

    async refreshAccessToken() {
        try {
            const response = await fetch(`${this.config.baseURL}/api/auth/refresh`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                credentials: 'include',
            });

            if (!response.ok) throw new Error('Refresh failed');

            const data = await response.json();
            const { accessToken } = data.data;
            TokenManager.setToken(accessToken);
            return accessToken;
        } catch (error) {
            TokenManager.removeToken();
            if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
                window.location.href = '/auth/login';
            }
            throw error;
        }
    }

    // Core request method with retry logic
    async request(endpoint, options = {}, retryCount = 0) {
        const url = `${this.config.baseURL}${endpoint}`;
        const requestId = `${options.method || 'GET'}-${endpoint}-${Date.now()}`;

        try {
            // Create abort controller
            const controller = this.createAbortController(requestId);
            const timeoutId = setTimeout(() => controller.abort(), this.config.timeout);

            // Apply request interceptor
            const { url: finalUrl, options: finalOptions } = await RequestInterceptor.beforeRequest(
                url,
                {
                    ...options,
                    signal: controller.signal,
                    credentials: 'include', // Ensure cookies are sent
                }
            );

            // Make request
            let response = await fetch(finalUrl, finalOptions);
            clearTimeout(timeoutId);

            // 401 Handling - Auto Refresh
            if (response.status === 401 && !endpoint.includes('/auth/login') && !endpoint.includes('/auth/register') && !endpoint.includes('/auth/refresh')) {
                if (this.isRefreshing) {
                    return new Promise((resolve, reject) => {
                        this.subscribeTokenRefresh(async (token) => {
                            try {
                                const retryOptions = {
                                    ...finalOptions,
                                    headers: {
                                        ...finalOptions.headers,
                                        Authorization: `Bearer ${token}`,
                                    },
                                };
                                const retryResponse = await fetch(finalUrl, retryOptions);
                                // We need to process this response same as below
                                const retryData = await retryResponse.json();
                                if (!retryResponse.ok) {
                                    // Handle error accordingly
                                    throw ErrorParser.parse(new Error('Retry failed'), { status: retryResponse.status, data: retryData });
                                }
                                resolve(retryData);
                            } catch (err) {
                                reject(err);
                            }
                        });
                    });
                }

                this.isRefreshing = true;

                try {
                    const newToken = await this.refreshAccessToken();
                    this.isRefreshing = false;
                    this.onTokenRefreshed(newToken);

                    // Retry original request
                    const retryOptions = {
                        ...finalOptions,
                        headers: {
                            ...finalOptions.headers,
                            Authorization: `Bearer ${newToken}`,
                        },
                    };
                    response = await fetch(finalUrl, retryOptions);
                } catch (refreshError) {
                    this.isRefreshing = false;
                    this.refreshSubscribers = []; // Clear queue
                    throw refreshError;
                }
            }

            // Apply response interceptor
            response = await RequestInterceptor.afterResponse(response, finalUrl, finalOptions);

            // Parse response
            const data = await response.json();

            // Handle non-OK responses
            if (!response.ok) {
                const error = ErrorParser.parse(new Error('Request failed'), {
                    status: response.status,
                    data,
                });

                // Retry on server errors
                if (
                    error.type === ErrorTypes.SERVER_ERROR &&
                    retryCount < this.config.retryAttempts
                ) {
                    await this.sleep(this.config.retryDelay * (retryCount + 1));
                    return this.request(endpoint, options, retryCount + 1);
                }

                throw error;
            }

            // Clean up abort controller
            this.abortControllers.delete(requestId);

            return data;
        } catch (error) {
            // Clean up abort controller
            this.abortControllers.delete(requestId);

            // If it's already an APIError (from the !response.ok block), just throw it
            if (error instanceof APIError) {
                // Handle authentication errors (but don't redirect if already on auth pages)
                if (error.type === ErrorTypes.AUTHENTICATION_ERROR) {
                    if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
                        // We already tried refreshing, if it failed/error, we redirect
                        window.location.href = '/auth/login';
                    }
                }
                throw error;
            }

            // Parse error for network/timeout issues
            const apiError = ErrorParser.parse(error);

            // Retry on network errors
            if (
                apiError.type === ErrorTypes.NETWORK_ERROR &&
                retryCount < this.config.retryAttempts
            ) {
                await this.sleep(this.config.retryDelay * (retryCount + 1));
                return this.request(endpoint, options, retryCount + 1);
            }

            // Handle authentication errors (but don't redirect if already on auth pages)
            if (apiError.type === ErrorTypes.AUTHENTICATION_ERROR) {
                if (typeof window !== 'undefined' && !window.location.pathname.startsWith('/auth')) {
                    window.location.href = '/auth/login';
                }
            }

            throw apiError;
        }
    }

    // HTTP Methods
    async get(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'GET' });
    }

    async post(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: JSON.stringify(data),
        });
    }

    async put(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PUT',
            body: JSON.stringify(data),
        });
    }

    async patch(endpoint, data, options = {}) {
        return this.request(endpoint, {
            ...options,
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    }

    async delete(endpoint, options = {}) {
        return this.request(endpoint, { ...options, method: 'DELETE' });
    }

    // File upload
    async upload(endpoint, formData, options = {}) {
        const headers = { ...options.headers };
        delete headers['Content-Type']; // Let browser set it for FormData

        return this.request(endpoint, {
            ...options,
            method: 'POST',
            body: formData,
            headers,
        });
    }
}

// Create singleton instance
const apiClient = new APIClient();

// Export utilities
export { apiClient, TokenManager, ErrorParser, ErrorTypes };
export default apiClient;
