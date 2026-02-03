'use client';
import { cn } from "@/lib/utils";

import Modal from '@/components/common/Modal';
import { RoomForm, RoomJoin } from '@/components/room';
import RoomCreatedModal from '@/components/room/modals/RoomCreatedModal';
import RoomGrid from '@/components/room/RoomGrid';
import RoomHeader from '@/components/room/RoomHeader';
import StatsOverview from '@/components/room/StatsOverview';
import { InteractiveGridPattern } from '@/components/ui/interactive-grid-pattern';
import {
  Globe,
  LayoutGrid,
  Lock,
  Plus,
  Search,
  Terminal,
  Users,
  Zap
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'react-hot-toast';

// Mock Data
const MOCK_ROOMS = [
  {
    id: '1',
    name: 'Casual Coding',
    code: 'CODE123',
    admin: { username: 'dev_king' },
    totalParticipants: 3,
    status: 'WAITING',
    settings: { maxTeamSize: 4, privacy: 'public', difficulty: 'Easy' },
    hasPassword: false
  },
  {
    id: '2',
    name: 'Algorithm Battle',
    code: 'ALGO456',
    admin: { username: 'algo_master' },
    totalParticipants: 8,
    status: 'WAITING',
    settings: { maxTeamSize: 5, privacy: 'private', difficulty: 'Hard' },
    hasPassword: true
  },
  {
    id: '3',
    name: 'Friday Night Code',
    code: 'FNC789',
    admin: { username: 'react_fan' },
    totalParticipants: 12,
    status: 'PLAYING',
    settings: { maxTeamSize: 4, privacy: 'public', difficulty: 'Medium' },
    hasPassword: false
  },
  {
    id: '4',
    name: 'Dynamic Programming',
    code: 'DP2024',
    admin: { username: 'dp_wizard' },
    totalParticipants: 2,
    status: 'WAITING',
    settings: { maxTeamSize: 2, privacy: 'public', difficulty: 'Hard' },
    hasPassword: false
  }
];

export default function RoomsPage() {
  const router = useRouter();

  // State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showRoomCreatedModal, setShowRoomCreatedModal] = useState(false);
  const [createdRoom, setCreatedRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'public', 'private'

  // Data State
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [joiningRoom, setJoiningRoom] = useState(false);

  // Fetch Rooms
  useEffect(() => {
    const fetchRooms = async () => {
      setLoading(true);
      // Simulate API call
      setTimeout(() => {
        setRooms(MOCK_ROOMS);
        setLoading(false);
      }, 800);
    };
    fetchRooms();
  }, []);

  // Handlers
  const handleCreateRoom = async (formData) => {
    if (creatingRoom) return;
    try {
      setCreatingRoom(true);
      // Simulate API call
      setTimeout(() => {
        const newRoom = {
          id: Date.now().toString(),
          name: formData.roomName,
          code: 'NEWROOM',
          admin: { username: 'you' },
          totalParticipants: 1,
          status: 'WAITING',
          settings: {
            maxTeamSize: parseInt(formData.maxTeamSize),
            privacy: formData.privacy,
            difficulty: formData.difficulty
          },
          hasPassword: !!formData.password
        };

        setCreatedRoom(newRoom);
        setRooms(prev => [newRoom, ...prev]);
        setShowCreateModal(false);
        toast.success('Room created successfully (Mock)!');
        setCreatingRoom(false);
        // router.push(`/room/${newRoom.id}/waiting`); // Optional: redirect immediately
      }, 1500);
    } catch (error) {
      console.error(error);
      setCreatingRoom(false);
    }
  };

  const handleJoinRoom = async (roomCode, password = '') => {
    try {
      setJoiningRoom(true);
      setTimeout(() => {
        setShowJoinModal(false);
        toast.success('Joined room successfully (Mock)!');
        router.push(`/room/mock-room-id/waiting`);
        setJoiningRoom(false);
      }, 1500);
    } catch (error) {
      console.error(error);
      setJoiningRoom(false);
    }
  };

  const handleContinueToWaitingRoom = () => {
    if (createdRoom) {
      setShowRoomCreatedModal(false);
      router.push(`/room/${createdRoom.id}/waiting`);
    }
  };

  // Filter Logic
  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const isPrivate = room.settings?.privacy === 'private' || room.hasPassword;

    if (filterMode === 'all') return matchesSearch;
    if (filterMode === 'public') return matchesSearch && !isPrivate;
    if (filterMode === 'private') return matchesSearch && isPrivate;
    return matchesSearch;
  });

  // Stats Logic
  const getStats = () => {
    if (loading) return [
      { label: 'Loading...', value: '-', icon: LayoutGrid },
      { label: 'Loading...', value: '-', icon: Zap, highlighted: true },
      { label: 'Loading...', value: '-', icon: Globe },
      { label: 'Loading...', value: '-', icon: Lock },
    ];

    if (filterMode === 'all') {
      return [
        { label: 'Total Rooms', value: rooms.length, icon: LayoutGrid },
        { label: 'Live Battles', value: rooms.filter(r => r.status === 'PLAYING').length, icon: Zap, highlighted: true },
        { label: 'Public Rooms', value: rooms.filter(r => r.settings.privacy === 'public').length, icon: Globe },
        { label: 'Private Rooms', value: rooms.filter(r => r.settings.privacy === 'private').length, icon: Lock },
      ];
    }

    // Filter-specific stats
    const filtered = rooms.filter(r => {
      const isPrivate = r.settings?.privacy === 'private' || r.hasPassword;
      if (filterMode === 'public') return !isPrivate;
      if (filterMode === 'private') return isPrivate;
      return true;
    });

    return [
      { label: 'Visible Rooms', value: filtered.length, icon: LayoutGrid },
      { label: 'Live Now', value: filtered.filter(r => r.status === 'PLAYING').length, icon: Zap, highlighted: true },
      { label: 'Open', value: filtered.filter(r => r.totalParticipants < r.settings.maxTeamSize).length, icon: Globe },
      { label: 'Full', value: filtered.filter(r => r.totalParticipants >= r.settings.maxTeamSize).length, icon: Users },
    ];
  };

  const stats = getStats();

  return (
    <>
      <div className="bg-white  text-slate-900 min-h-screen flex flex-col relative antialiased font-sans overflow-hidden">

        {/* Background Grid */}
        <InteractiveGridPattern
          className={cn(
            "absolute inset-0 top-0 h-[600px] z-0",

            "[mask-image:linear-gradient(to_bottom,black_30%,transparent_100%),linear-gradient(to_right,transparent_0%,black_20%,black_80%,transparent_100%)]",
            "[-webkit-mask-image:linear-gradient(to_bottom,black_30%,transparent_100%),linear-gradient(to_right,transparent_0%,black_20%,black_80%,transparent_100%)]",
            "[mask-composite:intersect]",
            "[-webkit-mask-composite:source-in]"
          )}
          width={50}
          height={50}
          squares={[80, 80]}
          squaresClassName="hover:fill-blue-400/60 transition-all duration-500"
        />

        {/* Radial Gradient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-4xl h-[600px] bg-[radial-gradient(closest-side,rgba(16,185,129,0.08),transparent)] pointer-events-none z-0"></div>

        {/* Main Content */}
        <main className="relative z-10 w-full max-w-5xl mx-auto px-6 pt-32 pb-24 flex flex-col items-center">

          {/* Header */}
          <RoomHeader
            title="Clash Of Code"
            description="Join active competitions or start your own."
          />

          {/* Filter Pills (OS Selector Style) */}
          <nav className="flex flex-wrap justify-center gap-4 mb-20">
            <FilterPill
              active={filterMode === 'all'}
              onClick={() => setFilterMode('all')}
              icon={LayoutGrid}
              label="All Rooms"
            />
            <FilterPill
              active={filterMode === 'public'}
              onClick={() => setFilterMode('public')}
              icon={Globe}
              label="Public"
            />
            <FilterPill
              active={filterMode === 'private'}
              onClick={() => setFilterMode('private')}
              icon={Lock}
              label="Private"
            />
          </nav>
          <div className="w-full max-w-6xl mx-auto px-4 mb-8">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3 font-[family-name:var(--font-space)] tracking-tight">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </span>
              Arena Pulse
            </h2>
            <p className="text-slate-500 text-sm mt-1 ml-6 font-[family-name:var(--font-inter)]">Real-time statistics from active battlegrounds.</p>
          </div>
          {/* Stats Dashboard */}
          <StatsOverview stats={stats} />
          <div className="w-full max-w-6xl mx-auto px-4 mb-8">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-3 font-[family-name:var(--font-space)] tracking-tight">
              Find Your Battle
            </h2>
            <p className="text-slate-500 text-sm mt-1 font-[family-name:var(--font-inter)]">Join an existing room or create your own.</p>
          </div>

          {/* Actions & Room Grid */}
          <div className="w-full max-w-6xl mx-auto px-4 mb-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            {/* Search */}
            <div className="relative group/search">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within/search:text-emerald-600 transition-colors" />
              <input
                type="text"
                placeholder="Search rooms..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-700 placeholder:text-slate-400 focus:outline-none focus:border-slate-300 focus:ring-1 focus:ring-slate-300 transition-all shadow-sm"
              />
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 w-full sm:w-auto">
              <button
                onClick={() => setShowJoinModal(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 font-medium transition-all"
              >
                <Terminal className="w-5 h-5 text-slate-400" />
                <span>Join via Code</span>
              </button>
              <button
                onClick={() => setShowCreateModal(true)}
                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-slate-900 text-white hover:bg-slate-800 font-medium transition-all shadow-lg shadow-slate-900/10"
              >
                <Plus className="w-5 h-5" />
                <span>Create Room</span>
              </button>
            </div>
          </div>

          {/* Room Cards Grid */}
          <RoomGrid
            rooms={filteredRooms}
            onJoin={(room) => {
              if (room.settings?.privacy === 'private' || room.hasPassword) {
                setShowJoinModal(true);
              } else {
                router.push(`/room/${room.id}/waiting`);
              }
            }}
          />

        </main>

        {/* Modals */}
        <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Room" maxWidth="max-w-xl">
          <RoomForm onSubmit={handleCreateRoom} isLoading={creatingRoom} />
        </Modal>

        <Modal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} title="Join Private Room" maxWidth="max-w-md">
          <RoomJoin onJoin={handleJoinRoom} isLoading={joiningRoom} />
        </Modal>

        <RoomCreatedModal isOpen={showRoomCreatedModal} onClose={handleContinueToWaitingRoom} room={createdRoom} />

      </div>
    </>
  );
}

// Helper Components

function FilterPill({ active, onClick, icon: Icon, label }) {
  if (active) {
    return (
      <button
        onClick={onClick}
        className="group flex items-center gap-3 bg-slate-900 text-white px-6 py-3 rounded-full shadow-xl shadow-slate-900/10 hover:shadow-slate-900/20 transition-all duration-200"
      >
        <Icon className="w-5 h-5 text-white" />
        <span className="text-base font-medium">{label}</span>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className="group flex items-center gap-3 bg-white text-slate-600 border border-slate-200 px-6 py-3 rounded-full hover:border-slate-300 hover:bg-slate-50 transition-all duration-200"
    >
      <Icon className="w-5 h-5 text-current" />
      <span className="text-base font-medium">{label}</span>
    </button>
  );
}


