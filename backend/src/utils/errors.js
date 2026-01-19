/**
 * Custom Error Classes for Code Execution System
 */

class BaseExecutionError extends Error {
    constructor(message, correlationId = null) {
        super(message);
        this.name = this.constructor.name;
        this.correlationId = correlationId;
        this.timestamp = new Date().toISOString();
        Error.captureStackTrace(this, this.constructor);
    }

    toJSON() {
        return {
            name: this.name,
            message: this.message,
            correlationId: this.correlationId,
            timestamp: this.timestamp,
        };
    }
}

class NetworkError extends BaseExecutionError {
    constructor(message, correlationId = null, statusCode = null) {
        super(message, correlationId);
        this.statusCode = statusCode;
        this.retryable = true;
    }
}

class TimeoutError extends BaseExecutionError {
    constructor(message, correlationId = null, duration = null) {
        super(message, correlationId);
        this.duration = duration;
        this.retryable = true;
    }
}

class CompilationError extends BaseExecutionError {
    constructor(message, correlationId = null, compilerOutput = null) {
        super(message, correlationId);
        this.compilerOutput = compilerOutput;
        this.retryable = false;
    }
}

class RuntimeError extends BaseExecutionError {
    constructor(message, correlationId = null, errorType = null) {
        super(message, correlationId);
        this.errorType = errorType;
        this.retryable = false;
    }
}

class ResourceLimitError extends BaseExecutionError {
    constructor(message, correlationId = null, limitType = null) {
        super(message, correlationId);
        this.limitType = limitType; // 'TIME' or 'MEMORY'
        this.retryable = false;
    }
}

class Judge0Error extends BaseExecutionError {
    constructor(message, correlationId = null, statusCode = null) {
        super(message, correlationId);
        this.statusCode = statusCode;
        this.retryable = statusCode >= 500; // Retry on 5xx errors
    }
}

class RateLimitError extends BaseExecutionError {
    constructor(message, correlationId = null, retryAfter = null) {
        super(message, correlationId);
        this.retryAfter = retryAfter;
        this.retryable = true;
    }
}

module.exports = {
    BaseExecutionError,
    NetworkError,
    TimeoutError,
    CompilationError,
    RuntimeError,
    ResourceLimitError,
    Judge0Error,
    RateLimitError,
};
