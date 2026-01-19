const rateLimit = require('express-rate-limit');

// Check if in development mode
const isDevelopment = process.env.NODE_ENV !== 'production';

// Get rate limit configuration from environment or use defaults
const CODE_EXECUTION_LIMIT = parseInt(process.env.CODE_EXECUTION_LIMIT) || (isDevelopment ? 1000 : 10);
const CODE_EXECUTION_WINDOW_MS = parseInt(process.env.CODE_EXECUTION_WINDOW_MS) || 1 * 60 * 1000; // 1 minute

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: isDevelopment
        ? 10000 // Very high limit for development (no practical limit)
        : parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 500, // Reasonable limit for production
    message: {
        success: false,
        error: 'Too many requests. Please slow down and try again later.',
    },
    standardHeaders: true,
    legacyHeaders: false,
    skip: (req) => {
        // Skip rate limiting for health checks
        return req.path === '/health';
    }
});

// Auth endpoints rate limiter (stricter)
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: isDevelopment ? 100 : 5, // More lenient in development
    skipSuccessfulRequests: true,
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        success: false,
        error: 'Too many authentication attempts, please try again later',
    },
});

// Code execution rate limiter with proper reset logic
const codeLimiter = rateLimit({
    windowMs: CODE_EXECUTION_WINDOW_MS, // 1 minute
    max: CODE_EXECUTION_LIMIT, // 1000 in dev, 10 in prod

    // Enable standard headers for proper rate limit info
    standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
    legacyHeaders: false, // Disable the `X-RateLimit-*` headers

    // Don't skip any requests - count all attempts
    skipFailedRequests: false,
    skipSuccessfulRequests: false,

    // Custom key generator for consistent IP tracking
    keyGenerator: (req) => {
        // Use IP from various sources (handles proxies)
        return req.ip ||
            req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
            req.headers['x-real-ip'] ||
            req.connection?.remoteAddress ||
            'unknown';
    },

    // Custom handler with detailed error response including reset time
    handler: (req, res, options) => {
        const resetTime = new Date(Date.now() + options.windowMs);
        const resetInSeconds = Math.ceil(options.windowMs / 1000);
        const resetInMinutes = Math.ceil(resetInSeconds / 60);

        // Log rate limit hit for monitoring
        console.warn(`[Rate Limit] Code execution limit exceeded for IP: ${req.ip || 'unknown'} at ${new Date().toISOString()}`);

        res.status(429).json({
            success: false,
            error: `Too many code executions. Please wait ${resetInMinutes} minute${resetInMinutes > 1 ? 's' : ''} before trying again.`,
            details: {
                limit: options.max,
                windowMs: options.windowMs,
                resetAt: resetTime.toISOString(),
                resetIn: resetInSeconds, // seconds until reset
                current: req.rateLimit?.current || options.max,
                remaining: 0,
                retryAfter: resetInSeconds
            }
        });
    },

    // Fallback message (used if handler is not called)
    message: {
        success: false,
        error: 'Too many code executions, please wait before trying again',
    },
});

// Log rate limiter configuration on startup
console.log('📊 Rate Limiter Configuration:');
console.log(`   Environment: ${isDevelopment ? 'Development' : 'Production'}`);
console.log(`   Code Execution Limit: ${CODE_EXECUTION_LIMIT} requests per ${CODE_EXECUTION_WINDOW_MS / 1000} seconds`);
console.log(`   API Limit: ${isDevelopment ? 10000 : 500} requests per 15 minutes`);
console.log(`   Auth Limit: ${isDevelopment ? 100 : 5} requests per 15 minutes`);

module.exports = { apiLimiter, authLimiter, codeLimiter };
