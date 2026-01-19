# 🚀 DSA Multiplayer Platform - Backend

A real-time multiplayer DSA (Data Structures & Algorithms) competitive platform backend built with Node.js, Express, Prisma, and Socket.io.

## 📋 Features

- ✅ **Authentication System**
  - Email/Password registration with email verification
  - JWT-based authentication
  - Password reset functionality
  - Google OAuth (optional)

- ✅ **Room Management**
  - Create competitive coding rooms
  - Join rooms with codes
  - Room admin controls (start/end room)
  - Multiple room modes (team/solo)

- ✅ **Team System**
  - Create and join teams
  - Public/Private team visibility
  - Team leader permissions
  - Join request system for private teams

- ✅ **Real-time Features** (Socket.io)
  - Live team member updates
  - Real-time code sharing
  - Typing indicators
  - Team notifications

- ✅ **Security**
  - Rate limiting
  - Helmet security headers
  - CORS configuration
  - Password hashing with bcrypt

## 🛠️ Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL with Prisma ORM
- **Authentication**: JWT (JSON Web Tokens)
- **Real-time**: Socket.io
- **Email**: Nodemailer
- **Validation**: express-validator
- **Security**: Helmet, CORS, bcryptjs

## 📦 Installation

### Prerequisites

- Node.js (v16 or higher)
- MySQL (v8.0 or higher)
- npm or yarn

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Environment Variables

Copy `.env.example` to `.env` and update the values:

```bash
cp .env.example .env
```

**Important configurations:**

```env
# Database - Update with your MySQL credentials
DATABASE_URL="mysql://root:your_password@localhost:3306/dsa_multiplayer"

# JWT Secret - Generate a secure random string
JWT_SECRET="your-super-secret-jwt-key"

# Email - For Gmail, use App Password
EMAIL_USER="your-email@gmail.com"
EMAIL_PASSWORD="your-gmail-app-password"

# Frontend URL
FRONTEND_URL="http://localhost:3000"
```

### Step 3: Setup Database

```bash
# Create database and run migrations
npx prisma migrate dev --name init

# Generate Prisma Client
npx prisma generate

# (Optional) Open Prisma Studio to view database
npx prisma studio
```

### Step 4: Start the Server

```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

The server will start on `http://localhost:3001`

## 📚 API Documentation

### Base URL
```
http://localhost:3001/api
```

### Authentication Endpoints

#### Register
```http
POST /api/auth/register
Content-Type: application/json

{
  "username": "john_doe",
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### Verify Email
```http
POST /api/auth/verify-email
Content-Type: application/json

{
  "email": "john@example.com",
  "code": "123456"
}
```

#### Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "SecurePass123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### Room Endpoints

#### Create Room
```http
POST /api/rooms
Authorization: Bearer <token>
Content-Type: application/json

{
  "roomName": "Weekly DSA Battle",
  "mode": "team",
  "maxTeamSize": 3,
  "duration": 60,
  "scoringMode": "points",
  "difficulty": {
    "easy": 2,
    "medium": 2,
    "hard": 1
  },
  "privacy": "public"
}
```

#### Get All Rooms
```http
GET /api/rooms?status=WAITING&page=1&limit=10
Authorization: Bearer <token>
```

#### Get Room Details
```http
GET /api/rooms/:roomId
Authorization: Bearer <token>
```

#### Join Room
```http
POST /api/rooms/join
Authorization: Bearer <token>
Content-Type: application/json

{
  "code": "ABC123",
  "password": "optional-password"
}
```

#### Start Room (Admin Only)
```http
POST /api/rooms/:roomId/start
Authorization: Bearer <token>
```

#### End Room (Admin Only)
```http
POST /api/rooms/:roomId/end
Authorization: Bearer <token>
```

### Team Endpoints

#### Create Team
```http
POST /api/teams
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "Team Alpha",
  "roomId": "room-uuid",
  "visibility": "PUBLIC"
}
```

#### Get Teams in Room
```http
GET /api/teams/room/:roomId
Authorization: Bearer <token>
```

#### Get Team Details
```http
GET /api/teams/:teamId
Authorization: Bearer <token>
```

#### Join Team (Public)
```http
POST /api/teams/:teamId/join
Authorization: Bearer <token>
```

#### Request to Join Team (Private)
```http
POST /api/teams/:teamId/request
Authorization: Bearer <token>
```

#### Get Join Requests (Team Leader)
```http
GET /api/teams/:teamId/requests
Authorization: Bearer <token>
```

#### Accept Join Request (Team Leader)
```http
POST /api/teams/:teamId/requests/:requestId/accept
Authorization: Bearer <token>
```

#### Leave Team
```http
POST /api/teams/:teamId/leave
Authorization: Bearer <token>
```

## 🔌 Socket.io Events

### Client → Server

#### Join Room Channel
```javascript
socket.emit('join-room', { roomId: 'room-uuid' });
```

#### Join Team Channel
```javascript
socket.emit('join-team', { teamId: 'team-uuid' });
```

#### Start Coding
```javascript
socket.emit('start-coding', {
  questionId: 'question-uuid',
  teamId: 'team-uuid',
  language: 'python'
});
```

#### Code Update
```javascript
socket.emit('code-update', {
  questionId: 'question-uuid',
  teamId: 'team-uuid',
  code: 'current code',
  language: 'python',
  cursorPosition: { line: 10, column: 5 }
});
```

### Server → Client

#### Team Member Joined
```javascript
socket.on('team:member-joined', (data) => {
  // { teamId, member: { userId, username, joinedAt } }
});
```

#### Teammate Coding Started
```javascript
socket.on('teammate:coding-started', (data) => {
  // { teamId, userId, username, questionId, language, startedAt }
});
```

#### Teammate Code Update
```javascript
socket.on('teammate:code-update', (data) => {
  // { teamId, userId, username, questionId, code, language, cursorPosition, timestamp }
});
```

## 🗄️ Database Schema

The database uses Prisma ORM with the following main models:

- **User**: User accounts with authentication
- **VerificationCode**: Email verification codes
- **PasswordReset**: Password reset tokens
- **Room**: Coding competition rooms
- **Team**: Teams within rooms
- **TeamMember**: Team membership records
- **JoinRequest**: Team join requests
- **Question**: Coding problems
- **QuestionAssignment**: Question assignments to teams
- **Submission**: Code submissions

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: Prevents brute force attacks
- **Helmet**: Security headers
- **CORS**: Configured for frontend origin
- **Input Validation**: express-validator for all inputs
- **SQL Injection Protection**: Prisma ORM parameterized queries

## 📧 Email Configuration

### Gmail Setup

1. Enable 2-Factor Authentication in your Google Account
2. Generate an App Password:
   - Go to Google Account → Security → 2-Step Verification → App passwords
   - Select "Mail" and "Other (Custom name)"
   - Copy the generated password
3. Update `.env`:
   ```env
   EMAIL_USER="your-email@gmail.com"
   EMAIL_PASSWORD="your-16-digit-app-password"
   ```

## 🧪 Testing

```bash
# Test database connection
npx prisma studio

# Test API endpoints
curl http://localhost:3001/health
```

## 📁 Project Structure

```
backend/
├── prisma/
│   ├── schema.prisma          # Database schema
│   └── migrations/            # Database migrations
├── src/
│   ├── config/
│   │   ├── database.js        # Prisma client
│   │   └── email.js           # Email configuration
│   ├── controllers/
│   │   ├── authController.js  # Authentication logic
│   │   ├── roomController.js  # Room management
│   │   └── teamController.js  # Team management
│   ├── middleware/
│   │   ├── auth.js            # JWT authentication
│   │   ├── roleCheck.js       # Authorization
│   │   ├── validation.js      # Input validation
│   │   ├── errorHandler.js    # Error handling
│   │   └── rateLimiter.js     # Rate limiting
│   ├── routes/
│   │   ├── auth.js            # Auth routes
│   │   ├── room.js            # Room routes
│   │   ├── team.js            # Team routes
│   │   ├── question.js        # Question routes (placeholder)
│   │   └── submission.js      # Submission routes (placeholder)
│   ├── services/
│   │   ├── emailService.js    # Email sending
│   │   └── jwtService.js      # JWT utilities
│   ├── socket/
│   │   └── socketHandlers.js  # Socket.io events
│   ├── utils/
│   │   ├── generateCode.js    # Code generators
│   │   └── responseFormatter.js # Response formatting
│   └── server.js              # Main entry point
├── .env                       # Environment variables
├── .env.example               # Environment template
├── package.json               # Dependencies
└── README.md                  # This file
```

## 🚀 Deployment

### Environment Variables for Production

```env
NODE_ENV="production"
DATABASE_URL="your-production-database-url"
JWT_SECRET="strong-random-secret"
FRONTEND_URL="https://your-frontend-domain.com"
```

### Recommended Hosting

- **Backend**: Railway, Render, DigitalOcean
- **Database**: PlanetScale, Railway, AWS RDS
- **Email**: SendGrid, AWS SES, Mailgun

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Test MySQL connection
mysql -u root -p

# Check if database exists
SHOW DATABASES;

# Recreate migrations
npx prisma migrate reset
npx prisma migrate dev
```

### Email Not Sending

- Verify Gmail App Password is correct
- Check if 2FA is enabled
- Test with Mailtrap for development

### Port Already in Use

```bash
# Find process using port 3001
lsof -i :3001

# Kill the process
kill -9 <PID>
```

## 📝 License

ISC

## 👥 Contributing

This is a private project. For questions or issues, contact the development team.

## 🔗 Related

- Frontend Repository: [Link to frontend repo]
- API Documentation: [Link to API docs]

---

**Made with ❤️ for competitive programmers**
