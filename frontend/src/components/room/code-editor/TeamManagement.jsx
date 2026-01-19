'use client';

import { Trophy, CheckCircle, Clock, User, Check, X, Crown, Zap } from 'lucide-react';
import Button from '@/components/common/Button';

export default function TeamManagement({
  isLeader,
  teamMembers = [],
  leaderId,
  currentUserId,
  questionAssignments = {},
  pendingRequests = [],
  onAssignQuestion,
  onRejectQuestion
}) {
  const getAvatarColor = (name) => {
    if (!name) return 'bg-gray-400';
    const colors = [
      'bg-blue-500', 'bg-emerald-500', 'bg-violet-500',
      'bg-pink-500', 'bg-indigo-500', 'bg-orange-500'
    ];
    let hash = 0;
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash);
    }
    return colors[Math.abs(hash) % colors.length];
  };

  const getInitials = (name) => {
    if (!name) return '?';
    return name.substring(0, 2).toUpperCase();
  };

  const getAssignedQuestion = (userId) => {
    // Find assignment for this user in questionAssignments object
    // questionAssignments is { questionId: { userId, username, ... } }
    const assignment = Object.entries(questionAssignments).find(([qid, data]) => data.userId === userId);
    if (!assignment) return null;
    return assignment[1].questionTitle || `Question ${assignment[0]}`; // Use title or ID
  };

  return (
    <div className="h-full flex flex-col overflow-hidden bg-gray-50/50">
      {/* Team Members List */}
      <div className="flex-1 overflow-y-auto custom-scrollbar px-4 pb-4 space-y-3">
        <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider px-1 mb-2 mt-4">Squad Members</h3>
        {teamMembers.map((member) => {
          const assignedQuestion = getAssignedQuestion(member.userId);
          const isMe = member.userId === currentUserId;
          const isMembersLeader = member.userId === leaderId;
          const displayName = member.username || member.name || 'Unknown User';

          return (
            <div
              key={member.userId}
              className={`bg-white border rounded-xl p-3 shadow-sm transition-all group ${isMe ? 'border-blue-200 ring-1 ring-blue-100' : 'border-gray-200 hover:shadow-md hover:border-blue-200'}`}
            >
              <div className="flex items-center gap-3 mb-3">
                <div className="relative">
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={displayName}
                      className="w-10 h-10 rounded-full ring-2 ring-gray-100"
                    />
                  ) : (
                    <div className={`w-10 h-10 rounded-full text-white flex items-center justify-center text-sm font-bold ring-2 ring-gray-100 ${getAvatarColor(displayName)}`}>
                      {displayName ? getInitials(displayName) : <User className="w-5 h-5" />}
                    </div>
                  )}
                  {isMembersLeader && (
                    <div className="absolute -top-1 -right-1 bg-white p-0.5 rounded-full ring-1 ring-gray-100 shadow-sm">
                      <Crown className="w-3 h-3 text-amber-500 fill-amber-500" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-gray-900 truncate flex items-center gap-2">
                      {displayName}
                      {isMe && <span className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded font-medium">You</span>}
                    </h4>
                    <div className="flex items-center gap-1.5 bg-gray-50 px-2 py-0.5 rounded-md border border-gray-100">
                      <Zap className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                      <span className="text-xs font-bold text-gray-700">{member.points || 0}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[10px] bg-emerald-50 text-emerald-700 px-1.5 py-0.5 rounded-md font-semibold border border-emerald-100 flex items-center gap-1">
                      <CheckCircle className="w-2.5 h-2.5" />
                      {member.solved || 0} Solved
                    </span>
                  </div>
                </div>
              </div>

              {assignedQuestion ? (
                <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-2.5 flex items-start gap-2.5">
                  <div className="mt-0.5 p-1 bg-blue-100 rounded-md">
                    <Clock className="w-3 h-3 text-blue-600" />
                  </div>
                  <div>
                    <p className="text-[10px] text-blue-500 font-bold uppercase tracking-wide mb-0.5">Current Task</p>
                    <p className="text-xs font-semibold text-blue-900 leading-tight line-clamp-1">{assignedQuestion}</p>
                  </div>
                </div>
              ) : (
                <div className="bg-gray-50 border border-gray-100 rounded-lg p-2 text-center flex items-center justify-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-gray-300"></div>
                  <p className="text-xs text-gray-400 font-medium">Idle - Ready to assign</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Pending Requests (Leader Only) */}
      {isLeader && pendingRequests.length > 0 && (
        <div className="border-t border-amber-200 bg-amber-50 p-4">
          <h4 className="text-xs font-bold text-amber-900 mb-3 uppercase tracking-wide flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
            Pending Requests ({pendingRequests.length})
          </h4>
          <div className="space-y-2">
            {pendingRequests.map((request) => (
              <div
                key={request.id}
                className="bg-white border border-amber-200 rounded-xl p-3 shadow-sm"
              >
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center">
                    <User className="w-3 h-3 text-gray-500" />
                  </div>
                  <span className="text-sm font-bold text-gray-900">{request.requesterName || 'Teammate'}</span>
                </div>
                <div className="text-xs text-gray-600 mb-3 bg-gray-50 p-2 rounded-lg border border-gray-100">
                  <span className="font-semibold text-gray-500">Requested:</span> {request.questionTitle || `Question ${request.questionId}`}
                </div>
                <div className="flex gap-2">
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={() => onAssignQuestion(request.questionId, request.requesterId, request.id)}
                    className="flex-1 text-[10px] bg-black text-white h-7 !p-0"
                  >
                    <Check className="w-3 h-3 mr-1" />
                    Approve
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onRejectQuestion(request.questionId, request.requesterId, request.id)}
                    className="flex-1 text-[10px] h-7 text-gray-500 hover:text-red-500 hover:bg-red-50 !p-0"
                  >
                    <X className="w-3 h-3 mr-1" />
                    Deny
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
