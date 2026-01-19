/**
 * Logger Configuration with Winston
 * Provides structured logging with correlation IDs
 */

const winston = require('winston');
const path = require('path');

// Define log format
const logFormat = winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json()
);

// Console format for development
const consoleFormat = winston.format.combine(
    winston.format.colorize(),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.printf(({ timestamp, level, message, correlationId, ...meta }) => {
        let log = `${timestamp} [${level}]`;
        if (correlationId) {
            log += ` [${correlationId}]`;
        }
        log += `: ${message}`;

        if (Object.keys(meta).length > 0) {
            log += ` ${JSON.stringify(meta)}`;
        }

        return log;
    })
);

// Create logger instance
const logger = winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: logFormat,
    defaultMeta: { service: 'code-execution' },
    transports: [
        // Write all logs to console
        new winston.transports.Console({
            format: consoleFormat
        }),
        // Write all logs to combined.log
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/combined.log'),
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Write error logs to error.log
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/error.log'),
            level: 'error',
            maxsize: 5242880, // 5MB
            maxFiles: 5,
        }),
        // Write execution logs separately
        new winston.transports.File({
            filename: path.join(__dirname, '../../logs/execution.log'),
            maxsize: 10485760, // 10MB
            maxFiles: 10,
        }),
    ],
});

// Create child logger with correlation ID
logger.withCorrelation = (correlationId) => {
    return logger.child({ correlationId });
};

// Execution-specific logging methods
logger.logExecution = (correlationId, data) => {
    logger.info('Code execution', {
        correlationId,
        ...data
    });
};

logger.logExecutionResult = (correlationId, data) => {
    logger.info('Execution result', {
        correlationId,
        ...data
    });
};

logger.logExecutionError = (correlationId, error, data = {}) => {
    logger.error('Execution error', {
        correlationId,
        error: error.message,
        stack: error.stack,
        ...data
    });
};

// Metrics logging
logger.logMetrics = (metric, value, tags = {}) => {
    logger.info('Metric', {
        metric,
        value,
        ...tags
    });
};

module.exports = logger;
