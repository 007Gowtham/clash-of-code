# Task 3: Implement Team Sidebar Display

## Priority: HIGH
## Estimated Time: 4-5 hours
## Dependencies: Task 2 (team membership detection)

## Current State
- No team sidebar component exists
- User cannot see their team details while in waiting room
- No way to view team members, chat, or leave team

## Target State (from HTML example)
- Sidebar appears on right side when user is in a team
- Shows team header with name, code, and member count
- Lists all team members with leader crown
- Shows pending join requests (for team leaders)
- Includes team chat interface
- Has "Leave Team" and "Ready/Start" buttons

## Component Structure

### 1. Create Main Sidebar Component

**File:** `/home/aswin/Music/code/src/components/room/waiting/TeamSidebar.jsx`

```jsx
'use client';

import { useState } from 'react';
import { Crown, LogOut, Send, Users, Copy, Check } from 'lucide-react';
import Button from '@/components/common/Button';
import { toast } from 'react-hot-toast';

export default function TeamSidebar({ 
  team,
  currentUser,
  isLeader,
  onLeaveTeam,
  onAcceptRequest,
  onRejectRequest,
  onSendMessage,
  isRoomStarted 
}) {
  const [message, setMessage] = useState('');
  const [codeCopied, setCodeCopied] = useState(false);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(team.code);
    setCodeCopied(true);
    toast.success('Team code copied!');
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (message.trim()) {
      onSendMessage(message);
      setMessage('');
    }
  };

  return (
    <aside className="w-96 bg-white border-l border-gray-200 flex flex-col z-10 shadow-xl shadow-gray-200/50">
      
      {/* Team Header */}
      <div className="p-6 border-b border-gray-100 bg-gray-50/30">
        <div className="flex items-center justify-between mb-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-gray-400">
            Your Team
          </span>
          <button 
            onClick={onLeaveTeam}
            className="text-gray-400 hover:text-red-600 transition-colors" 
            title="Leave Team"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
        
        <div className="flex items-center gap-4 mb-4">
          <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white text-xl font-bold shadow-md shadow-blue-500/20">
            {team.name.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <h2 className="text-lg font-bold text-gray-900 tracking-tight">
              {team.name}
            </h2>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-xs text-gray-500">Invite Code:</span>
              <button
                onClick={handleCopyCode}
                className="flex items-center gap-1 text-xs font-mono bg-gray-100 px-1.5 py-0.5 rounded text-gray-700 hover:bg-gray-200 transition-colors"
              >
                {team.code}
                {codeCopied ? (
                  <Check className="w-3 h-3 text-green-600" />
                ) : (
                  <Copy className="w-3 h-3" />
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs font-medium text-gray-500 bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
          <span>Members</span>
          <span className="text-gray-900">
            {team.members.length} <span className="text-gray-400">/ {team.maxMembers || 4}</span>
          </span>
        </div>
      </div>

      {/* Team Members List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <div className="space-y-6">
          {/* Approved Members */}
          <div>
            <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide mb-3">
              Team Members
            </h3>
            <div className="space-y-2">
              {team.members.map((member) => (
                <TeamMemberCard
                  key={member.id}
                  member={member}
                  isCurrentUser={member.id === currentUser.id}
                  isLeader={member.id === team.leaderId}
                  canKick={isLeader && member.id !== currentUser.id}
                  onKick={() => {/* TODO: Implement kick */}}
                />
              ))}
            </div>
          </div>

          {/* Pending Requests (Leader Only) */}
          {isLeader && team.pendingRequests?.length > 0 && (
            <div className="pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-xs font-semibold text-gray-900 uppercase tracking-wide">
                  Pending Requests
                </h3>
                <span className="text-[10px] font-bold bg-amber-100 text-amber-700 px-1.5 py-0.5 rounded-full">
                  {team.pendingRequests.length}
                </span>
              </div>
              
              {team.pendingRequests.map((request) => (
                <JoinRequestCard
                  key={request.id}
                  request={request}
                  onAccept={() => onAcceptRequest(request.id)}
                  onReject={() => onRejectRequest(request.id)}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Footer: Chat & Ready Button */}
      <div className="p-4 border-t border-gray-200 bg-gray-50">
        {/* Team Chat */}
        <div className="bg-white border border-gray-200 rounded-xl p-3 shadow-sm mb-3 h-32 flex flex-col">
          <div className="flex-1 overflow-y-auto space-y-2 mb-2 custom-scrollbar">
            <div className="text-[10px] text-gray-400 text-center my-1">
              Chat started
            </div>
            {team.messages?.map((msg, idx) => (
              <div key={idx} className="flex gap-2">
                <span className={`text-[10px] font-bold ${
                  msg.userId === currentUser.id ? 'text-gray-700' : 'text-indigo-600'
                }`}>
                  {msg.username}:
                </span>
                <span className="text-[10px] text-gray-600">{msg.text}</span>
              </div>
            ))}
          </div>
          <form onSubmit={handleSendMessage} className="relative">
            <input
              type="text"
              placeholder="Message team..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full text-xs border border-gray-200 rounded-md py-1.5 pl-2 pr-7 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            />
            <button 
              type="submit"
              className="absolute right-1.5 top-1.5 text-gray-400 hover:text-blue-600"
            >
              <Send className="w-3 h-3" />
            </button>
          </form>
        </div>
        
        {/* Ready/Start Button */}
        <button 
          disabled={!isRoomStarted}
          className="w-full py-2.5 rounded-xl bg-gray-900 text-white text-sm font-medium shadow-lg shadow-gray-200/50 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors"
        >
          {isRoomStarted ? (
            <>
              <Users className="w-4 h-4" />
              Ready to Start
            </>
          ) : (
            <>
              <Clock className="w-4 h-4" />
              Waiting for Admin Start
            </>
          )}
        </button>
      </div>
    </aside>
  );
}

// Sub-component: Team Member Card
function TeamMemberCard({ member, isCurrentUser, isLeader, canKick, onKick }) {
  return (
    <div className={`flex items-center justify-between p-3 rounded-xl transition-colors group ${
      isCurrentUser 
        ? 'bg-blue-50/50 border border-blue-100' 
        : 'border border-gray-100 hover:bg-gray-50'
    }`}>
      <div className="flex items-center gap-3">
        <div className="relative">
          <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-gray-600 text-xs font-bold border border-white shadow-sm">
            {member.username?.substring(0, 2).toUpperCase() || 'U'}
          </div>
          {isLeader && (
            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
              <Crown className="w-3 h-3 text-amber-500 fill-amber-500" />
            </div>
          )}
        </div>
        <div>
          <div className="flex items-center gap-2">
            <p className="text-sm font-semibold text-gray-900">{member.username}</p>
            {isCurrentUser && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded bg-blue-100 text-blue-700">
                You
              </span>
            )}
          </div>
          <p className="text-[10px] text-gray-500">
            {isLeader ? 'Team Leader' : 'Member'}
          </p>
        </div>
      </div>
      {canKick && (
        <button 
          onClick={onKick}
          className="opacity-0 group-hover:opacity-100 p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded transition-all"
          title="Kick Member"
        >
          <UserX className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}

// Sub-component: Join Request Card
function JoinRequestCard({ request, onAccept, onReject }) {
  return (
    <div className="p-3 rounded-xl border border-amber-100 bg-amber-50/30 mb-2">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 text-xs font-bold">
            {request.user.username?.substring(0, 2).toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-medium text-gray-900">{request.user.username}</p>
            <p className="text-[10px] text-gray-500">Requested {/* TODO: time ago */}</p>
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button 
          onClick={onReject}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-medium text-gray-600 hover:bg-gray-50 hover:text-gray-900 shadow-sm transition-all"
        >
          Reject
        </button>
        <button 
          onClick={onAccept}
          className="flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-lg bg-blue-600 border border-transparent text-xs font-medium text-white hover:bg-blue-700 shadow-sm transition-all"
        >
          Accept
        </button>
      </div>
    </div>
  );
}
```

### 2. Integrate Sidebar into Waiting Room Page

**File:** `/home/aswin/Music/code/app/room/[id]/waiting/page.jsx`

**Add State:**
```jsx
const [isSidebarOpen, setIsSidebarOpen] = useState(false);
const [userTeam, setUserTeam] = useState(null);
```

**Fetch User's Team:**
```jsx
useEffect(() => {
  if (teams && currentUser) {
    const myTeam = teams.find(team => 
      team.members.some(member => member.userId === currentUser.id)
    );
    setUserTeam(myTeam);
    setIsSidebarOpen(!!myTeam); // Auto-open if user has team
  }
}, [teams, currentUser]);
```

**Add Sidebar to Layout:**
```jsx
<div className="flex flex-1 overflow-hidden">
  <main className="flex-1 flex flex-col min-w-0 bg-gray-50/50">
    {/* Existing content */}
  </main>

  {/* Team Sidebar - Only show if user is in a team */}
  {userTeam && isSidebarOpen && (
    <TeamSidebar
      team={userTeam}
      currentUser={currentUser}
      isLeader={userTeam.leaderId === currentUser.id}
      onLeaveTeam={handleLeaveTeam}
      onAcceptRequest={handleAcceptRequest}
      onRejectRequest={handleRejectRequest}
      onSendMessage={handleSendMessage}
      isRoomStarted={roomData?.status === 'ACTIVE'}
    />
  )}
</div>
```

### 3. Add Handler Functions

```jsx
const handleLeaveTeam = async () => {
  if (!confirm('Are you sure you want to leave this team?')) return;
  
  try {
    await leaveTeam(userTeam.id);
    setUserTeam(null);
    setIsSidebarOpen(false);
    toast.success('Left team successfully');
  } catch (error) {
    console.error('Leave team error:', error);
  }
};

const handleAcceptRequest = async (requestId) => {
  try {
    await acceptJoinRequest(requestId);
    toast.success('Request accepted');
    // Refetch teams to update UI
    refetchTeams();
  } catch (error) {
    console.error('Accept request error:', error);
  }
};

const handleRejectRequest = async (requestId) => {
  try {
    await rejectJoinRequest(requestId);
    toast.success('Request rejected');
    refetchTeams();
  } catch (error) {
    console.error('Reject request error:', error);
  }
};

const handleSendMessage = async (message) => {
  try {
    await sendTeamMessage(userTeam.id, message);
    // TODO: Update local state or use Socket.io for real-time
  } catch (error) {
    console.error('Send message error:', error);
  }
};
```

## Backend API Endpoints Needed

### 1. Leave Team
```
DELETE /api/teams/:teamId/leave
```

### 2. Accept Join Request
```
POST /api/teams/requests/:requestId/accept
```

### 3. Reject Join Request
```
POST /api/teams/requests/:requestId/reject
```

### 4. Send Team Message
```
POST /api/teams/:teamId/messages
Body: { message: string }
```

## Testing Checklist

- [ ] Sidebar appears when user joins a team
- [ ] Sidebar auto-opens on page load if user has team
- [ ] Team code can be copied to clipboard
- [ ] All team members are listed
- [ ] Leader shows crown icon
- [ ] Current user shows "You" badge
- [ ] Leave team button works
- [ ] Pending requests show for leaders only
- [ ] Accept/reject request buttons work
- [ ] Chat messages display correctly
- [ ] Send message works
- [ ] Ready button state changes based on room status
- [ ] Sidebar is responsive on smaller screens

## Responsive Behavior

- Desktop (>1024px): Sidebar always visible if user has team
- Tablet (768-1024px): Sidebar overlays content, can be toggled
- Mobile (<768px): Sidebar is full-screen overlay

## Socket.io Integration (Future)

For real-time updates:
- New team members joining
- Team messages
- Join request notifications
- Member leaving

## Notes

- Keep sidebar state in URL query param for persistence
- Add loading states for all async operations
- Implement optimistic UI updates where possible
- Add error boundaries for sidebar component
