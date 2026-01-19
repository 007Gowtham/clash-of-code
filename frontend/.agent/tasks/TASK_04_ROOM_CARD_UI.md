# Task 4: Restore Premium Room Card UI

## Priority: MEDIUM
## Estimated Time: 2-3 hours
## Dependencies: None

## Current State
Room cards on `/room` page use basic styling without the rich visual hierarchy from the HTML example.

## Target State (from HTML example)
- Difficulty visualization with colored dots (green/orange/red)
- Team count with progress indicator
- Duration display with clock icon
- Status badges for room state
- Privacy indicators (lock icon for private)
- Hover effects and shadows
- Better typography and spacing

## Component Structure

### Update Room Card Component

**File:** `/home/aswin/Music/code/src/components/room/RoomCard.jsx` (or create if doesn't exist)

```jsx
'use client';

import { Clock, Users, Lock, Globe, Trophy } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function RoomCard({ room, onJoin }) {
  const router = useRouter();
  
  const isPrivate = room.settings?.privacy === 'PRIVATE';
  const isFull = room.currentParticipants >= room.settings?.maxParticipants;
  const isActive = room.status === 'ACTIVE';
  const isCompleted = room.status === 'COMPLETED';

  const handleClick = () => {
    if (isCompleted) return;
    if (isPrivate) {
      onJoin(room);
    } else {
      router.push(`/room/${room.id}/waiting`);
    }
  };

  return (
    <div 
      onClick={handleClick}
      className={`group bg-white rounded-xl border p-5 transition-all cursor-pointer ${
        isCompleted 
          ? 'opacity-60 cursor-not-allowed border-gray-200'
          : 'border-gray-200 hover:border-gray-300 hover:shadow-lg'
      }`}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <h3 className="text-lg font-bold text-gray-900 group-hover:text-blue-600 transition-colors">
              {room.name}
            </h3>
            {isPrivate && (
              <Lock className="w-4 h-4 text-gray-400" />
            )}
          </div>
          <p className="text-sm text-gray-500 line-clamp-2">
            {room.description || 'Competitive coding challenge'}
          </p>
        </div>
        
        {/* Status Badge */}
        <div>
          {isCompleted ? (
            <span className="px-2.5 py-1 rounded-md bg-gray-100 text-gray-600 text-xs font-semibold uppercase">
              Ended
            </span>
          ) : isActive ? (
            <span className="px-2.5 py-1 rounded-md bg-green-50 text-green-600 text-xs font-semibold uppercase flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
              Live
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-md bg-blue-50 text-blue-600 text-xs font-semibold uppercase">
              Waiting
            </span>
          )}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        {/* Teams */}
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Users className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500 font-medium">Teams</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {room.currentTeams || 0}
            <span className="text-sm text-gray-400 font-normal">
              /{room.settings?.maxParticipants || 20}
            </span>
          </p>
        </div>

        {/* Duration */}
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500 font-medium">Duration</span>
          </div>
          <p className="text-lg font-semibold text-gray-900">
            {room.duration || 60}
            <span className="text-sm text-gray-400 font-normal">m</span>
          </p>
        </div>

        {/* Mode */}
        <div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
          <div className="flex items-center gap-2 mb-1">
            <Trophy className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500 font-medium">Mode</span>
          </div>
          <p className="text-sm font-semibold text-gray-900 capitalize">
            {room.settings?.mode || 'Team'}
          </p>
        </div>
      </div>

      {/* Difficulty Visualization */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
            Difficulty Mix
          </span>
          <span className="text-xs font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-100">
            {getTotalProblems(room.settings?.difficulty)} Problems
          </span>
        </div>
        <div className="flex gap-1">
          {renderDifficultyDots(room.settings?.difficulty)}
        </div>
      </div>

      {/* Footer */}
      <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isPrivate ? (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Lock className="w-3.5 h-3.5" />
              <span>Private</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-gray-500">
              <Globe className="w-3.5 h-3.5" />
              <span>Public</span>
            </div>
          )}
        </div>

        <button 
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            isCompleted
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
              : isFull
              ? 'bg-amber-50 text-amber-600 border border-amber-200'
              : 'bg-blue-600 text-white hover:bg-blue-700 shadow-sm'
          }`}
          disabled={isCompleted}
        >
          {isCompleted ? 'Ended' : isFull ? 'Full' : isPrivate ? 'Join with Code' : 'Join Room'}
        </button>
      </div>
    </div>
  );
}

// Helper function to render difficulty dots
function renderDifficultyDots(difficulty = { easy: 2, medium: 2, hard: 1 }) {
  const dots = [];
  
  // Easy (green)
  for (let i = 0; i < (difficulty.easy || 0); i++) {
    dots.push(
      <div key={`easy-${i}`} className="h-2 w-6 rounded-full bg-emerald-500" />
    );
  }
  
  // Medium (orange)
  for (let i = 0; i < (difficulty.medium || 0); i++) {
    dots.push(
      <div key={`medium-${i}`} className="h-2 w-6 rounded-full bg-orange-400" />
    );
  }
  
  // Hard (red)
  for (let i = 0; i < (difficulty.hard || 0); i++) {
    dots.push(
      <div key={`hard-${i}`} className="h-2 w-6 rounded-full bg-rose-500" />
    );
  }
  
  return dots;
}

// Helper function to get total problems
function getTotalProblems(difficulty = { easy: 2, medium: 2, hard: 1 }) {
  return (difficulty.easy || 0) + (difficulty.medium || 0) + (difficulty.hard || 0);
}
```

### Update Rooms Page

**File:** `/home/aswin/Music/code/app/room/page.jsx`

**Replace TeamCard with RoomCard:**
```jsx
import RoomCard from '@/components/room/RoomCard';

// In the render:
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
  {filteredRooms.map((room) => (
    <RoomCard
      key={room.id}
      room={room}
      onJoin={handleJoinPrivateRoom}
    />
  ))}
</div>
```

## Visual Enhancements

### 1. Difficulty Dots
- **Easy**: Emerald green (`bg-emerald-500`)
- **Medium**: Orange (`bg-orange-400`)
- **Hard**: Rose red (`bg-rose-500`)
- Each dot: `h-2 w-6 rounded-full`

### 2. Status Badges
- **Waiting**: Blue background (`bg-blue-50 text-blue-600`)
- **Live**: Green with pulsing dot (`bg-green-50 text-green-600`)
- **Ended**: Gray (`bg-gray-100 text-gray-600`)

### 3. Privacy Indicators
- **Public**: Globe icon + "Public" text
- **Private**: Lock icon + "Private" text

### 4. Hover Effects
```css
hover:border-gray-300 hover:shadow-lg
```

### 5. Stats Cards
```jsx
<div className="p-3 bg-gray-50 rounded-lg border border-gray-100">
  {/* Icon + Label */}
  {/* Value */}
</div>
```

## Data Structure Expected

```typescript
interface Room {
  id: string;
  name: string;
  code: string;
  description?: string;
  status: 'WAITING' | 'ACTIVE' | 'COMPLETED';
  duration: number; // minutes
  currentTeams: number;
  currentParticipants: number;
  settings: {
    privacy: 'PUBLIC' | 'PRIVATE';
    maxParticipants: number;
    mode: 'solo' | 'team';
    difficulty: {
      easy: number;
      medium: number;
      hard: number;
    };
  };
}
```

## Testing Checklist

- [ ] Difficulty dots render correctly (green/orange/red)
- [ ] Team count displays current vs max
- [ ] Duration shows in minutes
- [ ] Status badge shows correct state (Waiting/Live/Ended)
- [ ] Privacy indicator shows lock for private rooms
- [ ] Hover effects work (shadow, border color)
- [ ] Click handler works for public rooms
- [ ] Join modal shows for private rooms
- [ ] Full rooms show "Full" button
- [ ] Ended rooms are disabled
- [ ] Responsive grid layout works
- [ ] All icons display correctly

## Icons Needed
```jsx
import { 
  Clock, 
  Users, 
  Lock, 
  Globe, 
  Trophy 
} from 'lucide-react';
```

## Responsive Behavior

- **Mobile (<640px)**: 1 column
- **Tablet (640-1024px)**: 2 columns
- **Desktop (>1024px)**: 3 columns

## Notes

- Maintain consistent spacing with team cards
- Use same color palette across the app
- Ensure accessibility (ARIA labels, keyboard navigation)
- Add loading skeleton for better UX
- Consider adding room creator/admin badge
