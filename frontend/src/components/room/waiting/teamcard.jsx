'use client';

import { Plus, Users } from 'lucide-react';

const ROLE_MAP = {
  architect: { label: 'Architect', icon: '📐' },
  builder: { label: 'Builder', icon: '🛠️' },
  debugger: { label: 'Debugger', icon: '🐛' },
  optimiser: { label: 'Optimiser', icon: '⚡' },
};

export default function TeamCard({ team, onJoinTeam }) {
  const isPublic = team.visibility !== 'PRIVATE';
  const filledSlots = team.members ? team.members.length : 0;
  const emptySlots = (team.maxSize || 4) - filledSlots;

  return (
    <div className="flex flex-col items-start bg-white rounded-xl border border-slate-200/60 p-6 shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)] transition-all duration-300">
      {/* Header with Icon, Name, and Badge */}
      <div className="flex items-center justify-between w-full mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-lg flex items-center justify-center border border-slate-200/60 bg-gradient-to-br from-white via-slate-50 to-slate-100 shadow-[0_4px_8px_-2px_rgba(0,0,0,0.05),0_1px_0_inset_rgba(255,255,255,1)] shrink-0">
            {isPublic ? (
              <Users className="w-5 h-5 text-slate-700" strokeWidth={1.5} />
            ) : (
              <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            )}
          </div>
          <h3 className="text-xl font-bold text-slate-900 tracking-tight font-[family-name:var(--font-space)]">
            {team.name}
          </h3>
        </div>
        <span className={`px-2.5 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 font-[family-name:var(--font-inter)]`}>
          {isPublic ? 'Public' : 'Private'}
        </span>
      </div>

      {/* Player Slots - Restored Clean Design */}
      <div className="mb-5 w-full">
        <p className="text-xs text-slate-500 mb-2.5 font-bold uppercase tracking-wider font-[family-name:var(--font-inter)]">
          <span className="font-[family-name:var(--font-mono)] text-slate-700 text-sm">{filledSlots}/{(team.maxSize || 4)}</span> Players
        </p>
        <div className="flex flex-col gap-2">
          {/* Filled Slots */}
          {team.members && team.members.map((member, i) => {
            const roleInfo = ROLE_MAP[member.role] || { label: 'Engineer', icon: 'W' };
            return (
              <div
                key={member.id || i}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-slate-50 border border-slate-100"
              >
                <div className="w-7 h-7 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold font-[family-name:var(--font-mono)] text-xs shadow-sm flex-shrink-0">
                  {roleInfo.icon}
                </div>
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-slate-800 font-[family-name:var(--font-inter)] leading-none">{member.name}</span>
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tight mt-0.5">{roleInfo.label}</span>
                </div>

                <div className="ml-auto flex items-center gap-2">
                  {member.name === 'You' && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-600 text-white shadow-sm font-[family-name:var(--font-inter)] tracking-wide">
                      YOU
                    </span>
                  )}
                  {member.isLeader && (
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-900 text-white shadow-sm font-[family-name:var(--font-inter)] tracking-wide">
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
                <Plus className="w-3.5 h-3.5 text-slate-400" strokeWidth={2} />
              </div>
              <span className="text-sm text-slate-400 font-medium font-[family-name:var(--font-inter)]">Empty slot</span>
            </div>
          ))}
        </div>
      </div>

      {/* Actions Footer */}
      <div className="mt-auto w-full flex items-center justify-between gap-3">
        <button
          onClick={() => onJoinTeam(team)}
          disabled={emptySlots === 0}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 hover:text-slate-900 transition-all duration-200 font-[family-name:var(--font-inter)]"
        >
          <Plus className="w-4 h-4" strokeWidth={2} />
          Join Team
        </button>

        {/* Team Info */}
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 font-[family-name:var(--font-inter)]">
            <Users className="w-3.5 h-3.5 text-slate-500" strokeWidth={2} />
            <span className="text-xs font-semibold text-slate-700">
              {emptySlots} {emptySlots === 1 ? 'Slot' : 'Slots'} Left
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
