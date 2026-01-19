/**
 * Question and Submission Hooks
 * Ready-to-use hooks for questions and code execution
 */

import { useState, useCallback } from 'react';
import API from '../index';
import { useFetch, useMutation } from './useAPI';

/**
 * Hook for getting room questions
 */
export function useRoomQuestions(roomId, filters = {}) {
    return useFetch(
        () => API.questions.getRoomQuestions(roomId, filters),
        [roomId, JSON.stringify(filters)],
        {
            skip: !roomId,
            showErrorToast: false,
        }
    );
}

/**
 * Hook for getting question details
 */
export function useQuestionDetails(questionId) {
    return useFetch(
        () => API.questions.getQuestionDetails(questionId),
        [questionId],
        {
            skip: !questionId,
            showErrorToast: false,
        }
    );
}

/**
 * Hook for adding questions to room
 */
export function useAddQuestions() {
    return useMutation(
        ({ roomId, questions }) => API.questions.addQuestions(roomId, questions),
        {
            successMessage: 'Questions added successfully!',
        }
    );
}

/**
 * Hook for assigning question
 */
export function useAssignQuestion() {
    return useMutation(
        ({ questionId, teamId, userId }) => API.questions.assignQuestion(questionId, teamId, userId),
        {
            successMessage: 'Question assigned successfully!',
        }
    );
}

/**
 * Hook for running code (test mode)
 */
export function useRunCode() {
    const [output, setOutput] = useState(null);
    const [isRunning, setIsRunning] = useState(false);

    const { execute, loading, error } = useMutation(
        ({ questionId, code, language, input }) =>
            API.submissions.runCode(questionId, { code, language, input }),
        {
            showSuccessToast: false,
            showErrorToast: true,
        }
    );

    const runCode = useCallback(
        async (questionId, code, language, input = '') => {
            setIsRunning(true);
            try {
                const result = await execute({ questionId, code, language, input });
                setOutput(result);
                return result;
            } finally {
                setIsRunning(false);
            }
        },
        [execute]
    );

    const clearOutput = useCallback(() => {
        setOutput(null);
    }, []);

    return {
        runCode,
        output,
        isRunning: isRunning || loading,
        error,
        clearOutput,
    };
}

/**
 * Hook for submitting solution
 */
export function useSubmitSolution() {
    const [submissionResult, setSubmissionResult] = useState(null);

    const { execute, loading, error } = useMutation(
        ({ questionId, code, language, teamId }) =>
            API.submissions.submitSolution(questionId, { code, language, teamId }),
        {
            showSuccessToast: false,
            showErrorToast: true,
        }
    );

    const submitSolution = useCallback(
        async (questionId, code, language, teamId) => {
            const result = await execute({ questionId, code, language, teamId });
            setSubmissionResult(result);
            return result;
        },
        [execute]
    );

    const clearResult = useCallback(() => {
        setSubmissionResult(null);
    }, []);

    return {
        submitSolution,
        submissionResult,
        isSubmitting: loading,
        error,
        clearResult,
    };
}

/**
 * Hook for getting user submissions
 */
export function useMySubmissions(filters = {}) {
    return useFetch(
        () => API.submissions.getMySubmissions(filters),
        [JSON.stringify(filters)],
        {
            showErrorToast: false,
        }
    );
}

/**
 * Hook for getting question submissions
 */
export function useQuestionSubmissions(questionId, filters = {}) {
    return useFetch(
        () => API.submissions.getQuestionSubmissions(questionId, filters),
        [questionId, JSON.stringify(filters)],
        {
            skip: !questionId,
            showErrorToast: false,
        }
    );
}

/**
 * Hook for getting submission details
 */
export function useSubmissionDetails(submissionId) {
    return useFetch(
        () => API.submissions.getSubmission(submissionId),
        [submissionId],
        {
            skip: !submissionId,
            showErrorToast: false,
        }
    );
}
