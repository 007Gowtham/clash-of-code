# Task 2: Fix Team Joining Logic

## Priority: CRITICAL
## Estimated Time: 3-4 hours
## Dependencies: Backend API updates

## Current State
- Public teams: Direct join on click
- Private teams: Show modal asking for code
- Logic checks `team.visibility` to determine flow

## Target State (User's Requirement)
- **ALL teams**: Show modal asking for team name + code
- User must enter team name to confirm which team they want to join
- Code is optional for public teams, required for private teams
- Backend validates team exists and code matches

## Implementation Plan

### Frontend Changes

#### 1. Update `handleTeamClick` in `/home/aswin/Music/code/app/room/[id]/waiting/page.jsx`

**Current Logic:**
```jsx
const handleTeamClick = async (team) => {
  if (team.isUserTeam) {
    setIsSidebarOpen(true);
    return;
  }

  if (team.visibility === 'PRIVATE' || team.status === 'Locked') {
    setSelectedTeam(team);
    setJoinTeamData({ name: team.name, code: '' });
    setShowJoinModal(true);
  } else if (team.members >= team.maxMembers) {
    toast.error('This team is full');
  } else {
    // Direct join for public teams
    await joinTeam(team.id);
    router.push(`/room/${roomId}/${team.id}/code-editor`);
  }
};
```

**New Logic:**
```jsx
const handleTeamClick = async (team) => {
  // If it's user's team, show sidebar
  if (team.isUserTeam) {
    setIsSidebarOpen(true);
    return;
  }

  // If team is full, show error
  if (team.members >= team.maxMembers) {
    toast.error('This team is full');
    return;
  }

  // If team is locked/started, show error
  if (team.status === 'Locked') {
    toast.error('This team has already started');
    return;
  }

  // For ALL other teams (public or private), show join modal
  setSelectedTeam(team);
  setJoinTeamData({ 
    name: '', // User must type team name
    code: ''  // Optional for public, required for private
  });
  setShowJoinModal(true);
};
```

#### 2. Update Join Team Modal Component

**File:** `/home/aswin/Music/code/src/components/room/modals/JoinTeamModal.jsx` (create if doesn't exist)

**Props:**
```jsx
{
  isOpen: boolean,
  onClose: () => void,
  onJoin: (teamName: string, code: string) => Promise<void>,
  selectedTeam: Team | null,
  isLoading: boolean
}
```

**UI Structure:**
```jsx
<Modal isOpen={isOpen} onClose={onClose}>
  <div className="p-6">
    <h2 className="text-xl font-bold mb-4">Join Team</h2>
    
    {selectedTeam && (
      <div className="mb-4 p-3 bg-gray-50 rounded-lg">
        <p className="text-sm text-gray-600">
          You're about to join: <strong>{selectedTeam.name}</strong>
        </p>
        {selectedTeam.visibility === 'PRIVATE' && (
          <p className="text-xs text-amber-600 mt-1">
            This is a private team - code required
          </p>
        )}
      </div>
    )}

    <form onSubmit={handleSubmit}>
      <Input
        label="Team Name"
        placeholder="Enter team name to confirm"
        value={teamName}
        onChange={(e) => setTeamName(e.target.value)}
        required
        helperText="Type the exact team name to confirm"
      />

      <Input
        label={selectedTeam?.visibility === 'PRIVATE' ? 'Team Code (Required)' : 'Team Code (Optional)'}
        placeholder="Enter team code if provided"
        value={code}
        onChange={(e) => setCode(e.target.value)}
        required={selectedTeam?.visibility === 'PRIVATE'}
        helperText={selectedTeam?.visibility === 'PRIVATE' 
          ? 'This private team requires a code'
          : 'Enter code if the team leader provided one'
        }
      />

      <div className="flex gap-3 mt-6">
        <Button variant="ghost" onClick={onClose}>Cancel</Button>
        <Button type="submit" isLoading={isLoading}>Join Team</Button>
      </div>
    </form>
  </div>
</Modal>
```

#### 3. Update Join Handler

```jsx
const handleJoinTeam = async (teamName, code) => {
  // Validate team name matches
  if (teamName.trim() !== selectedTeam.name) {
    toast.error('Team name does not match');
    return;
  }

  try {
    // Call API with team ID and optional code
    await joinTeam({ 
      teamId: selectedTeam.id, 
      code: code || undefined 
    });
    
    setShowJoinModal(false);
    toast.success(`Joined ${selectedTeam.name}!`);
    router.push(`/room/${roomId}/${selectedTeam.id}/code-editor`);
  } catch (error) {
    // Error already shown by API client
    console.error('Join team error:', error);
  }
};
```

### Backend Changes

#### 1. Update Team Join Endpoint

**File:** `/home/aswin/Music/backend/src/controllers/teamController.js`

**Current:**
```javascript
async joinTeam(req, res) {
  const { teamId } = req.params;
  // Direct join logic
}
```

**New:**
```javascript
async joinTeam(req, res) {
  const { teamId } = req.params;
  const { code } = req.body; // Optional code from request body
  const userId = req.user.id;

  try {
    const team = await prisma.team.findUnique({
      where: { id: teamId },
      include: { 
        members: true,
        room: true 
      }
    });

    if (!team) {
      return res.status(404).json({ 
        success: false, 
        error: 'Team not found' 
      });
    }

    // Check if team is full
    if (team.members.length >= team.maxMembers) {
      return res.status(400).json({ 
        success: false, 
        error: 'Team is full' 
      });
    }

    // Check if user is already in a team in this room
    const existingMembership = await prisma.teamMember.findFirst({
      where: {
        userId,
        team: { roomId: team.roomId }
      }
    });

    if (existingMembership) {
      return res.status(400).json({ 
        success: false, 
        error: 'You are already in a team in this room' 
      });
    }

    // If team is private, validate code
    if (team.visibility === 'PRIVATE') {
      if (!code) {
        return res.status(400).json({ 
          success: false, 
          error: 'Team code is required for private teams' 
        });
      }

      // Check if team has a code field (you may need to add this to schema)
      if (team.code && team.code !== code) {
        return res.status(403).json({ 
          success: false, 
          error: 'Invalid team code' 
        });
      }
    }

    // Add user to team
    await prisma.teamMember.create({
      data: {
        teamId,
        userId
      }
    });

    res.json({ 
      success: true, 
      message: 'Successfully joined team',
      data: { teamId }
    });
  } catch (error) {
    console.error('Join team error:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Failed to join team' 
    });
  }
}
```

#### 2. Add Team Code Field to Schema (if not exists)

**File:** `/home/aswin/Music/backend/prisma/schema.prisma`

```prisma
model Team {
  id          String          @id @default(uuid())
  name        String
  code        String?         // Optional team code for private teams
  roomId      String
  leaderId    String
  visibility  TeamVisibility  @default(PUBLIC)
  // ... rest of fields
}
```

**Migration:**
```bash
npx prisma migrate dev --name add_team_code
```

### API Service Update

**File:** `/home/aswin/Music/code/src/lib/api/services/team.js`

```javascript
async joinTeam(teamId, code) {
  const response = await apiClient.post(`/api/teams/${teamId}/join`, { code });
  return response.data;
}
```

## Testing Checklist

### Frontend
- [ ] Clicking any team (public/private) shows join modal
- [ ] Modal displays team name and privacy status
- [ ] Team name validation works (must match exactly)
- [ ] Code field is required for private teams
- [ ] Code field is optional for public teams
- [ ] Error messages display correctly
- [ ] Success redirects to code editor
- [ ] User's current team opens sidebar instead

### Backend
- [ ] Public teams can be joined without code
- [ ] Private teams require valid code
- [ ] Invalid code returns 403 error
- [ ] Full teams return 400 error
- [ ] Users can't join multiple teams in same room
- [ ] Team member is added to database
- [ ] Response includes team ID

## Migration Steps

1. Update Prisma schema (add `code` field to Team model)
2. Run migration: `npx prisma migrate dev`
3. Update seed script to add codes to private teams
4. Update backend controller
5. Update frontend API service
6. Create/update JoinTeamModal component
7. Update handleTeamClick logic
8. Test thoroughly

## Rollback Plan

If issues occur:
1. Revert `handleTeamClick` to check `visibility` first
2. Keep direct join for public teams
3. Only show modal for private teams
4. Remove team name validation requirement
