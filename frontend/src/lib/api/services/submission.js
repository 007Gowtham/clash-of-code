/**
 * Submission API Service
 * Handles all code submission and execution API calls
 */

import apiClient from '../client';

class SubmissionAPI {
    /**
     * Run code with custom input (test mode)
     * @param {string} questionId - Question ID
     * @param {Object} codeData - Code execution data
     * @param {string} codeData.code - Source code
     * @param {string} codeData.language - Programming language
     * @param {string} codeData.input - Custom input (optional)
     * @returns {Promise<Object>} Execution result
     */
    async runCode(questionId, codeData) {
        const response = await apiClient.post(
            `/api/submissions/questions/${questionId}/run`,
            codeData
        );
        return response.data;
    }

    /**
     * Submit solution for evaluation
     * @param {string} questionId - Question ID
     * @param {Object} submissionData - Submission data
     * @param {string} submissionData.code - Source code
     * @param {string} submissionData.language - Programming language
     * @param {string} submissionData.teamId - Team ID
     * @returns {Promise<Object>} Submission result with test cases
     */
    async submitSolution(questionId, submissionData) {
        const response = await apiClient.post(
            `/api/submissions/questions/${questionId}/submit`,
            submissionData
        );
        return response.data;
    }

    /**
     * Get submission details
     * @param {string} submissionId - Submission ID
     * @returns {Promise<Object>} Submission details
     */
    async getSubmission(submissionId) {
        const response = await apiClient.get(`/api/submissions/${submissionId}`);
        return response.data;
    }

    /**
     * Get all submissions for a question
     * @param {string} questionId - Question ID
     * @param {Object} filters - Filter options
     * @param {string} filters.userId - Filter by user
     * @param {string} filters.status - Filter by status
     * @param {number} filters.page - Page number
     * @param {number} filters.limit - Items per page
     * @returns {Promise<Object>} Submissions list with statistics
     */
    async getQuestionSubmissions(questionId, filters = {}) {
        const params = new URLSearchParams();

        if (filters.userId) params.append('userId', filters.userId);
        if (filters.status) params.append('status', filters.status);
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);

        const queryString = params.toString();
        const endpoint = queryString
            ? `/api/submissions/questions/${questionId}/submissions?${queryString}`
            : `/api/submissions/questions/${questionId}/submissions`;

        const response = await apiClient.get(endpoint);
        return response.data;
    }

    /**
     * Get current user's submissions
     * @param {Object} filters - Filter options
     * @param {string} filters.roomId - Filter by room
     * @param {string} filters.status - Filter by status
     * @param {number} filters.page - Page number
     * @param {number} filters.limit - Items per page
     * @returns {Promise<Object>} User submissions
     */
    async getMySubmissions(filters = {}) {
        const params = new URLSearchParams();

        if (filters.roomId) params.append('roomId', filters.roomId);
        if (filters.status) params.append('status', filters.status);
        if (filters.page) params.append('page', filters.page);
        if (filters.limit) params.append('limit', filters.limit);

        const queryString = params.toString();
        const endpoint = queryString
            ? `/api/submissions/users/me/submissions?${queryString}`
            : '/api/submissions/users/me/submissions';

        const response = await apiClient.get(endpoint);
        return response.data;
    }

    /**
     * Get team's live progress on questions
     * @param {string} teamId - Team ID
     * @returns {Promise<Object>} Team progress data
     */
    async getTeamProgress(teamId) {
        const response = await apiClient.get(`/api/teams/${teamId}/progress`);
        return response.data;
    }

    /**
     * Get submission code (for viewing)
     * @param {string} submissionId - Submission ID
     * @returns {Promise<Object>} Submission code and details
     */
    async getSubmissionCode(submissionId) {
        const response = await apiClient.get(`/api/submissions/${submissionId}/code`);
        return response.data;
    }
}

// Create singleton instance
const submissionAPI = new SubmissionAPI();

export default submissionAPI;
