# DSA Collaborative Arena - Professional Documentation

## 🎯 Project Overview

**DSA Collaborative Arena** is a full-stack web application that transforms solo DSA problem-solving into a collaborative, competitive team experience - combining the learning effectiveness of coding challenges with the engagement and social dynamics of multiplayer gaming.

### Core Value Proposition
- **Collaborative Learning**: Team members solve problems together, viewing each other's solutions in real-time
- **AI-Powered Question Generation**: Dynamic problem creation based on topics and difficulty levels
- **Team-Based Competition**: Focus on collective team scores rather than individual performance to reduce beginner anxiety
- **Game-Like Experience**: Rooms, teams, leaderboards, and real-time collaboration mirror multiplayer gaming

---

## 📋 System Architecture

### Tech Stack Recommendations
- **Frontend**: React/Next.js with TypeScript
- **Backend**: Node.js (Express/Nest.js) or Next.js API Routes
- **Database**: PostgreSQL (you're already using Prisma)
- **Real-time**: Socket.io for live code viewing
- **Code Execution**: Docker containers with sandboxed environments
- **AI Integration**: OpenAI API / Anthropic Claude API for question generation
- **Authentication**: JWT (you've started this)
- **Caching**: Redis (for active rooms and real-time data)

---

## 🗄️ Enhanced Database Schema

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

// ============================================
// USER MANAGEMENT
// ============================================

model User {
  id                        Int        @id @default(autoincrement())
  email                     String     @unique
  name                      String?
  avatar                    String?
  password                  String?
  loginType                 LoginType  @default(EMAIL_PASSWORD)
  role                      Role       @default(USER)
  isEmailVerified           Boolean    @default(false)
  refreshToken              String?
  forgetPasswordToken       String?
  forgetPasswordExpiry      DateTime?
  emailVerificationToken    String?
  emailVerificationExpiry   DateTime?
  createdAt                 DateTime   @default(now())
  updatedAt                 DateTime   @updatedAt

  // Relations
  createdRooms              Room[]             @relation("RoomCreator")
  roomMemberships           RoomMembership[]
  teamMemberships           TeamMembership[]
  createdTeams              Team[]             @relation("TeamCreator")
  submissions               Submission[]
  notifications             Notification[]

  @@index([email])
}

enum Role {
  USER
  ADMIN_ROOM
  TEAM_LEADER
  TEAM_MEMBER
}

enum LoginType {
  GOOGLE
  GITHUB
  EMAIL_PASSWORD
}

// ============================================
// ROOM MANAGEMENT
// ============================================

model Room {
  id                    String              @id @default(cuid())
  name                  String
  password              String              // Hashed password for room access
  maxTeams              Int                 // Maximum number of teams
  maxTeamSize           Int                 // Maximum members per team
  duration              Int                 // Duration in minutes
  status                RoomStatus          @default(WAITING)
  startTime             DateTime?
  endTime               DateTime?
  createdById           Int
  createdBy             User                @relation("RoomCreator", fields: [createdById], references: [id])
  adminToken            String              @unique // JWT for admin access
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt

  // Relations
  questions             Question[]
  teams                 Team[]
  memberships           RoomMembership[]
  leaderboard           Leaderboard?

  @@index([createdById])
  @@index([status])
}

enum RoomStatus {
  WAITING       // Room created, waiting for participants
  IN_PROGRESS   // Contest is active
  COMPLETED     // Contest finished
  CANCELLED     // Room cancelled
}
model User {
  id                        Int        @id @default(autoincrement())
  email                     String     @unique
  name                      String?
  avatar                    String?
  password                  String?
  loginType                 LoginType  @default(EMAIL_PASSWORD)
  role                      Role       @default(USER)
  isEmailVerified           Boolean    @default(false)
  refreshToken              String?
  forgetPasswordToken       String?
  forgetPasswordExpiry      DateTime?
  emailVerificationToken    String?
  emailVerificationExpiry   DateTime?
  createdAt                 DateTime   @default(now())
  updatedAt                 DateTime   @updatedAt

  // Relations
  createdRooms              Room[]             @relation("RoomCreator")
  roomMemberships           RoomMembership[]
  teamMemberships           TeamMembership[]
  createdTeams              Team[]             @relation("TeamCreator")
  submissions               Submission[]
  notifications             Notification[]

  @@index([email])
}

enum Role {
  USER
  ADMIN_ROOM
  TEAM_LEADER
  TEAM_MEMBER
}

enum LoginType {
  GOOGLE
  GITHUB
  EMAIL_PASSWORD
}

// ============================================
// ROOM MANAGEMENT
// ============================================

model Room {
  id                    String              @id @default(cuid())
  name                  String
  password              String              // Hashed password for room access
  maxTeams              Int                 // Maximum number of teams
  maxTeamSize           Int                 // Maximum members per team
  duration              Int                 // Duration in minutes
  status                RoomStatus          @default(WAITING)
  startTime             DateTime?
  endTime               DateTime?
  createdById           Int
  createdBy             User                @relation("RoomCreator", fields: [createdById], references: [id])
  adminToken            String              @unique // JWT for admin access
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt

  // Relations
  questions             Question[]
  teams                 Team[]
  memberships           RoomM
}
model RoomMembership {
  id            Int       @id @default(autoincrement())
  userId        Int
  user          User      @relation(fields: [userId], references: [id])
  roomId        String
  room          Room      @relation(fields: [roomId], references: [id], onDelete: Cascade)
  joinedAt      DateTime  @default(now())

  @@unique([userId, roomId])
  @@index([roomId])
}

// ============================================
// QUESTION MANAGEMENT
// ============================================

model Question {
  id                    Int                 @id @default(autoincrement())
  roomId                String
  room                  Room                @relation(fields: [roomId], references: [id], onDelete: Cascade)
  title                 String
  description           String              @db.Text
  topic                 String              // e.g., "Arrays", "Dynamic Programming"
  difficulty            Difficulty
  constraints           String?             @db.Text
  inputFormat           String?             @db.Text
  outputFormat          String?             @db.Text
  timeLimit             Int                 @default(2000) // milliseconds
  memoryLimit           Int                 @default(256)  // MB
  points                Int                 // Base points for solving
  createdAt             DateTime            @default(now())
  updatedAt             DateTime            @updatedAt

  // Relations
  testCases             TestCase[]
  examples              Example[]
  submissions           Submission[]
  solveRequests         SolveRequest[]

  @@index([roomId])
  @@index([difficulty])
}

enum Difficulty {
  EASY
  MEDIUM
  HARD
}

model TestCase {
  id                Int       @id @default(autoincrement())
  questionId        Int
  question          Question  @relation(fields: [questionId], references: [id], onDelete: Cascade)
  input             String    @db.Text
  expectedOutput    String    @db.Text
  isHidden          Boolean   @default(false) // Hidden test cases not shown to users
  points            Int       @default(0)     // Points for passing this test case
  createdAt         DateTime  @default(now())

  @@index([questionId])
}

model Example {
  id                Int       @id @default(autoincrement())
  questionId        Int
  question          Question  @relation(fields: [questionId], references: [id], onDelete: Cascade)
  input             String    @db.Text
  output            String    @db.Text
  explanation       String?   @db.Text
  orderIndex        Int       // To maintain order of examples
  createdAt         DateTime  @default(now())

  @@index([questionId])
}

// ============================================
// TEAM MANAGEMENT
// ============================================

model Team {
  id                String              @id @default(cuid())
  name              String
  roomId            String
  room              Room                @relation(fields: [roomId], references: [id], onDelete: Cascade)
  leaderId          Int
  leader            User                @relation("TeamCreator", fields: [leaderId], references: [id])
  leaderToken       String              @unique // JWT for team leader
  totalScore        Int                 @default(0)
  rank              Int?
  createdAt         DateTime            @default(now())
  updatedAt         DateTime            @updatedAt

  // Relations
  memberships       TeamMembership[]
  submissions       Submission[]
  solveRequests     SolveRequest[]

  @@unique([roomId, name])
  @@index([roomId])
  @@index([leaderId])
}

model TeamMembership {
  id                Int                 @id @default(autoincrement())
  userId            Int
  user              User                @relation(fields: [userId], references: [id])
  teamId            String
  team              Team                @relation(fields: [teamId], references: [id], onDelete: Cascade)
  status            MembershipStatus    @default(PENDING)
  memberToken       String?             @unique // JWT after approval
  joinedAt          DateTime            @default(now())
  approvedAt        DateTime?

  @@unique([userId, teamId])
  @@index([teamId])
  @@index([status])
}

enum MembershipStatus {
  PENDING       // Waiting for team leader approval
  APPROVED      // Accepted by team leader
  REJECTED      // Rejected by team leader
  LEFT          // Member left the team
}

// ============================================
// SOLVE REQUEST SYSTEM
// ============================================

model SolveRequest {
  id                Int                 @id @default(autoincrement())
  teamId            String
  team              Team                @relation(fields: [teamId], references: [id], onDelete: Cascade)
  questionId        Int
  question          Question            @relation(fields: [questionId], references: [id], onDelete: Cascade)
  requestedById     Int                 // Team member who wants to solve
  status            RequestStatus       @default(PENDING)
  requestedAt       DateTime            @default(now())
  respondedAt       DateTime?

  @@unique([teamId, questionId, requestedById])
  @@index([teamId])
  @@index([status])
}

enum RequestStatus {
  PENDING
  APPROVED
  REJECTED
}

// ============================================
// CODE SUBMISSION & EXECUTION
// ============================================

model Submission {
  id                Int                 @id @default(autoincrement())
  teamId            String
  team              Team                @relation(fields: [teamId], references: [id], onDelete: Cascade)
  questionId        Int
  question          Question            @relation(fields: [questionId], references: [id], onDelete: Cascade)
  userId            Int                 // Team member who submitted
  user              User                @relation(fields: [userId], references: [id])
  code              String              @db.Text
  language          ProgrammingLanguage
  status            SubmissionStatus
  score             Int                 @default(0)
  executionTime     Int?                // milliseconds
  memoryUsed        Int?                // KB
  submittedAt       DateTime            @default(now())
  
  // Relations
  testResults       TestResult[]

  @@index([teamId, questionId])
  @@index([userId])
  @@index([status])
}

enum ProgrammingLanguage {
  JAVASCRIPT
  PYTHON
  JAVA
  CPP
  C
  GO
  RUST
}

enum SubmissionStatus {
  PENDING           // Queued for execution
  RUNNING           // Currently executing
  ACCEPTED          // All test cases passed
  WRONG_ANSWER      // Some test cases failed
  TIME_LIMIT        // Exceeded time limit
  MEMORY_LIMIT      // Exceeded memory limit
  RUNTIME_ERROR     // Crashed during execution
  COMPILE_ERROR     // Code didn't compile
}

model TestResult {
  id                Int           @id @default(autoincrement())
  submissionId      Int
  submission        Submission    @relation(fields: [submissionId], references: [id], onDelete: Cascade)
  testCaseId        Int
  passed            Boolean
  output            String?       @db.Text
  error             String?       @db.Text
  executionTime     Int?          // milliseconds
  memoryUsed        Int?          // KB

  @@index([submissionId])
}

// ============================================
// REAL-TIME COLLABORATION
// ============================================

model LiveCode {
  id                String      @id @default(cuid())
  teamId            String
  questionId        Int
  userId            Int
  code              String      @db.Text
  language          ProgrammingLanguage
  cursorPosition    Int?
  lastUpdated       DateTime    @default(now())

  @@unique([teamId, questionId, userId])
  @@index([teamId])
}

// ============================================
// LEADERBOARD
// ============================================

model Leaderboard {
  id                Int       @id @default(autoincrement())
  roomId            String    @unique
  room              Room      @relation(fields: [roomId], references: [id], onDelete: Cascade)
  rankings          Json      // Stores final team rankings and scores
  generatedAt       DateTime  @default(now())
  updatedAt         DateTime  @updatedAt
}

// ============================================
// NOTIFICATIONS
// ============================================

model Notification {
  id                Int               @id @default(autoincrement())
  userId            Int
  user              User              @relation(fields: [userId], references: [id], onDelete: Cascade)
  type              NotificationType
  title             String
  message           String            @db.Text
  isRead            Boolean           @default(false)
  metadata          Json?             // Additional data (roomId, teamId, etc.)
  createdAt         DateTime          @default(now())

  @@index([userId, isRead])
}

enum NotificationType {
  ROOM_STARTED
  ROOM_ENDING_SOON
  TEAM_JOIN_REQUEST
  TEAM_JOIN_APPROVED
  TEAM_JOIN_REJECTED
  SOLVE_REQUEST
  SOLVE_APPROVED
  SOLVE_REJECTED
  NEW_SUBMISSION
  ROOM_COMPLETED
}
```

---

## 🔌 API Documentation

### Authentication APIs

#### 1. Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}

Response: 201 Created
{
  "success": true,
  "message": "Verification email sent",
  "data": {
    "userId": 1,
    "email": "user@example.com"
  }
}
```

#### 2. Login
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "securePassword123"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "user": { "id": 1, "email": "user@example.com", "name": "John Doe" },
    "accessToken": "jwt_access_token",
    "refreshToken": "jwt_refresh_token"
  }
}
```

---

### Room Management APIs

#### 3. Create Room
```http
POST /api/rooms/create
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "name": "DSA Championship 2025",
  "password": "room123",
  "maxTeams": 10,
  "maxTeamSize": 4,
  "duration": 120,
  "questionConfig": {
    "topics": ["Arrays", "Dynamic Programming", "Graphs"],
    "difficulties": {
      "EASY": 2,
      "MEDIUM": 3,
      "HARD": 1
    },
    "descriptions": [
      "Focus on time complexity optimization",
      "Include edge cases"
    ]
  }
}

Response: 201 Created
{
  "success": true,
  "data": {
    "roomId": "clx1234567890",
    "name": "DSA Championship 2025",
    "adminToken": "admin_jwt_token",
    "questions": [...], // Generated questions
    "joinUrl": "https://app.com/room/clx1234567890"
  }
}
```

#### 4. Join Room
```http
POST /api/rooms/:roomId/join
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "password": "room123"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "roomId": "clx1234567890",
    "name": "DSA Championship 2025",
    "status": "WAITING",
    "teamsCount": 3,
    "questions": [...]
  }
}
```

#### 5. Start Room (Admin Only)
```http
POST /api/rooms/:roomId/start
Authorization: Bearer <admin_token>

Response: 200 OK
{
  "success": true,
  "message": "Room started",
  "data": {
    "startTime": "2025-11-07T10:00:00Z",
    "endTime": "2025-11-07T12:00:00Z"
  }
}
```

#### 6. Get Room Details
```http
GET /api/rooms/:roomId
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "clx1234567890",
    "name": "DSA Championship 2025",
    "status": "IN_PROGRESS",
    "maxTeams": 10,
    "maxTeamSize": 4,
    "duration": 120,
    "teamsCount": 5,
    "questions": [...],
    "startTime": "2025-11-07T10:00:00Z",
    "endTime": "2025-11-07T12:00:00Z"
  }
}
```

---

### Team Management APIs

#### 7. Create Team
```http
POST /api/teams/create
Authorization: Bearer <access_token>
Content-Type: application/json

{
  "roomId": "clx1234567890",
  "name": "Code Warriors"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "teamId": "team_abc123",
    "name": "Code Warriors",
    "leaderToken": "team_leader_jwt_token",
    "leaderId": 1
  }
}
```

#### 8. Join Team
```http
POST /api/teams/:teamId/join
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "message": "Join request sent to team leader",
  "data": {
    "teamId": "team_abc123",
    "status": "PENDING"
  }
}
```

#### 9. Approve/Reject Team Member (Leader Only)
```http
POST /api/teams/:teamId/members/:membershipId/respond
Authorization: Bearer <leader_token>
Content-Type: application/json

{
  "action": "APPROVE" // or "REJECT"
}

Response: 200 OK
{
  "success": true,
  "message": "Member approved",
  "data": {
    "memberToken": "member_jwt_token",
    "userId": 2,
    "status": "APPROVED"
  }
}
```

#### 10. Get Team Details
```http
GET /api/teams/:teamId
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "id": "team_abc123",
    "name": "Code Warriors",
    "leader": { "id": 1, "name": "John Doe" },
    "members": [
      { "id": 2, "name": "Jane Smith", "status": "APPROVED" },
      { "id": 3, "name": "Bob Johnson", "status": "PENDING" }
    ],
    "totalScore": 450,
    "rank": 2
  }
}
```

---

### Question & Solve Request APIs

#### 11. Request to Solve Question
```http
POST /api/solve-requests/create
Authorization: Bearer <member_token>
Content-Type: application/json

{
  "teamId": "team_abc123",
  "questionId": 5
}

Response: 201 Created
{
  "success": true,
  "message": "Solve request sent to team leader",
  "data": {
    "requestId": 101,
    "questionId": 5,
    "status": "PENDING"
  }
}
```

#### 12. Approve/Reject Solve Request (Leader Only)
```http
POST /api/solve-requests/:requestId/respond
Authorization: Bearer <leader_token>
Content-Type: application/json

{
  "action": "APPROVE" // or "REJECT"
}

Response: 200 OK
{
  "success": true,
  "message": "Solve request approved",
  "data": {
    "requestId": 101,
    "questionId": 5,
    "status": "APPROVED"
  }
}
```

#### 13. Get Questions for Room
```http
GET /api/rooms/:roomId/questions
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 5,
      "title": "Two Sum",
      "difficulty": "EASY",
      "topic": "Arrays",
      "points": 100,
      "examples": [...],
      "constraints": "..."
    },
    ...
  ]
}
```

---

### Code Submission APIs

#### 14. Submit Code (Run)
```http
POST /api/submissions/run
Authorization: Bearer <member_token>
Content-Type: application/json

{
  "teamId": "team_abc123",
  "questionId": 5,
  "code": "function twoSum(nums, target) { ... }",
  "language": "JAVASCRIPT"
}

Response: 200 OK
{
  "success": true,
  "data": {
    "testResults": [
      {
        "testCaseId": 1,
        "passed": true,
        "executionTime": 45,
        "output": "[0, 1]"
      },
      {
        "testCaseId": 2,
        "passed": false,
        "output": "[1, 2]",
        "expected": "[0, 3]"
      }
    ],
    "status": "WRONG_ANSWER"
  }
}
```

#### 15. Submit Code (Final Submission)
```http
POST /api/submissions/submit
Authorization: Bearer <member_token>
Content-Type: application/json

{
  "teamId": "team_abc123",
  "questionId": 5,
  "code": "function twoSum(nums, target) { ... }",
  "language": "JAVASCRIPT"
}

Response: 201 Created
{
  "success": true,
  "data": {
    "submissionId": 501,
    "status": "ACCEPTED",
    "score": 100,
    "executionTime": 42,
    "memoryUsed": 8500,
    "testResults": [...]
  }
}
```

#### 16. Get Team Submissions
```http
GET /api/teams/:teamId/submissions?questionId=5
Authorization: Bearer <member_token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 501,
      "userId": 2,
      "userName": "Jane Smith",
      "status": "ACCEPTED",
      "score": 100,
      "submittedAt": "2025-11-07T10:30:00Z"
    },
    ...
  ]
}
```

---

### Real-Time Collaboration APIs (WebSocket)

#### 17. Join Question Workspace
```javascript
// WebSocket connection
socket.emit('join-question', {
  teamId: 'team_abc123',
  questionId: 5,
  token: 'member_jwt_token'
});

// Server acknowledges
socket.on('joined-question', (data) => {
  console.log('Active members:', data.activeMembers);
});
```

#### 18. Stream Code Changes
```javascript
// Send code updates
socket.emit('code-update', {
  teamId: 'team_abc123',
  questionId: 5,
  code: 'function twoSum...',
  language: 'JAVASCRIPT',
  cursorPosition: 45
});

// Receive others' code updates
socket.on('member-code-update', (data) => {
  console.log(`${data.userName} is coding:`, data.code);
});
```

#### 19. Leave Question Workspace
```javascript
socket.emit('leave-question', {
  teamId: 'team_abc123',
  questionId: 5
});
```

---

### Leaderboard APIs

#### 20. Get Live Leaderboard
```http
GET /api/rooms/:roomId/leaderboard
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "data": {
    "rankings": [
      {
        "rank": 1,
        "teamId": "team_xyz789",
        "teamName": "Algorithm Masters",
        "totalScore": 580,
        "solvedCount": 5,
        "members": [...]
      },
      {
        "rank": 2,
        "teamId": "team_abc123",
        "teamName": "Code Warriors",
        "totalScore": 450,
        "solvedCount": 4
      },
      ...
    ],
    "lastUpdated": "2025-11-07T11:30:00Z"
  }
}
```

---

### Notification APIs

#### 21. Get User Notifications
```http
GET /api/notifications?unreadOnly=true
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "data": [
    {
      "id": 101,
      "type": "SOLVE_REQUEST",
      "title": "New solve request",
      "message": "Jane Smith wants to solve 'Two Sum'",
      "isRead": false,
      "metadata": { "requestId": 101, "questionId": 5 },
      "createdAt": "2025-11-07T10:15:00Z"
    },
    ...
  ]
}
```

#### 22. Mark Notification as Read
```http
PATCH /api/notifications/:notificationId/read
Authorization: Bearer <access_token>

Response: 200 OK
{
  "success": true,
  "message": "Notification marked as read"
}
```

---

## 🎨 Additional Feature Suggestions

### 1. **Question Templates Library**
- Pre-built question templates for common DSA patterns
- Users can customize templates before AI generation
- **Field Additions**: `QuestionTemplate` model with `pattern`, `baseCode`, `hints`

### 2. **Code Review System**
- After submission, team members can review and comment on each other's code
- **New Models**: `CodeReview`, `ReviewComment`

### 3. **Team Chat**
- Text-based communication within teams
- **New Model**: `TeamMessage` with `teamId`, `userId`, `message`, `timestamp`

### 4. **Voice Channels**
- Integrate WebRTC for voice communication
- **Field Addition**: `Team.voiceChannelId`, `VoiceSession` model

### 5. **Hints System**
- AI-generated hints for stuck teams (costs points)
- **Field Addition**: `Question.hints` (JSON array), `HintUsage` model

### 6. **Replay System**
- Watch replay of how questions were solved after room ends
- **New Model**: `CodeHistory` to track all code changes

### 7. **Room Templates**
- Save room configurations as templates for future use
- **New Model**: `RoomTemplate`

### 8. **Achievements & Badges**
- Gamification with badges (First Blood, Speed Demon, Team Player)
- **New Model**: `Achievement`, `UserAchievement`

### 9. **Private Rooms**
- Invite-only rooms for practice sessions
- **Field Addition**: `Room.isPrivate`, `RoomInvitation` model

### 10. **Code Snippets Library**
- Teams can save useful code snippets during the contest
- **New Model**: `CodeSnippet` with `teamId`, `language`, `code`, `description`

### 11. **Analytics Dashboard**
- Post-contest analytics: time spent per question, attempts, most used language
- **New Model**: `RoomAnalytics`, `TeamAnalytics`

### 12. **Spectator Mode**
- Non-participants can watch the contest live (read-only)
- **Field Addition**: `RoomMembership.role` (PARTICIPANT, SPECTATOR)

---

## 🔐 Security Considerations

1. **Rate Limiting**: Implement rate limits on code execution (prevent spam)
2. **Code Sandboxing**: Use Docker with resource limits for code execution
3. **Input Validation**: Sanitize all user inputs, especially code
4. **JWT Expiration**: Short-lived access tokens, longer refresh tokens
5. **Password Hashing**: Use bcrypt with salt for room and user passwords
6. **SQL Injection**: Prisma handles this, but validate raw queries
7. **WebSocket Authentication**: Verify JWT before allowing socket connections
8. **API Abuse**: Monitor API usage per user/IP

---

## 📊 Scoring System Proposal

### Base Points by Difficulty
- **EASY**: 100 points
- **MEDIUM**: 200 points
- **HARD**: 300 points

### Time-Based Multiplier
- First 25% of time: 1.5x multiplier
- 25-50% of time: 1.25x multiplier
- 50-75% of time: 1.0x multiplier
- Last 25% of time: 0.75x multiplier

### Penalties
- Wrong submission: -10% of question points
- Hint usage: -20% of question points per hint

### Team Score Calculation
```
Team Score = Σ(Question Base Points × Time Multiplier) - Penalties
```

---

## 🚀 Implementation Roadmap

### Phase 1: Core Foundation (Weeks 1-3)
- [ ] User authentication system
- [ ] Room creation and management
- [ ] Basic question CRUD

### Phase 2: Team System (Weeks 4-5)
- [ ] Team creation, join requests
- [ ] Leader approval system
- [ ] JWT-based access control

### Phase 3: AI Integration (Week 6)
- [ ] AI question generation API
- [ ] Question validation and test case generation

### Phase 4: Code Execution (Weeks 7-8)
- [ ] Docker-based code execution engine
- [ ] Multi-language support
- [ ] Test case validation

### Phase 5: Real-Time Features (Weeks 9-10)
- [ ] WebSocket setup
- [ ] Live code viewing
- [ ] Real-time leaderboard updates

### Phase 6: Competition Flow (Week 11)
- [ ] Solve request system
- [ ] Submission and scoring
- [ ] Room start/end automation

### Phase 7: Polish & Launch (Week 12)
- [ ] Notifications system
- [ ] Analytics dashboard
- [ ] Performance optimization
- [ ] Testing and bug fixes

---

## 💡 Key Technical Challenges & Solutions

### Challenge 1: Real-Time Code Synchronization
**Solution**: Use Socket.io with debouncing (send updates every 500ms) and operational transformation for conflict resolution

### Challenge 2: Code Execution Security
**Solution**: Docker containers with strict resource limits, network isolation, and automatic timeout

### Challenge 3: AI Question Generation Consistency
**Solution**: Structured prompts with validation, regeneration on failure, manual review queue

### Challenge 4: Scalability
**Solution**: Redis caching for active rooms, database connection pooling, CDN for static assets

### Challenge 5: Fair Team Assignment
**Solution**: Auto-balance teams based on skill level (track user statistics from previous rooms)

---

This documentation should give you a solid foundation! Your project idea is excellent—it truly combines learning with the social dynamics of gaming. Let me know if you need clarification on any APIs, want me to expand specific sections, or need help with implementation details!