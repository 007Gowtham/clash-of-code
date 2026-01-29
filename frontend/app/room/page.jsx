'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import API from '@/lib/api/index';
import TeamCard from '@/components/room/waiting/teamcard';
import { Search, Plus, Users, Lock, Unlock, RefreshCw, LayoutGrid } from 'lucide-react';
import Modal from '@/components/common/Modal';
import { RoomForm, RoomJoin } from '@/components/room';
import RoomCreatedModal from '@/components/room/modals/RoomCreatedModal';
import { toast } from 'react-hot-toast';
import { PageTransition } from '@/components/common/PageTransition';

export default function RoomsPage() {
  const router = useRouter();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [showRoomCreatedModal, setShowRoomCreatedModal] = useState(false);
  const [createdRoom, setCreatedRoom] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'open', 'private'

  // Real API state
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [creatingRoom, setCreatingRoom] = useState(false);
  const [joiningRoom, setJoiningRoom] = useState(false);

  // Fetch rooms on mount
  useEffect(() => {
    fetchRooms();
  }, []);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await API.rooms.getAllRooms({ status: 'WAITING', limit: 50 });
      setRooms(response.rooms || []);
    } catch (err) {
      console.error('Fetch rooms error:', err);
      setError(err.message || 'Failed to load rooms');
    } finally {
      setLoading(false);
    }
  };

  // Create Room
  // Create Room
  const handleCreateRoom = async (formData) => {
    if (creatingRoom) return;

    try {
      const response = await API.rooms.createRoom({
        roomName: formData.roomName,
        mode: formData.mode,
        maxTeamSize: parseInt(formData.maxTeamSize),
        duration: parseInt(formData.duration),
        scoringMode: formData.scoringMode,
        difficulty: formData.difficulty,
        privacy: formData.privacy,
        password: formData.password || undefined,
        leaderApprovalRequired: formData.leaderApprovalRequired || false,
        allowSolosInTeamMode: formData.allowSolosInTeamMode || false
      });
      
      setCreatingRoom(true);
      setShowCreateModal(false);
      toast.success('Room created successfully!');

      // Immediate redirect to prevent confusion
      router.push(`/room/${response.id}/waiting`);
    } catch (error) {
      console.error('Create room error:', error);
      toast.error(error.message || 'Failed to create room');
      setCreatingRoom(false);
    }
  };

  const handleContinueToWaitingRoom = () => {
    if (createdRoom) {
      setShowRoomCreatedModal(false);
      router.push(`/room/${createdRoom.id}/waiting`);
    }
  };

  const handleJoinRoom = async (roomCode, password = '') => {
    try {
      setJoiningRoom(true);
      const response = await API.rooms.joinRoom(roomCode, password);
      setShowJoinModal(false);
      toast.success('Joined room successfully!');
      router.push(`/room/${response.room.id}/waiting`);
    } catch (error) {
      console.error('Join room error:', error);
      toast.error(error.message || 'Failed to join room');
    } finally {
      setJoiningRoom(false);
    }
  };

  const filteredRooms = rooms.filter(room => {
    const matchesSearch = room.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      room.code?.toLowerCase().includes(searchTerm.toLowerCase());
    const privacy = room.settings?.privacy || (room.hasPassword ? 'private' : 'public');

    if (filterMode === 'all') return matchesSearch;
    if (filterMode === 'open') return matchesSearch && privacy !== 'private';
    if (filterMode === 'private') return matchesSearch && privacy === 'private';
    return matchesSearch;
  });

  const FilterTab = ({ id, label, icon: Icon }) => (
    <button
      onClick={() => setFilterMode(id)}
      className={`relative px-4 py-2 rounded-lg text-sm font-medium transition-colors isolate ${filterMode === id ? 'text-gray-900' : 'text-gray-500 hover:text-gray-700'
        }`}
    >
      {filterMode === id && (
        <motion.div
          layoutId="activeFilter"
          className="absolute inset-0 bg-white shadow-sm border border-gray-200 rounded-lg -z-10"
          transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
        />
      )}
      <span className="flex items-center gap-2">
        {Icon && <Icon className="w-4 h-4" />}
        {label}
      </span>
    </button>
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <PageTransition className="max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Battle Arena</h1>
            <p className="text-gray-500 text-sm mt-1 font-medium">Join an active competition or start your own.</p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowJoinModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-sm font-bold hover:bg-gray-50 hover:border-gray-300 transition-all shadow-sm"
            >
              <Users className="w-4 h-4" />
              Join with Code
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-900/10"
            >
              <Plus className="w-4 h-4" />
              Create Room
            </button>
          </div>
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white/80 backdrop-blur-sm p-4 rounded-2xl border border-gray-200 shadow-sm mb-8 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-96 group">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
            <input
              type="text"
              placeholder="Search by room name or code..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 w-full transition-all text-gray-900 placeholder:text-gray-400 font-medium"
            />
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center p-1 bg-gray-100/50 rounded-xl border border-gray-200/50">
              <FilterTab id="all" label="All Rooms" icon={LayoutGrid} />
              <FilterTab id="open" label="Public" icon={Unlock} />
              <FilterTab id="private" label="Private" icon={Lock} />
            </div>

            <button
              onClick={fetchRooms}
              disabled={loading}
              className="p-2.5 bg-white border border-gray-200 rounded-xl text-gray-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50/50 transition-all shadow-sm active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
              title="Refresh List"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Room Grid */}
        <AnimatePresence mode='wait'>
          {loading ? (
            <motion.div
              key="loading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="h-full">
                  <TeamCard isLoading={true} />
                </div>
              ))}
            </motion.div>
          ) : error ? (
            <motion.div
              key="error"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300"
            >
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-red-100">
                <Users className="w-8 h-8 text-red-500" />
              </div>
              <h3 className="text-gray-900 font-bold text-lg mb-2">Failed to load rooms</h3>
              <p className="text-gray-500 text-sm mb-6">{error}</p>
              <button
                onClick={fetchRooms}
                className="px-6 py-2 bg-white border border-gray-300 rounded-lg text-sm hover:bg-gray-50 font-bold text-gray-700 shadow-sm transition-all active:scale-95"
              >
                Try Again
              </button>
            </motion.div>
          ) : filteredRooms.length === 0 ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-300"
            >
              <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-gray-900 font-bold text-lg mb-2">No rooms found</h3>
              <p className="text-gray-500 text-sm font-medium">Try adjusting your search or filters, or create a new room.</p>
            </motion.div>
          ) : (
            <motion.div
              key="grid"
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              <AnimatePresence>
                {filteredRooms.map((room) => (
                  <motion.div
                    key={room.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.3 }}
                  >
                    <TeamCard
                      id={room.id}
                      name={room.name}
                      leader={room.admin?.username || 'Unknown'}
                      members={room.totalParticipants || 0}
                      maxMembers={room.settings?.maxTeamSize * 10 || 10}
                      status={room.status === 'WAITING' ? ((room.settings?.privacy === 'private' || room.hasPassword) ? 'Locked' : 'Open') : room.status}
                      isUserTeam={false}
                      buttonLabel="Join Room"
                      onClick={() => {
                        if (room.settings?.privacy === 'private' || room.hasPassword) {
                          setShowJoinModal(true);
                        } else {
                          router.push(`/room/${room.id}/waiting`);
                        }
                      }}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </motion.div>
          )}
        </AnimatePresence>

      </PageTransition>

      {/* Modals remain unchanged */}
      <Modal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} title="Create New Room">
        <RoomForm onSubmit={handleCreateRoom} isLoading={creatingRoom} />
      </Modal>

      <Modal isOpen={showJoinModal} onClose={() => setShowJoinModal(false)} title="Join Private Room">
        <RoomJoin onJoin={handleJoinRoom} isLoading={joiningRoom} />
      </Modal>

      <RoomCreatedModal isOpen={showRoomCreatedModal} onClose={handleContinueToWaitingRoom} room={createdRoom} />

    </div>
  );
}
