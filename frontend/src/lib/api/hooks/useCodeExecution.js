/**
 * Code Execution API Hook
 * Handles running and submitting code with real backend integration
 */

import { useState } from 'react';
import { apiClient } from '../client';

export function useCodeExecution() {
    const [isRunning, setIsRunning] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [runResult, setRunResult] = useState(null);
    const [submitResult, setSubmitResult] = useState(null);
    const [error, setError] = useState(null);

    /**
     * Run code against sample test cases
     */
    const runCode = async (questionId, code, language, teamId) => {
        setIsRunning(true);
        setError(null);
        setRunResult(null);

        try {
            const response = await apiClient.post(
                `/api/submissions/run-function/${questionId}`,
                { userFunctionCode: code, language, teamId }
            );

            setRunResult(response.data);
            return response.data;
        } catch (err) {
            // Enhanced error handling for rate limits
            if (err.status === 429 || err.response?.status === 429) {
                const errorData = err.data || err.response?.data;
                if (errorData?.details?.resetIn) {
                    const minutes = Math.ceil(errorData.details.resetIn / 60);
                    const resetTime = new Date(errorData.details.resetAt).toLocaleTimeString();
                    const errorMessage = `⏱️ Rate limit exceeded. Please wait ${minutes} minute${minutes > 1 ? 's' : ''} before trying again. (Resets at ${resetTime})`;
                    setError(errorMessage);
                } else {
                    setError(errorData?.error || 'Too many requests. Please try again later.');
                }
            } else {
                const errorMessage = getErrorMessage(err);
                setError(errorMessage);
            }
            throw err;
        } finally {
            setIsRunning(false);
        }
    };

    /**
     * Submit code against all test cases
     */
    const submitCode = async (questionId, code, language, teamId) => {
        setIsSubmitting(true);
        setError(null);
        setSubmitResult(null);

        try {
            const response = await apiClient.post(
                `/api/submissions/submit-function/${questionId}`,
                { userFunctionCode: code, language, teamId }
            );

            setSubmitResult(response.data);
            return response.data;
        } catch (err) {
            // Enhanced error handling for rate limits
            if (err.status === 429 || err.response?.status === 429) {
                const errorData = err.data || err.response?.data;
                if (errorData?.details?.resetIn) {
                    const minutes = Math.ceil(errorData.details.resetIn / 60);
                    const resetTime = new Date(errorData.details.resetAt).toLocaleTimeString();
                    const errorMessage = `⏱️ Rate limit exceeded. Please wait ${minutes} minute${minutes > 1 ? 's' : ''} before trying again. (Resets at ${resetTime})`;
                    setError(errorMessage);
                } else {
                    setError(errorData?.error || 'Too many requests. Please try again later.');
                }
            } else {
                const errorMessage = getErrorMessage(err);
                setError(errorMessage);
            }
            throw err;
        } finally {
            setIsSubmitting(false);
        }
    };

    /**
     * Clear all results
     */
    const clearResults = () => {
        setRunResult(null);
        setSubmitResult(null);
        setError(null);
    };

    return {
        runCode,
        submitCode,
        clearResults,
        isRunning,
        isSubmitting,
        runResult,
        submitResult,
        error,
    };
}

/**
 * Get user-friendly error message from backend error
 */
function getErrorMessage(error) {
    if (error.response?.data?.error) {
        const backendError = error.response.data.error;

        // Map backend error types to user-friendly messages
        const errorMessages = {
            'CompilationError': 'Your code has compilation errors. Please check the syntax.',
            'RuntimeError': 'Your code encountered a runtime error during execution.',
            'TimeoutError': 'Your code took too long to execute. Try optimizing your solution.',
            'ResourceLimitError': 'Your code exceeded memory or time limits.',
            'NetworkError': 'Network connection issue. Please try again.',
            'RateLimitError': 'Too many requests. Please wait a moment and try again.',
            'Judge0Error': 'Code execution service is temporarily unavailable. Please try again.',
        };

        return errorMessages[backendError.name] || backendError.message;
    }

    if (error.response?.data?.message) {
        return error.response.data.message;
    }

    return error.message || 'An unexpected error occurred. Please try again.';
}
