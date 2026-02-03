'use client';

import CreateTeamModal from '@/components/room/modals/CreateTeamModal';
import JoinTeamModal from '@/components/room/modals/JoinTeamModal';
import JoinViaCodeModal from '@/components/room/modals/JoinViaCodeModal';
import StatsOverview from '@/components/room/StatsOverview';
import TeamGrid from '@/components/room/waiting/TeamGrid';
import WorldMapBackground from '@/components/room/waiting/WorldMapBackground';
import { CheckCircle2, Clock, Plus, Search, Terminal, Trophy, Users } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';

export default function WaitingRoomPage() {
  const router = useRouter();
  const params = useParams();
  const roomId = params?.id;
  const [searchTerm, setSearchTerm] = useState('');

  // Modal states
  const [isCreateTeamModalOpen, setIsCreateTeamModalOpen] = useState(false);
  const [isJoinViaCodeModalOpen, setIsJoinViaCodeModalOpen] = useState(false);
  const [isJoinTeamModalOpen, setIsJoinTeamModalOpen] = useState(false);
  const [selectedTeam, setSelectedTeam] = useState(null);


  // Mock Data
  const [teams, setTeams] = useState([
    {
      id: 't1',
      name: 'Runtime Terror',
      maxSize: 3,
      members: [
        { id: 'u1', name: 'You', isLeader: true, isReady: true, role: 'Algorithm Master' },
        { id: 'u2', name: 'Alice', isLeader: false, isReady: true, role: 'Data Wizard' },
      ]
    },
    {
      id: 't2',
      name: 'Code Ninjas',
      maxSize: 3,
      members: [
        { id: 'u3', name: 'Bob', isLeader: true, isReady: true, role: 'Code Ninja' },
        { id: 'u4', name: 'Charlie', isLeader: false, isReady: false, role: 'Debug Specialist' },
        { id: 'u5', name: 'David', isLeader: false, isReady: true, role: 'Algorithm Master' },
      ]
    },
    {
      id: 't3',
      name: 'Bug Hunters',
      maxSize: 3,
      members: [
        { id: 'u6', name: 'Eve', isLeader: true, isReady: false, role: 'Data Wizard' },
        { id: 'u7', name: 'Frank', isLeader: false, isReady: false, role: 'Performance Optimizer' },
      ]
    },
    {
      id: 't4',
      name: 'Null Pointers',
      maxSize: 3,
      members: [
        { id: 'u8', name: 'Grace', isLeader: true, isReady: true, role: 'Code Ninja' },
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

  // Modal handlers
  const handleCreateTeam = async (data) => {
    console.log('Creating team:', data);
    // TODO: Implement API call
    setIsCreateTeamModalOpen(false);
  };

  const handleJoinViaCode = async (data) => {
    console.log('Joining via code:', data);
    // TODO: Implement API call
    setIsJoinViaCodeModalOpen(false);
  };

  const handleJoinTeam = (team) => {
    setSelectedTeam(team);
    setIsJoinTeamModalOpen(true);
  };

  const handleJoinTeamSubmit = async (teamId, code) => {
    console.log('Joining team:', teamId, 'with code:', code);
    // TODO: Implement API call
    setIsJoinTeamModalOpen(false);
    setSelectedTeam(null);
  };

  return (
    <div className="bg-white text-slate-900 min-h-screen flex flex-col relative antialiased font-sans overflow-hidden">

      {/* World Map Background with Text */}
      <WorldMapBackground />

      {/* Main Content - Positioned below map */}
      <main className="relative z-10 w-full mx-auto px-6 flex flex-col items-center" style={{ marginTop: '580px' }}>

        {/* Section Header */}
        <div className="w-full max-w-6xl mx-auto mb-8">
          <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3 mb-2 font-[family-name:var(--font-space)] tracking-tight">
            <span className="relative flex h-3 w-3">
              <span className="absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            Battle Lobby Status
          </h2>
          <p className="text-slate-500 text-sm ml-6 font-[family-name:var(--font-inter)]">Real-time statistics from the waiting room</p>
        </div>

        {/* Stats Overview */}
        <StatsOverview stats={stats} />

        {/* Team Actions Section */}
        <div className="w-full max-w-6xl mx-auto mb-12">
          {/* Catchy Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-2 font-[family-name:var(--font-space)] tracking-tight">
              Assemble Your Squad
            </h2>
            <p className="text-slate-500 font-[family-name:var(--font-inter)]">
              Create your own team or join forces with existing warriors
            </p>
          </div>

          {/* Search and Action Buttons */}
          <div className="w-full flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="relative group/search w-full max-w-6xl  sm:max-w-xs">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within/search:text-emerald-600 transition-colors" />
              <input
                type="text"
                placeholder="Search teams..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-300 transition-all shadow-sm font-[family-name:var(--font-inter)]"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full sm:w-auto">

              <button
                onClick={() => setIsJoinViaCodeModalOpen(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-semibold transition-all font-[family-name:var(--font-inter)]"
              >
                <Terminal className="w-5 h-5 text-slate-400" />
                <span>Join via Code</span>
              </button>
              <button
                onClick={() => {
                  console.log('Create Team clicked, opening modal...');
                  setIsCreateTeamModalOpen(true);
                }}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-semibold transition-all shadow-lg shadow-slate-900/10 font-[family-name:var(--font-inter)]"
              >
                <Plus className="w-5 h-5" />
                <span>Create Team</span>
              </button>
            </div>
          </div>
        </div>

        {/* Team Cards Grid */}
        <TeamGrid teams={teams} onJoinTeam={handleJoinTeam} />
      </main>

      {/* Modals */}
      <CreateTeamModal
        isOpen={isCreateTeamModalOpen}
        onClose={() => setIsCreateTeamModalOpen(false)}
        onCreate={handleCreateTeam}
        isLoading={false}
      />

      <JoinViaCodeModal
        isOpen={isJoinViaCodeModalOpen}
        onClose={() => setIsJoinViaCodeModalOpen(false)}
        onJoin={handleJoinViaCode}
        isLoading={false}
      />

      <JoinTeamModal
        isOpen={isJoinTeamModalOpen}
        onClose={() => {
          setIsJoinTeamModalOpen(false);
          setSelectedTeam(null);
        }}
        selectedTeam={selectedTeam}
        onJoin={handleJoinTeamSubmit}
        isLoading={false}
      />
    </div>
  );
}
