const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const { createServer } = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const { connectDB } = require('./config/database');
const errorHandler = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');

// Import routes
const authRoutes = require('./routes/auth');
const roomRoutes = require('./routes/room');
// const teamRoutes = require('./routes/team');
const questionRoutes = require('./routes/question');
const submissionRoutes = require('./routes/submission');
// const testingRoutes = require('./routes/testing');
const problemRoutes = require('./routes/problemRoutes');

// Initialize app
const app = express();
const httpServer = createServer(app);

// Cors configuration helper
const getAllowedOrigins = () => {
    const envOrigins = process.env.ALLOWED_ORIGINS ? process.env.ALLOWED_ORIGINS.split(',') : [];
    const defaultOrigins = ['http://localhost:3000', 'http://localhost:3001', 'http://localhost:3002'];
    return [...new Set([...envOrigins, ...defaultOrigins])];
};

// Initialize Socket.io
const io = new Server(httpServer, {
    cors: {
        origin: getAllowedOrigins(),
        credentials: true,
        methods: ['GET', 'POST'],
    },
});

// Middleware
app.use(helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
}));

app.use(cors({
    origin: getAllowedOrigins(),
    credentials: true,
}));

app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Rate limiting
app.use('/api/', apiLimiter);

// Health check
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
    });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/rooms', roomRoutes);
// app.use('/api/teams', teamRoutes);
app.use('/api/questions', questionRoutes);
app.use('/api/submissions', submissionRoutes);
// app.use('/api/testing', testingRoutes);
app.use('/api/problems', problemRoutes); // NEW: LeetCode-style problem endpoints

// Socket.io setup
const socketHandlers = require('./socket/socketHandlers');
socketHandlers(io);

// Make io accessible to routes
app.set('io', io);

// 404 handler
app.use((req, res) => {
    res.status(404).json({
        success: false,
        error: 'Route not found',
        path: req.path,
    });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3004;

async function startServer() {
    try {
        await connectDB();

        httpServer.listen(PORT, () => {
            console.log('');
            console.log('╔════════════════════════════════════════════════════════╗');
            console.log('║                                                        ║');
            console.log('║     🚀 DSA Multiplayer Backend Server Running         ║');
            console.log('║                                                        ║');
            console.log('╠════════════════════════════════════════════════════════╣');
            console.log(`║  📡 Server:      http://localhost:${PORT}                ║`);
            console.log(`║  🌍 Environment: ${process.env.NODE_ENV || 'development'}                      ║`);
            console.log('║  💾 Database:    Connected                             ║');
            console.log('║  📧 Email:       Configured                            ║');
            console.log('║  🔌 Socket.io:   Ready                                 ║');
            console.log('║                                                        ║');
            console.log('╠════════════════════════════════════════════════════════╣');
            console.log('║  Available Routes:                                     ║');
            console.log('║  • POST   /api/auth/register                           ║');
            console.log('║  • POST   /api/auth/login                              ║');
            console.log('║  • POST   /api/auth/verify-email                       ║');
            console.log('║  • POST   /api/rooms                                   ║');
            console.log('║  • GET    /api/rooms                                   ║');
            console.log('║  • POST   /api/rooms/join                              ║');
            console.log('║  • POST   /api/teams                                   ║');
            console.log('║  • GET    /api/teams/room/:roomId                      ║');
            console.log('║  • POST   /api/submissions/run-function/:questionId    ║');
            console.log('║  • POST   /api/submissions/submit-function/:questionId ║');
            console.log('║                                                        ║');
            console.log('╚════════════════════════════════════════════════════════╝');
            console.log('');
        });
    } catch (error) {
        console.error('❌ Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully');
    httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    console.log('\nSIGINT received, shutting down gracefully');
    httpServer.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});
