'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import API from '@/lib/api/index';
import Navbar from '@/components/room/waiting/navbar';
import ContestHeader from '@/components/room/waiting/contestHeader';
import TeamsGrid from '@/components/room/waiting/teamsGrid';
import TeamSidebar from '@/components/room/waiting/teamSidebar';
import JoinTeamModal from '@/components/room/modals/JoinTeamModal';
import Modal from '@/components/common/Modal';
import Input from '@/components/common/Input';
import Button from '@/components/common/Button';
import Toggle from '@/components/common/Toggle';
import { Users, Lock, Unlock } from 'lucide-react';
import { useAuth } from '@/lib/api/hooks';
import { toast } from 'react-hot-toast';
import useNavigationGuard from '@/hooks/useNavigationGuard';
import { PageTransition } from '@/components/common/PageTransition';

export default function WaitingRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.id;
  const { user } = useAuth();

  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Real API state
  const [teamsData, setTeamsData] = useState({ teams: [] });
  const [teamsLoading, setTeamsLoading] = useState(true);
  const [creatingTeam, setCreatingTeam] = useState(false);
  const [joiningTeam, setJoiningTeam] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [roomDeleted, setRoomDeleted] = useState(false);

  // Forms
  const [createTeamData, setCreateTeamData] = useState({ name: '', isPublic: true });
  const [selectedTeam, setSelectedTeam] = useState(null);

  // Fetch teams on mount and poll for updates
  // Ref to track active fetch
  const isFetchingRef = useRef(false);

  const fetchTeams = useCallback(async () => {
    if (roomDeleted || isFetchingRef.current || (typeof document !== 'undefined' && document.hidden)) return;

    try {
      isFetchingRef.current = true;
      const response = await API.teams.getTeamsInRoom(roomId);
      setTeamsData(response);
    } catch (error) {
      // If room not found (404)
      if (error.message && error.message.includes('not found')) {
        if (!roomDeleted) {
          setRoomDeleted(true);
          toast.error('Room has been deleted by the admin');
          setTimeout(() => {
            router.push('/room');
          }, 2000);
        }
        return;
      }

      // Don't show error toast for rate limit or timeouts
      if (error.message && !error.message.includes('Too many requests') && !error.message.includes('timed out')) {
        console.error('Fetch teams error:', error);
      }
    } finally {
      setTeamsLoading(false);
      setRefreshing(false);
      isFetchingRef.current = false;
    }
  }, [roomId, roomDeleted, router]);

  // Fetch teams on mount and poll for updates
  useEffect(() => {
    if (roomId) {
      fetchTeams();

      // Poll every 5 seconds (increased from 3s to prevent timeouts)
      const interval = setInterval(fetchTeams, 5000);
      return () => clearInterval(interval);
    }
  }, [roomId, fetchTeams]);

  // Manual refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchTeams();
  };

  // Fetch room details to check if user is admin
  const [roomDetails, setRoomDetails] = useState(null);

  useEffect(() => {
    if (roomDeleted) return; // Don't poll if room is already deleted

    const fetchRoomDetails = async () => {
      if (!roomId || roomDeleted) return;
      try {
        const response = await API.rooms.getRoomDetails(roomId);
        setRoomDetails(response);
      } catch (error) {
        // If room not found, it was deleted by admin
        if (error.message && error.message.includes('not found')) {
          setRoomDeleted(true); // Mark as deleted to stop polling
          toast.error('Room has been deleted by the admin');
          setTimeout(() => {
            router.push('/room');
          }, 2000);
        } else {
          console.error('Failed to fetch room details:', error);
        }
      }
    };

    fetchRoomDetails();

    // Poll room status every 3 seconds to detect start/deletion (faster updates)
    const interval = setInterval(fetchRoomDetails, 3000);
    return () => clearInterval(interval);
  }, [roomId, router, roomDeleted]);

  const isAdmin = roomDetails?.isAdmin || false;

  // Detect user's team and auto-show sidebar
  const userTeam = teamsData?.teams?.find(team => team.isMember);
  const hasTeam = !!userTeam;

  // Auto-redirect to Team Battle page when room starts
  useEffect(() => {
    if (roomDetails?.status === 'ACTIVE' && userTeam?.id) {
      router.push(`/room/${roomId}/${userTeam.id}/code-editor`);
    }
  }, [roomDetails?.status, userTeam?.id, roomId, router]);

  // Track previous team to detect involuntary removal (kicks)
  const prevTeamIdRef = useRef(null);
  const isLeavingRef = useRef(false);

  // Monitor team membership changes
  useEffect(() => {
    if (teamsLoading) return;

    const currentTeamId = userTeam?.id;

    // Check if user was removed from team (Had team -> No team)
    if (prevTeamIdRef.current && !currentTeamId) {
      // If not voluntarily leaving, it was a kick/delete
      if (!isLeavingRef.current) {
        toast.error('You have been removed from the team');
        setIsSidebarOpen(false);
      }
    }

    prevTeamIdRef.current = currentTeamId;
  }, [userTeam, teamsLoading]);

  // Leave team handler
  const handleLeaveTeam = async () => {
    if (!userTeam) return;

    try {
      isLeavingRef.current = true;
      await API.teams.leaveTeam(userTeam.id);
      toast.success('Left team successfully');
      setIsSidebarOpen(false);

      // Refetch teams
      await fetchTeams();
    } catch (error) {
      console.error('Leave team error:', error);
      toast.error(error.message || 'Failed to leave team');
    } finally {
      // Small delay to ensure render cycle completes before unblocking
      setTimeout(() => { isLeavingRef.current = false; }, 500);
    }
  };

  // Kick member handler
  const handleKickMember = async (userId) => {
    if (!userTeam) return;

    try {
      await API.teams.kickMember(userTeam.id, userId);
      toast.success('Member removed successfully');

      // Refetch teams
      await fetchTeams();
    } catch (error) {
      console.error('Kick member error:', error);
      toast.error(error.message || 'Failed to remove member');
    }
  };

  // Delete room handler (admin only)
  const handleDeleteRoom = async () => {
    try {
      await API.rooms.deleteRoom(roomId);
      toast.success('Room deleted successfully');
    } catch (error) {
      console.error('Delete room error:', error);
      toast.error(error.message || 'Failed to delete room');
      throw error; // Re-throw to prevent navigation
    }
  };

  // Navigation guard - prevents accidental navigation
  const { LeaveConfirmationModal, handleNavigateAway } = useNavigationGuard({
    hasTeam,
    isAdmin,
    onLeaveTeam: handleLeaveTeam,
    onDeleteRoom: handleDeleteRoom,
    roomId,
  });

  // Auto-show/hide sidebar based on team status
  useEffect(() => {
    if (userTeam) {
      if (!isSidebarOpen) setIsSidebarOpen(true);
    } else {
      // Auto-close sidebar if user is not in a team (and not currently performing actions)
      if (isSidebarOpen && !creatingTeam && !joiningTeam) {
        setIsSidebarOpen(false);
      }
    }
  }, [userTeam, isSidebarOpen, creatingTeam, joiningTeam]);

  const handleTeamClick = async (team) => {
    // If it's user's team, show sidebar
    if (team.isMember) {
      setIsSidebarOpen(true);
      return;
    }

    // Check if team is full
    const currentMembers = team.membersCount || 0;
    const maxMembers = 4; // Default max

    if (currentMembers >= maxMembers) {
      toast.error('This team is full');
      return;
    }

    // If Public, direct join
    if (team.visibility === 'PUBLIC') {
      await handleJoinTeam(team.id, null, team);
      return;
    }

    // For PRIVATE teams, show join modal
    setSelectedTeam(team);
    setShowJoinModal(true);
  };

  const handleCloseSidebar = () => {
    setIsSidebarOpen(false);
  };

  const handleCreateTeamSubmit = async (e) => {
    e.preventDefault();

    // Check if user already has a team
    if (hasTeam) {
      toast.error('You are already in a team. Leave your current team first.');
      setShowCreateModal(false);
      return;
    }

    try {
      setCreatingTeam(true);

      const response = await API.teams.createTeam({
        name: createTeamData.name,
        roomId: roomId,
        visibility: createTeamData.isPublic ? 'PUBLIC' : 'PRIVATE'
      });

      setShowCreateModal(false);

      // Show team code for private teams
      if (response.code) {
        toast.success(`Team created! Code: ${response.code}`, {
          duration: 6000,
          style: {
            background: '#10b981',
            color: '#fff',
            fontSize: '16px',
            fontWeight: 'bold'
          }
        });
      } else {
        toast.success('Team created successfully!');
      }

      // Refetch teams
      await fetchTeams();

      // Sidebar will auto-open when refetch completes
    } catch (error) {
      console.error('Create team error:', error);
      toast.error(error.message || 'Failed to create team');
    } finally {
      setCreatingTeam(false);
    }
  };

  const handleJoinTeam = async (teamId, code, teamOverride = null) => {
    try {
      setJoiningTeam(true);
      const targetTeam = teamOverride || selectedTeam;
      if (!targetTeam) return;

      const payload = code ? { code } : {};

      await API.teams.joinTeam(teamId, payload);

      setShowJoinModal(false);
      toast.success(`Joined ${targetTeam.name}!`);

      // Refetch teams
      await fetchTeams();

      // Sidebar will auto-open when refetch completes
    } catch (error) {
      console.error('Join team error:', error);
      toast.error(error.message || 'Invalid team code or team is full');
    } finally {
      setJoiningTeam(false);
    }
  };

  const handleStartRoom = async () => {
    try {
      await API.rooms.startRoom(roomId);
      toast.success('Battle started!');

      // Immediate redirect for leader
      if (userTeam?.id) {
        router.push(`/room/${roomId}/${userTeam.id}/code-editor`);
      } else {
        // If admin/spectator, update local state to trigger any other effects
        setRoomDetails(prev => ({ ...prev, status: 'ACTIVE' }));
      }
    } catch (error) {
      console.error('Start room error:', error);
      toast.error(error.message || 'Failed to start room');
    }
  };

  return (
    <div className="h-screen flex flex-col overflow-hidden">
      <Navbar onExitRoom={() => handleNavigateAway('/room')} />
      <div className="flex flex-1 overflow-hidden relative">
        <main className="flex-1 flex flex-col min-w-0 bg-gray-50/50 overflow-hidden">
          <PageTransition className="flex flex-col h-full">
            <ContestHeader
              onRefresh={handleRefresh}
              isRefreshing={refreshing}
              isAdmin={isAdmin}
              onStartRoom={handleStartRoom}
              room={roomDetails}
            />
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8">
              <TeamsGrid
                teams={teamsData?.teams || []}
                isLoading={teamsLoading}
                onTeamClick={handleTeamClick}
                onCreateTeam={() => setShowCreateModal(true)}
                hasTeam={hasTeam}
              />
            </div>
          </PageTransition>
        </main>

        {/* Sidebar with slide animation */}
        <div className={`fixed inset-y-0 right-0 z-50 transition-transform duration-500 ease-in-out ${isSidebarOpen ? 'translate-x-0' : 'translate-x-full'
          }`} style={{ top: '56px' }}>
          <TeamSidebar
            onClose={handleCloseSidebar}
            onLeaveTeam={handleLeaveTeam}
            onKickMember={handleKickMember}
            team={userTeam}
            currentUser={user}
            roomId={roomId}
            isAdmin={isAdmin}
            onStartRoom={handleStartRoom}
          />
        </div>

        {/* Backdrop */}
        {isSidebarOpen && (
          <div
            className="fixed inset-0 bg-black/20 z-40 transition-opacity duration-500"
            onClick={handleCloseSidebar}
            style={{ top: '56px' }}
          />
        )}
      </div>

      {/* Create Team Modal */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Team"
      >
        <form onSubmit={handleCreateTeamSubmit} className="space-y-6">
          <Input
            label="Team Name"
            placeholder="Ex: Runtime Terror"
            value={createTeamData.name}
            onChange={(e) => setCreateTeamData({ ...createTeamData, name: e.target.value })}
            required
          />

          <div className="space-y-4">
            <Toggle
              label={createTeamData.isPublic ? "Public Team" : "Private Team"}
              description={createTeamData.isPublic ? "Anyone can join directly." : "Requires team code to join."}
              checked={createTeamData.isPublic}
              onChange={(checked) => setCreateTeamData({ ...createTeamData, isPublic: checked })}
            />
          </div>

          {!createTeamData.isPublic && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100 flex items-start gap-3">
              <Lock className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-blue-800">Private Team</p>
                <p className="text-xs text-blue-600 mt-1">You'll receive a team code to share with members.</p>
              </div>
            </div>
          )}

          <Button type="submit" isLoading={creatingTeam} className="w-full">
            Create Team
          </Button>
        </form>
      </Modal>


      {/* Join Team Modal - New unified modal for all teams */}
      <JoinTeamModal
        isOpen={showJoinModal}
        onClose={() => setShowJoinModal(false)}
        selectedTeam={selectedTeam}
        onJoin={handleJoinTeam}
        isLoading={joiningTeam}
      />

      {/* Navigation Guard Modal */}
      <LeaveConfirmationModal />

    </div>
  );
}
