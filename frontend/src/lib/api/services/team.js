/**
 * Team API Service
 * Handles all team-related API calls
 */

import apiClient from '../client.js';

class TeamAPI {
    /**
     * Create a new team
     * @param {Object} teamData - Team creation data
     * @param {string} teamData.name - Team name
     * @param {string} teamData.roomId - Room ID
     * @param {string} teamData.visibility - Team visibility (PUBLIC/PRIVATE)
     * @returns {Promise<Object>} Created team data with code if private
     */
    async createTeam(teamData) {
        const response = await apiClient.post('/api/teams', teamData);
        return response.data;
    }

    /**
     * Get all teams in a room
     * @param {string} roomId - Room ID
     * @param {Object} params - Query parameters
     * @returns {Promise<Object>} Teams list
     */
    async getTeamsInRoom(roomId, params = {}) {
        const response = await apiClient.get(`/api/teams/room/${roomId}`, { params });
        return response.data;
    }

    /**
     * Get team details by ID
     * @param {string} teamId - Team ID
     * @returns {Promise<Object>} Team details
     */
    async getTeamDetails(teamId) {
        const response = await apiClient.get(`/api/teams/${teamId}`);
        return response.data;
    }

    /**
     * Join a team
     * @param {string} teamId - Team ID
     * @param {Object} data - Join data (code for private teams)
     * @returns {Promise<Object>} Join response
     */
    async joinTeam(teamId, data = {}) {
        const response = await apiClient.post(`/api/teams/${teamId}/join`, data);
        return response.data;
    }

    /**
     * Leave a team
     * @param {string} teamId - Team ID
     * @returns {Promise<Object>} Leave response
     */
    async leaveTeam(teamId) {
        const response = await apiClient.post(`/api/teams/${teamId}/leave`);
        return response.data;
    }

    /**
     * Kick a member from the team (leader only)
     * @param {string} teamId - Team ID
     * @param {string} userId - User ID to kick
     * @returns {Promise<Object>} Kick response
     */
    async kickMember(teamId, userId) {
        const response = await apiClient.delete(`/api/teams/${teamId}/members/${userId}`);
        return response.data;
    }

    /**
     * Delete a team (leader only)
     * @param {string} teamId - Team ID
     * @returns {Promise<Object>} Delete response
     */
    async deleteTeam(teamId) {
        const response = await apiClient.delete(`/api/teams/${teamId}`);
        return response.data;
    }

    /**
     * Request to join a private team
     * @param {string} teamId - Team ID
     * @returns {Promise<Object>} Request response
     */
    async requestToJoinTeam(teamId) {
        const response = await apiClient.post(`/api/teams/${teamId}/request`);
        return response.data;
    }

    /**
     * Get join requests for a team (leader only)
     * @param {string} teamId - Team ID
     * @returns {Promise<Object>} Join requests list
     */
    async getJoinRequests(teamId) {
        const response = await apiClient.get(`/api/teams/${teamId}/requests`);
        return response.data;
    }

    /**
     * Accept a join request (leader only)
     * @param {string} teamId - Team ID
     * @param {string} requestId - Request ID
     * @returns {Promise<Object>} Accept response
     */
    async acceptJoinRequest(teamId, requestId) {
        const response = await apiClient.post(`/api/teams/${teamId}/requests/${requestId}/accept`);
        return response.data;
    }

    /**
     * Reject a join request (leader only)
     * @param {string} teamId - Team ID
     * @param {string} requestId - Request ID
     * @returns {Promise<Object>} Reject response
     */
    async rejectJoinRequest(teamId, requestId) {
        const response = await apiClient.post(`/api/teams/${teamId}/requests/${requestId}/reject`);
        return response.data;
    }
}

export default new TeamAPI();
