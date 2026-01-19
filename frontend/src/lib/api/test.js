// Quick test file to verify API exports
import API from './index.js';

console.log('=== API Test ===');
console.log('API:', API);
console.log('API.rooms:', API?.rooms);
console.log('API.teams:', API?.teams);
console.log('API.rooms.getAllRooms:', API?.rooms?.getAllRooms);

if (API && API.rooms && typeof API.rooms.getAllRooms === 'function') {
    console.log('✅ API is properly configured!');
} else {
    console.error('❌ API is not properly configured');
    console.error('API type:', typeof API);
    console.error('API.rooms type:', typeof API?.rooms);
}

export default API;
