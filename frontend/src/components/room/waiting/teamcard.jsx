'use client';

import { Star, Lock, Users, Shield } from 'lucide-react';
import { Button } from '@/components/common';

export default function TeamCard({
  id,
  name,
  leader,
  leaderName,
  members,
  maxMembers = 3,
  status,
  isUserTeam,
  onClick,
  buttonLabel = 'Join',
  userHasTeam = false,
  isLoading = false
}) {
  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 h-full">
        <div className="flex items-center gap-4 mb-5">
          <div className="w-12 h-12 bg-gray-100 rounded-xl animate-pulse" />
          <div className="space-y-2.5">
            <div className="h-4 w-32 bg-gray-100 rounded animate-pulse" />
            <div className="h-3 w-20 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
        <div className="space-y-3 mb-5">
          <div className="flex justify-between">
            <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
            <div className="h-3 w-24 bg-gray-100 rounded animate-pulse" />
          </div>
          <div className="flex justify-between">
            <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
            <div className="h-3 w-12 bg-gray-100 rounded animate-pulse" />
          </div>
        </div>
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
          <div className="h-5 w-16 bg-gray-100 rounded-md animate-pulse" />
          <div className="h-8 w-20 bg-gray-100 rounded-lg animate-pulse" />
        </div>
      </div>
    );
  }

  const isFull = status === 'Full' || members >= maxMembers;
  const isLocked = status === 'Locked';
  const canJoin = !isUserTeam && !isFull && !isLocked && !userHasTeam;
  // Use leader prop (if available) or leaderName from API
  const displayLeader = leader || leaderName || 'Unknown';

  const getInitials = (name) => {
    return name?.substring(0, 2).toUpperCase() || 'TM';
  };

  return (
    <div
      onClick={canJoin || isLocked ? onClick : undefined}
      className={`group relative bg-white rounded-2xl p-5 transition-all duration-300 h-full flex flex-col ${isUserTeam
        ? 'ring-2 ring-blue-500 shadow-md border-transparent'
        : 'border border-gray-200 hover:border-gray-300 hover:shadow-md cursor-pointer hover:-translate-y-1'
        } ${isFull ? 'opacity-80' : ''}`}
    >
      {isUserTeam && (
        <div className="absolute -top-3 -right-2 transform rotate-12">
          <span className="flex items-center justify-center p-1.5 bg-blue-600 rounded-lg shadow-md ring-2 ring-white">
            <Star className="w-3.5 h-3.5 text-white fill-current" />
          </span>
        </div>
      )}

      <div className="flex items-start justify-between mb-5">
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-lg font-bold shadow-sm transition-colors ${isUserTeam
            ? 'bg-blue-600 text-white'
            : isLocked
              ? 'bg-gray-100 text-gray-400'
              : 'bg-gray-100 text-gray-600 group-hover:bg-blue-50 group-hover:text-blue-600'
            }`}>
            {getInitials(name)}
          </div>
          <div>
            <h3 className="text-gray-900 font-bold mb-0.5 line-clamp-1 group-hover:text-blue-600 transition-colors">
              {name}
            </h3>
            <p className="text-xs font-medium text-gray-500 flex items-center gap-1.5">
              {isLocked ? (
                <span className="flex items-center gap-1"><Lock className="w-3 h-3" /> Private</span>
              ) : (
                <span className="flex items-center gap-1"><Users className="w-3 h-3" /> Public</span>
              )}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-5 flex-1">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 flex items-center gap-2">
            <Shield className="w-3.5 h-3.5" /> Leader
          </span>
          <span className="font-bold text-gray-900 truncate flex-1 text-right ml-4">
            {displayLeader}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-500 flex items-center gap-2">
            <Users className="w-3.5 h-3.5" /> Players
          </span>
          <div className="flex items-center gap-2">
            <div className="w-24 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full ${isFull ? 'bg-amber-500' : 'bg-blue-500'}`}
                style={{ width: `${Math.min((members / maxMembers) * 100, 100)}%` }}
              />
            </div>
            <span className={`font-semibold ${isFull ? 'text-amber-600' : 'text-gray-900'}`}>
              {members}/{maxMembers}
            </span>
          </div>
        </div>
      </div>

      <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold ${isLocked
          ? 'bg-gray-100 text-gray-500'
          : isFull
            ? 'bg-amber-50 text-amber-700'
            : 'bg-emerald-50 text-emerald-700'
          }`}>
          <span className={`w-1.5 h-1.5 rounded-full ${isLocked ? 'bg-gray-400' : isFull ? 'bg-amber-500' : 'bg-emerald-500'
            }`} />
          {isLocked ? 'Locked' : isFull ? 'Full' : 'Open'}
        </span>

        {isUserTeam ? (
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg">
            Joined
          </span>
        ) : (
          <Button
            size="sm"
            disabled={!canJoin && !isLocked}
            variant="primary"
            className={`h-8 text-xs font-bold border-gray-200 shadow-sm ${canJoin || isLocked
              ? 'bg-white hover:bg-black hover:text-white hover:border-black'
              : 'bg-gray-50 text-gray-400 border-transparent'
              }`}
          >
            {isLocked ? 'Request' : isFull ? 'Full' : buttonLabel}
          </Button>
        )}
      </div>
    </div>
  );
}
