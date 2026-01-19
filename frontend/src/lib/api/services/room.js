/**
 * Room API Service
 * Handles all room-related API calls
 */

import apiClient from '../client.js';

class RoomAPI {
    /**
     * Create a new room
     * @param {Object} roomData - Room creation data
     * @returns {Promise<Object>} Created room data
     */
    async createRoom(roomData) {
        const response = await apiClient.post('/api/rooms', roomData);
        return response.data;
    }

    /**
     * Get all rooms with optional filters
     * @param {Object} params - Query parameters
     * @param {string} params.status - Filter by status (WAITING, ACTIVE, COMPLETED)
     * @param {number} params.page - Page number
     * @param {number} params.limit - Items per page
     * @returns {Promise<Object>} Rooms list with pagination
     */
    async getAllRooms(params = {}) {
        const response = await apiClient.get('/api/rooms', { params });
        return response.data;
    }

    /**
     * Get room details by ID
     * @param {string} roomId - Room ID
     * @returns {Promise<Object>} Room details
     */
    async getRoomDetails(roomId) {
        const response = await apiClient.get(`/api/rooms/${roomId}`);
        return response.data;
    }

    /**
     * Join a room with code
     * @param {string} code - Room code
     * @param {string} password - Room password (optional)
     * @returns {Promise<Object>} Join response
     */
    async joinRoom(code, password = '') {
        const response = await apiClient.post('/api/rooms/join', {
            code,
            password: password || undefined
        });
        return response.data;
    }

    /**
     * Start a room (admin only)
     * @param {string} roomId - Room ID
     * @returns {Promise<Object>} Start response
     */
    async startRoom(roomId) {
        const response = await apiClient.post(`/api/rooms/${roomId}/start`);
        return response.data;
    }

    /**
     * End a room (admin only)
     * @param {string} roomId - Room ID
     * @returns {Promise<Object>} End response with leaderboard
     */
    async endRoom(roomId) {
        const response = await apiClient.post(`/api/rooms/${roomId}/end`);
        return response.data;
    }

    /**
     * Delete a room (admin only)
     * @param {string} roomId - Room ID
     * @returns {Promise<Object>} Delete response
     */
    async deleteRoom(roomId) {
        const response = await apiClient.delete(`/api/rooms/${roomId}`);
        return response.data;
    }
}

export default new RoomAPI();
