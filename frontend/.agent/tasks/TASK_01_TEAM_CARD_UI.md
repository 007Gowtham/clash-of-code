# Task 1: Restore Premium Team Card UI

## Priority: HIGH
## Estimated Time: 2-3 hours
## Dependencies: None

## Current State
The team cards use a simplified `Card` component with basic styling. They lack the premium feel and visual hierarchy from the original HTML design.

## Target State (from HTML example)
```
- User's current team: Blue gradient background, star icon badge, ring effect
- Team leader: Crown icon badge on avatar
- Status badges: Color-coded (green=Open, amber=Full, gray=Locked)
- Member avatars: Initials with colored backgrounds
- Hover effects: Subtle shadow and border color change
- Tooltips: "Leave current team first" for disabled join buttons
- Visual hierarchy: Clear distinction between joinable/full/locked teams
```

## Files to Modify

### 1. `/home/aswin/Music/code/src/components/room/waiting/teamcard.jsx`

**Changes Required:**

#### A. Add Star Badge for Current User's Team
```jsx
{isUserTeam && (
  <div className="absolute -top-3 -right-3">
    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 ring-2 ring-white">
      <Star className="w-3.5 h-3.5 text-white fill-current" />
    </span>
  </div>
)}
```

#### B. Update Container Styling
```jsx
// Current team
className={`group relative bg-white rounded-xl p-4 shadow-sm transition-all ${
  isUserTeam 
    ? 'border-2 border-blue-100 ring-4 ring-blue-50/50' 
    : 'border border-gray-200 hover:border-gray-300 hover:shadow-sm'
}`}

// Full team - add grayscale
className="... opacity-75 grayscale-[20%]"

// Locked team - add opacity
className="... opacity-60"
```

#### C. Add Team Leader Crown Icon
```jsx
<div className="relative">
  {member.avatar ? (
    <img src={member.avatar} className="w-10 h-10 rounded-lg ring-2 ring-gray-100" />
  ) : (
    <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
      {member.initial}
    </div>
  )}
  {isLeader && (
    <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-0.5 shadow-sm">
      <Crown className="w-3 h-3 text-amber-500 fill-amber-500" />
    </div>
  )}
</div>
```

#### D. Enhanced Status Badges
```jsx
// Open
<span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700">
  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
  Open
</span>

// Full
<span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-semibold bg-amber-50 text-amber-700">
  <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
  Full
</span>

// Locked
<span className="inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-semibold bg-gray-100 text-gray-500">
  Locked
</span>
```

#### E. Join Button with Tooltip
```jsx
{!isUserTeam && status === 'Open' && (
  <div className="group/btn relative">
    <button 
      disabled={userHasTeam}
      className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
        userHasTeam 
          ? 'border border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
          : 'border border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      Join Team
    </button>
    {userHasTeam && (
      <div className="absolute bottom-full mb-2 left-1/2 -translate-x-1/2 px-2 py-1 bg-gray-900 text-white text-[10px] rounded opacity-0 group-hover/btn:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
        Leave current team first
      </div>
    )}
  </div>
)}
```

## Props to Add
```jsx
{
  isUserTeam: boolean,      // Is this the current user's team?
  userHasTeam: boolean,     // Does user already have a team?
  isLeader: boolean,        // Is the displayed member a leader?
  status: 'Open' | 'Full' | 'Locked'
}
```

## Icons to Import
```jsx
import { Star, Crown, Lock } from 'lucide-react';
```

## Testing Checklist
- [ ] User's team shows blue gradient and star badge
- [ ] Team leader shows crown icon
- [ ] Status badges display correct colors
- [ ] Hover effects work on joinable teams
- [ ] Tooltip shows when hovering disabled join button
- [ ] Full teams show grayscale effect
- [ ] Locked teams show reduced opacity
- [ ] Responsive on mobile (cards stack properly)

## Notes
- Maintain existing functionality (onClick handlers, etc.)
- Keep accessibility (ARIA labels, keyboard navigation)
- Ensure color contrast meets WCAG AA standards
- Test with different team sizes (1-4 members)
