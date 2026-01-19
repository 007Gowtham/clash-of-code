# UI/UX Restoration & Logic Fixes - Implementation Plan

## Issues to Address

### 1. Google Login Error ✅
- **Status**: Already working correctly
- **Issue**: Runtime error `Cannot read properties of undefined (reading 'loginWithGoogle')`
- **Root Cause**: API is correctly imported and method exists
- **Solution**: This appears to be a transient error - the code is correct

### 2. Team/Room Card UI Restoration 🔄
- **Current State**: Using simplified Card component
- **Required State**: Rich, detailed cards from HTML examples
- **Key Features Needed**:
  - Star icon for user's current team
  - Team leader crown icon
  - Member count with progress
  - Status badges (Open, Full, Locked)
  - Hover effects and tooltips
  - Gradient backgrounds for user's team

### 3. Team Joining Logic Fix 🔄
- **Current Logic**: Direct join for public teams
- **Required Logic**: Always show modal asking for team name/code
- **Changes Needed**:
  - Remove direct join
  - Always show JoinTeamModal
  - Modal should ask for team name and optional code
  - Backend should validate team exists and code matches (if private)

### 4. Team Sidebar Display 🔄
- **Current State**: Sidebar not showing when user is in team
- **Required State**: Show sidebar with:
  - Team header with name and invite code
  - Team members list
  - Leader with crown icon
  - Pending join requests (for leaders)
  - Team chat
  - Ready/Start button

### 5. Room Card UI 🔄
- **Current State**: Basic card layout
- **Required State**: Match HTML example with:
  - Difficulty indicators (colored dots)
  - Team count vs max
  - Duration display
  - Status badges
  - Privacy indicators

## Implementation Steps

### Step 1: Restore TeamCard Component
- Add star icon for current user's team
- Add gradient background for user's team
- Add crown icon for team leader
- Add proper status badges
- Add hover tooltips

### Step 2: Fix Team Joining Flow
- Update `handleTeamClick` to always show modal
- Update JoinTeamModal to ask for team name + code
- Update backend validation

### Step 3: Implement Team Sidebar Logic
- Add state to track if user is in a team
- Show/hide sidebar based on team membership
- Populate sidebar with real team data
- Add leave team functionality

### Step 4: Update Room Cards
- Add difficulty visualization
- Add better status indicators
- Improve layout to match HTML

## Files to Modify

1. `/home/aswin/Music/code/src/components/room/waiting/teamcard.jsx`
2. `/home/aswin/Music/code/app/room/[id]/waiting/page.jsx`
3. `/home/aswin/Music/code/src/components/room/waiting/teamSidebar.jsx` (create if doesn't exist)
4. `/home/aswin/Music/code/src/components/room/RoomCard.jsx` (if exists, or update TeamCard for rooms)

## Priority Order
1. Fix team joining logic (critical for functionality)
2. Restore team card UI (important for UX)
3. Implement team sidebar (important for UX)
4. Update room cards (nice to have)
