'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { useAuth, useLogout, useCurrentUser } from '@/lib/api/hooks';
import { useCreateRoom, useJoinRoom, useRooms } from '@/lib/api/hooks';
import Button from '@/components/common/Button';
import { Star, Lock } from 'lucide-react';
import Modal from '@/components/common/Modal';
import RoomForm from '@/components/room/RoomForm';
import RoomJoin from '@/components/room/RoomJoin';

export default function DashboardPage() {
    const router = useRouter();
    const { isAuthenticated, user: cachedUser } = useAuth();
    const { logout } = useLogout();
    const { execute: getCurrentUser, data: userData, loading: userLoading } = useCurrentUser();
    const { data: roomsData, loading: roomsLoading, refetch: refetchRooms } = useRooms({ status: 'WAITING', limit: 6 });

    const [mounted, setMounted] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showJoinModal, setShowJoinModal] = useState(false);

    const { execute: createRoom, loading: creatingRoom } = useCreateRoom();

    const user = userData || cachedUser;

    useEffect(() => {
        setMounted(true);
    }, []);

    useEffect(() => {
        if (!mounted) return;

        if (!isAuthenticated) {
            router.push('/auth/login');
            return;
        }
        getCurrentUser();
    }, [mounted, isAuthenticated, router, getCurrentUser]);

    const handleCreateRoom = async (formData) => {
        try {
            await createRoom(formData);
            setShowCreateModal(false);
            refetchRooms();
        } catch (error) {
            console.error('Create room error:', error);
        }
    };

    const handleJoinSuccess = () => {
        setShowJoinModal(false);
        refetchRooms();
    };

    const handleLogout = () => {
        logout();
    };

    // Don't render until mounted to prevent hydration mismatch
    if (!mounted || userLoading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-gray-500">Loading your dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white border-b border-gray-200 sticky top-0 z-30">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        {/* Logo */}
                        <div className="flex items-center space-x-3">
                            <Image src="/logo.png" alt="Logo" width={40} height={40} className="w-10  h-10 object-contain" />
                            <div>
                                <h1 className="text-xl font-bold text-gray-900">DSA Multiplayer</h1>
                                <p className="text-xs text-gray-500">Competitive Coding Platform</p>
                            </div>
                        </div>

                        {/* User Menu */}
                        <div className="flex items-center space-x-4">
                            <div className="text-right hidden sm:block">
                                <p className="text-sm font-medium text-gray-900">{user?.username || 'User'}</p>
                                <p className="text-xs text-gray-500">{user?.email}</p>
                            </div>
                            <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-900 font-bold border border-gray-200">
                                {user?.username?.[0]?.toUpperCase() || 'U'}
                            </div>
                            <button
                                onClick={handleLogout}
                                className="text-sm text-gray-500 hover:text-gray-900 font-medium transition-colors"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Welcome Section */}
                <div className="bg-white border border-gray-200 rounded-2xl p-8 mb-8 shadow-sm">
                    <h2 className="text-3xl font-bold mb-2 text-gray-900">Welcome back, {user?.username}! 👋</h2>
                    <p className="text-gray-500 mb-6">Ready to compete and improve your DSA skills?</p>

                    {/* Quick Actions */}
                    <div className="flex flex-wrap gap-4">
                        <button
                            onClick={() => setShowCreateModal(true)}
                            className="bg-black text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors flex items-center space-x-2 shadow-sm"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                            <span>Create Room</span>
                        </button>
                        <button
                            onClick={() => setShowJoinModal(true)}
                            className="bg-white text-gray-900 border border-gray-200 px-6 py-3 rounded-lg font-semibold hover:bg-gray-50 transition-colors flex items-center space-x-2 shadow-sm"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                            </svg>
                            <span>Join Room</span>
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Left Column - Features & Stats */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Features */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                            <h3 className="text-xl font-bold text-gray-900 mb-4">🚀 Platform Features</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <FeatureCard
                                    icon="👥"
                                    title="Team Collaboration"
                                    description="Work together with your team to solve problems faster"
                                />
                                <FeatureCard
                                    icon="⚡"
                                    title="Real-time Coding"
                                    description="Live code editor with instant feedback and execution"
                                />
                                <FeatureCard
                                    icon="🏆"
                                    title="Competitive Scoring"
                                    description="Earn points based on speed and accuracy"
                                />
                                <FeatureCard
                                    icon="💬"
                                    title="Team Chat"
                                    description="Communicate with teammates during contests"
                                />
                                <FeatureCard
                                    icon="📊"
                                    title="Live Leaderboard"
                                    description="Track your team's progress in real-time"
                                />
                                <FeatureCard
                                    icon="🎯"
                                    title="Multiple Languages"
                                    description="Code in JavaScript, Python, C++, Java, or C"
                                />
                            </div>
                        </div>

                        {/* Available Rooms */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                            <div className="flex justify-between items-center mb-4">
                                <h3 className="text-xl font-bold text-gray-900">🎮 Available Rooms</h3>
                            </div>

                            {roomsLoading ? (
                                <div className="text-center py-8">
                                    <div className="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin mx-auto"></div>
                                </div>
                            ) : roomsData?.rooms?.length > 0 ? (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    {roomsData.rooms.slice(0, 4).map((room) => (
                                        <RoomCard key={room.id} room={room} />
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8 text-gray-500">
                                    <p>No active rooms available</p>
                                    <button
                                        onClick={() => setShowCreateModal(true)}
                                        className="text-blue-600 hover:text-blue-800 font-medium mt-2 transition-colors"
                                    >
                                        Create the first room →
                                    </button>
                                </div>
                            )}

                            <div className="mt-4">
                                <button
                                    type="button"
                                    onClick={() => router.push('/room')}
                                    className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-100 hover:border-gray-300 transition-colors"
                                >
                                    View Available Rooms
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Right Column - User Info & Stats */}
                    <div className="space-y-6">
                        {/* User Profile Card */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                            <div className="text-center mb-6">
                                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-900 text-3xl font-bold mx-auto mb-3 border border-gray-200">
                                    {user?.username?.[0]?.toUpperCase() || 'U'}
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">{user?.username}</h3>
                                <p className="text-sm text-gray-500">{user?.email}</p>
                                {user?.emailVerified && (
                                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 mt-2 border border-green-200">
                                        ✓ Verified
                                    </span>
                                )}
                            </div>

                            <div className="space-y-3">
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-500">Member Since</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'Recently'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                                    <span className="text-sm text-gray-500">Account Status</span>
                                    <span className="text-sm font-medium text-green-600">Active</span>
                                </div>
                            </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">📈 Quick Stats</h3>
                            <div className="space-y-3">
                                <StatItem label="Rooms Joined" value="0" />
                                <StatItem label="Problems Solved" value="0" />
                                <StatItem label="Total Points" value="0" />
                            </div>
                        </div>

                        {/* How It Works */}
                        <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                            <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 How It Works</h3>
                            <ol className="space-y-3 text-sm text-gray-500">
                                <li className="flex items-start space-x-2">
                                    <span className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold">1</span>
                                    <span>Create or join a room</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <span className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold">2</span>
                                    <span>Form or join a team</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <span className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold">3</span>
                                    <span>Wait for admin to start</span>
                                </li>
                                <li className="flex items-start space-x-2">
                                    <span className="flex-shrink-0 w-6 h-6 bg-gray-900 text-white rounded-full flex items-center justify-center text-xs font-bold">4</span>
                                    <span>Solve problems & compete!</span>
                                </li>
                            </ol>
                        </div>
                    </div>
                </div>
            </main>

            {/* Create Room Modal */}
            <Modal
                isOpen={showCreateModal}
                onClose={() => setShowCreateModal(false)}
                title="Create New Room"
            >
                <RoomForm onSubmit={handleCreateRoom} isLoading={creatingRoom} />
            </Modal>

            {/* Join Room Modal */}
            <Modal
                isOpen={showJoinModal}
                onClose={() => setShowJoinModal(false)}
                title="Join Room"
            >
                <RoomJoin onSuccess={handleJoinSuccess} />
            </Modal>
        </div>
    );
}

// Feature Card Component
function FeatureCard({ icon, title, description }) {
    return (
        <div className="flex items-start space-x-3 p-4 rounded-lg bg-white border border-gray-200 hover:border-gray-300 hover:shadow-md transition-all">
            <span className="text-2xl">{icon}</span>
            <div>
                <h4 className="font-semibold text-gray-900 text-sm">{title}</h4>
                <p className="text-xs text-gray-500 mt-1">{description}</p>
            </div>
        </div>
    );
}

// Room Card Component
// Room Card Component (Styled as TeamCard)
function RoomCard({ room }) {
    const router = useRouter();
    const isFull = false; // Add logic if max participants is available
    const isLocked = room.privacy === 'private';
    const isUserTeam = false; // Add logic if user ownership is available

    // Map room status
    const statusLabel = room.status === 'WAITING' ? 'Open' : room.status;

    return (
        <div
            className={`group relative bg-white rounded-xl border p-4 transition-all ${isUserTeam ? 'border-blue-100 shadow-sm ring-4 ring-blue-50/50 cursor-pointer' : 'border-gray-200 hover:border-gray-300 cursor-pointer'
                } ${isFull && !isUserTeam ? 'opacity-75 grayscale-[20%]' : ''}`}
            onClick={() => router.push(`/room/${room.id}/waiting`)}
        >

            {isUserTeam && (
                <div className="absolute -top-3 -right-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-600 ring-2 ring-white">
                        <Star className="w-3.5 h-3.5 text-white fill-current" />
                    </span>
                </div>
            )}

            <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold ${isUserTeam ? 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-sm' : 'bg-gray-100 text-gray-500'
                        }`}>
                        {room.name.substring(0, 2).toUpperCase()}
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-900 leading-none mb-1">{room.name}</h3>
                        <p className={`text-xs ${isUserTeam ? 'text-blue-600 font-medium' : 'text-gray-500'}`}>
                            {isUserTeam ? 'Your Room' : isLocked ? 'Private Room' : isFull ? 'Room full' : 'Open for players'}
                        </p>
                    </div>
                </div>
                {isLocked && <Lock className="w-4 h-4 text-gray-400" />}
            </div>

            <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Host</span>
                    <span className="text-gray-900 font-medium">{room.creator?.username || 'Unknown'}</span>
                </div>
                <div className="flex items-center justify-between text-xs">
                    <span className="text-gray-500">Participants</span>
                    <span className={`font-medium ${isFull ? 'text-amber-600' : 'text-gray-900'}`}>{room.totalParticipants || 0} / 10</span>
                </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded text-[10px] font-semibold ${isLocked ? 'bg-gray-100 text-gray-500' : isFull ? 'bg-amber-50 text-amber-700' : 'bg-emerald-50 text-emerald-700'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${isLocked ? 'bg-gray-400' : isFull ? 'bg-amber-500' : 'bg-emerald-500'}`}></span>
                    {statusLabel}
                </span>

                {!isUserTeam && !isLocked && !isFull && (
                    <Button size='sm' className="h-8 text-xs">Join Room</Button>
                )}
                {isFull && !isLocked && (
                    <Button size='sm' disabled className="h-8 text-xs">Full</Button>
                )}
                {isLocked && <Button size='sm' className="h-8 text-xs">Request</Button>}
                {isUserTeam && <span className="text-xs font-medium text-gray-400">Joined</span>}
            </div>
        </div>
    );
}

// Stat Item Component
function StatItem({ label, value }) {
    return (
        <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">{label}</span>
            <span className="px-3 py-1 rounded-full text-sm font-bold bg-gray-100 text-gray-900 border border-gray-200">
                {value}
            </span>
        </div>
    );
}
