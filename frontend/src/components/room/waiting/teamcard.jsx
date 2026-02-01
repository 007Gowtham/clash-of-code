'use client';

import { Plus, Users } from 'lucide-react';

export default function TeamCard({ team, onJoinTeam }) {
  const isPublic = team.id === 't1' || team.id === 't2'; // Mock logic for design
  const filledSlots = team.members ? team.members.length : 0;
  const emptySlots = team.maxSize - filledSlots;

  return (
    <div className="flex flex-col items-start bg-white rounded-xl border border-slate-200/60 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300">
      {/* Header with Icon, Name, and Badge */}
      <div className="flex items-center justify-between w-full mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${isPublic ? 'bg-emerald-50' : 'bg-slate-50'}`}>
            {isPublic ? (
              <Users className="w-5 h-5 text-emerald-500" strokeWidth={1.5} />
            ) : (
              <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            )}
          </div>
          <h3 className="text-xl font-semibold text-slate-900 tracking-tight">
            {team.name}
          </h3>
        </div>
        <span className={`px-2.5 py-1 rounded-md text-xs font-medium ${isPublic ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
          {isPublic ? 'Public' : 'Private'}
        </span>
      </div>

      {/* Player Slots */}
      <div className="mb-5 w-full">
        <p className="text-xs text-slate-500 mb-2.5 font-medium">
          {filledSlots}/{team.maxSize} Players
        </p>
        <div className="flex flex-col gap-2">
          {/* Filled Slots - Show actual members with roles */}
          {team.members && team.members.map((member, i) => {
            // Role-based color palette
            const roleColors = {
              'Algorithm Master': { bg: 'from-blue-500 to-blue-600', border: 'border-blue-100', bgLight: 'from-blue-50 to-blue-50/50', badge: 'bg-blue-100 text-blue-700' },
              'Data Wizard': { bg: 'from-purple-500 to-purple-600', border: 'border-purple-100', bgLight: 'from-purple-50 to-purple-50/50', badge: 'bg-purple-100 text-purple-700' },
              'Code Ninja': { bg: 'from-emerald-500 to-emerald-600', border: 'border-emerald-100', bgLight: 'from-emerald-50 to-emerald-50/50', badge: 'bg-emerald-100 text-emerald-700' },
              'Debug Specialist': { bg: 'from-orange-500 to-orange-600', border: 'border-orange-100', bgLight: 'from-orange-50 to-orange-50/50', badge: 'bg-orange-100 text-orange-700' },
              'Performance Optimizer': { bg: 'from-pink-500 to-pink-600', border: 'border-pink-100', bgLight: 'from-pink-50 to-pink-50/50', badge: 'bg-pink-100 text-pink-700' },
              'System Architect': { bg: 'from-indigo-500 to-indigo-600', border: 'border-indigo-100', bgLight: 'from-indigo-50 to-indigo-50/50', badge: 'bg-indigo-100 text-indigo-700' },
            };
            const color = roleColors[member.role] || roleColors['Code Ninja'];

            return (
              <div
                key={member.id || i}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg bg-gradient-to-br ${color.bgLight} border ${color.border}`}
              >
                <div className={`w-7 h-7 rounded-full bg-gradient-to-br ${color.bg} flex items-center justify-center text-white font-semibold text-xs shadow-sm flex-shrink-0`}>
                  {member.name ? member.name.charAt(0).toUpperCase() : '?'}
                </div>
                <span className="text-sm font-medium text-slate-800 min-w-[80px]">{member.name}</span>
                <span className={`text-xs font-semibold ${color.badge ? color.badge.split(' ')[1] : ''}`}>
                  {member.role}
                </span>
                <div className="ml-auto flex items-center gap-2">
                  {member.name === 'You' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-blue-600 text-white shadow-sm">
                      YOU
                    </span>
                  )}
                  {member.isLeader && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-slate-900 text-white shadow-sm">
                      LEADER
                    </span>
                  )}
                </div>
              </div>
            );
          })}
          {/* Empty Slots */}
          {Array.from({ length: Math.max(0, emptySlots) }).map((_, i) => (
            <div
              key={`empty-${i}`}
              className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-slate-50/50 border border-slate-200/60 border-dashed"
            >
              <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center">
                <Users className="w-3.5 h-3.5 text-slate-400" strokeWidth={2} />
              </div>
              <span className="text-sm text-slate-400 font-medium">Empty slot</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions Footer */}
      <div className="mt-auto w-full flex items-center justify-between gap-3">
        <button
          onClick={() => onJoinTeam(team)}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all duration-200"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          Join Team
        </button>

        {/* Team Info */}
        <div className="flex items-center gap-2.5">
          {/* Capacity Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200">
            <Users className="w-3.5 h-3.5 text-slate-500" strokeWidth={2} />
            <span className="text-xs font-medium text-slate-700">
              {emptySlots} {emptySlots === 1 ? 'Slot' : 'Slots'} Left
            </span>
          </div>

          {/* Team Power Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-gradient-to-r from-indigo-50 via-purple-50 to-indigo-50 border border-indigo-200">
            <svg className="w-3.5 h-3.5 text-indigo-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
            </svg>
            <span className="text-xs font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
              {filledSlots * 25}% Power
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
