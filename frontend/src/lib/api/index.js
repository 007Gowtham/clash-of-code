/**
 * Central API Export
 * Single import point for all API services
 */

import authAPI from './services/auth.js';
import roomAPI from './services/room.js';
import teamAPI from './services/team.js';
import questionAPI from './services/question.js';
import submissionAPI from './services/submission.js';

export { default as apiClient } from './client.js';
export { TokenManager, ErrorParser, ErrorTypes, APIError } from './client.js';

// Create API object
const API = {
    auth: authAPI,
    rooms: roomAPI,
    teams: teamAPI,
    questions: questionAPI,
    submissions: submissionAPI,
};

// Debug log
console.log('API object created:', {
    hasAuth: !!API.auth,
    hasRooms: !!API.rooms,
    hasTeams: !!API.teams,
    roomsType: typeof API.rooms,
    roomsMethods: API.rooms ? Object.keys(API.rooms) : []
});

// Named export
export { API };

// Default export for convenience
export default API;
