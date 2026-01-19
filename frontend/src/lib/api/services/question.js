/**
 * Question API Service
 * Handles all question-related API calls
 */

import apiClient from '../client';

class QuestionAPI {
    /**
     * Add questions to a room (Admin only)
     * @param {string} roomId - Room ID
     * @param {Array} questions - Array of question objects
     * @returns {Promise<Object>} Response with created questions
     */
    async addQuestions(roomId, questions) {
        const response = await apiClient.post(`/api/questions/rooms/${roomId}/questions`, {
            questions,
        });
        return response.data;
    }

    /**
     * Get all questions in a room
     * @param {string} roomId - Room ID
     * @param {Object} filters - Filter options
     * @param {string} filters.difficulty - Question difficulty
     * @param {string} filters.status - Question status
     * @param {string} filters.teamId - Team ID for team-specific data
     * @returns {Promise<Object>} Questions list with summary
     */
    async getRoomQuestions(roomId, filters = {}) {
        const params = new URLSearchParams();

        if (filters.difficulty) params.append('difficulty', filters.difficulty);
        if (filters.status) params.append('status', filters.status);
        if (filters.teamId) params.append('teamId', filters.teamId);

        const queryString = params.toString();
        const endpoint = queryString
            ? `/api/questions/rooms/${roomId}/questions?${queryString}`
            : `/api/questions/rooms/${roomId}/questions`;

        const response = await apiClient.get(endpoint);
        return response.data;
    }

    /**
     * Get question details
     * @param {string} questionId - Question ID
     * @returns {Promise<Object>} Question details
     */
    async getQuestionDetails(questionId) {
        const response = await apiClient.get(`/api/questions/${questionId}`);
        return response.data;
    }

    /**
     * Assign question to team member (Leader only)
     * @param {string} questionId - Question ID
     * @param {string} teamId - Team ID
     * @param {string} userId - User ID to assign to
     * @returns {Promise<Object>} Assignment data
     */
    async assignQuestion(questionId, teamId, userId) {
        const response = await apiClient.post(`/api/questions/${questionId}/assign`, {
            teamId,
            userId,
        });
        return response.data;
    }

    /**
     * Update question (Admin only)
     * @param {string} questionId - Question ID
     * @param {Object} updates - Question updates
     * @returns {Promise<Object>} Updated question data
     */
    async updateQuestion(questionId, updates) {
        const response = await apiClient.put(`/api/questions/${questionId}`, updates);
        return response.data;
    }

    /**
     * Delete question (Admin only)
     * @param {string} questionId - Question ID
     * @returns {Promise<Object>} Response
     */
    async deleteQuestion(questionId) {
        const response = await apiClient.delete(`/api/questions/${questionId}`);
        return response.data;
    }

    /**
     * Get team assignments for questions
     * @param {string} teamId - Team ID
     * @returns {Promise<Object>} Team assignments
     */
    async getTeamAssignments(teamId) {
        const response = await apiClient.get(`/api/teams/${teamId}/assignments`);
        return response.data;
    }
}

// Create singleton instance
const questionAPI = new QuestionAPI();

export default questionAPI;
