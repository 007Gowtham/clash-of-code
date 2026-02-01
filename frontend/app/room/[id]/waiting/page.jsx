'use client';

import StatsOverview from '@/components/room/StatsOverview';
import WorldMapBackground from '@/components/room/waiting/WorldMapBackground';
import { CheckCircle2, Clock, Trophy, Users } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function WaitingRoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params?.id;

  // Mock Data
  const [teams, setTeams] = useState([
    {
      id: 't1',
      name: 'Runtime Terror',
      maxSize: 3,
      members: [
        { id: 'u1', name: 'You', isLeader: true, isReady: true },
        { id: 'u2', name: 'Alice', isLeader: false, isReady: true },
      ]
    },
    {
      id: 't2',
      name: 'Code Ninjas',
      maxSize: 3,
      members: [
        { id: 'u3', name: 'Bob', isLeader: true, isReady: true },
        { id: 'u4', name: 'Charlie', isLeader: false, isReady: false },
        { id: 'u5', name: 'David', isLeader: false, isReady: true },
      ]
    },
    {
      id: 't3',
      name: 'Bug Hunters',
      maxSize: 3,
      members: [
        { id: 'u6', name: 'Eve', isLeader: true, isReady: false },
        { id: 'u7', name: 'Frank', isLeader: false, isReady: false },
      ]
    },
    {
      id: 't4',
      name: 'Null Pointers',
      maxSize: 3,
      members: [
        { id: 'u8', name: 'Grace', isLeader: true, isReady: true },
      ]
    }
  ]);

  // Calculate stats
  const totalParticipants = teams.reduce((sum, team) => sum + team.members.length, 0);
  const totalReady = teams.reduce((sum, team) =>
    sum + team.members.filter(m => m.isReady).length, 0
  );
  const activeTeams = teams.filter(team => team.members.length > 0).length;

  const stats = [
    { label: 'Active Teams', value: activeTeams, icon: Users },
    { label: 'Total Players', value: totalParticipants, icon: Trophy },
    { label: 'Ready', value: totalReady, icon: CheckCircle2, highlighted: true },
    { label: 'Waiting', value: totalParticipants - totalReady, icon: Clock },
  ];

  return (
    <div className="bg-white text-slate-900 min-h-screen flex flex-col relative antialiased font-sans overflow-hidden">

      {/* World Map Background with Text */}
      <WorldMapBackground />

      {/* Main Content - Positioned below map */}
      <main className="relative z-10 w-full mx-auto px-6 flex flex-col items-center" style={{ marginTop: '580px' }}>

        {/* Section Header */}
        <div className="w-full max-w-6xl mx-auto mb-8">
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-3 mb-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            Battle Lobby Status
          </h2>
          <p className="text-slate-500 text-sm ml-6">Real-time statistics from the waiting room</p>
        </div>

        {/* Stats Overview */}
        <StatsOverview stats={stats} />

      </main>
    </div>
  );
}
