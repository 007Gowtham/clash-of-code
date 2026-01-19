# Production Refactoring & Integration Plan

## Objective
TRANSFORM the current prototype into a production-ready, highly reusable, and fully integrated application.

## 1. Component Architecture Refactoring
**Goal**: Eliminate code duplication and ensure visual consistency.

### New Common Components (`src/components/common`)
- **Card**: Base visual container with premium styling (bg-white, rounded-xl, shadow-sm).
- **Badge**: Status/Role indicators (e.g., Difficulty, Leader, Status).
- **Avatar**: Standardized user avatar with fallbacks.
- **Loader**: Global loading spinner/overlay.
- **EmptyState**: Standardized "No items found" display.
- **Alert/Toast**: For success/error feedbacks.

### specific Refactors
- **Room List**: Utilize `Card` and `Badge` in `TeamCard`.
- **Waiting Room**: Refactor `membersList`, `teamcard` to use shared components.
- **Code Editor**: Update `ProblemPanel`, `CodeEditorHeader`, `RightSidebar` to use shared components.

## 2. Backend Integration Strategy
**Goal**: Replace all dummy data with real API calls.

### API Client Setup
- Create `src/lib/api.js` (or `axios` instance) with interceptors for:
  - Auth token injection.
  - Global error handling.
  - Response formatting.

### Integration Points
1.  **Auth**: Ensure Login/Signup flow works (already exists?).
2.  **Room List (`/room`)**:
    - Fetch rooms: `GET /api/rooms`
    - Create room: `POST /api/rooms`
    - Join room: `POST /api/rooms/:id/join`
3.  **Waiting Room (`/room/:id/waiting`)**:
    - Fetch room details: `GET /api/rooms/:id`
    - Create team: `POST /api/rooms/:id/teams`
    - Join team: `POST /api/teams/:id/join`
    - Real-time updates (Socket.io) for new teams/members.
4.  **Code Editor (`/room/:id/:teamId/code-editor`)**:
    - Fetch problem: `GET /api/questions`
    - Submit code: `POST /api/submissions`
    - Real-time code sync (Socket.io).

## 3. Production Enhancements
- **Global Error Boundary**: Catch undefined errors.
- **React Query (TanStack Query)**: For data fetching, caching, and loading states.
- **Toaster**: Use `react-hot-toast` or similar for notifications.
- **Form Validation**: Ensure all inputs (`RoomForm`, `JoinForm`) are validated.

## Execution Steps
1.  **Setup**: Install necessary packages (`axios`, `react-hot-toast`, `tanstack/react-query` if not present). [COMPLETED]
2.  **API Layer**: reliable `src/services/api.js`. [COMPLETED]
3.  **Refactor Common**: Extract `Card`, `Badge`, `Avatar`. [COMPLETED]
4.  **Page Integration (Iterative)**:
    - Rooms Page [COMPLETED]
    - Waiting Room [COMPLETED]
    - Code Editor [COMPLETED]
5.  **Final Polish**: Check responsiveness and error states. [COMPLETED]
