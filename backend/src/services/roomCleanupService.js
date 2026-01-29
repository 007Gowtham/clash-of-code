const { prisma } = require('../config/database');

const CLEANUP_INTERVAL_MS = 60 * 1000; // Check every 1 minute

const initRoomCleanup = () => {
    console.log('Initializing Room Cleanup Service...');

    // Initial cleanup
    cleanupExpiredRooms();

    // Schedule periodic cleanup
    setInterval(cleanupExpiredRooms, CLEANUP_INTERVAL_MS);
};

const cleanupExpiredRooms = async () => {
    try {
        const now = new Date();

        // Find expiring rooms first if we want to log them (optional, but good for debugging)
        // For performance, we can just deleteMany.
        // We delete rooms where endTime is active (not null) and is in the past.

        const { count } = await prisma.room.deleteMany({
            where: {
                endTime: {
                    not: null,
                    lt: now
                }
            }
        });

        if (count > 0) {
            console.log(`[RoomCleanup] Automatically deleted ${count} expired rooms at ${now.toISOString()}`);
        }

    } catch (error) {
        console.error('[RoomCleanup] Error deleting expired rooms:', error);
    }
};

module.exports = { initRoomCleanup };
