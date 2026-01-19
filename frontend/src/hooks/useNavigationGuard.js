'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { X, AlertTriangle, LogOut } from 'lucide-react';
import Modal from '@/components/common/Modal';
import Button from '@/components/common/Button';

/**
 * Navigation Guard Hook
 * Prevents accidental navigation away from waiting room
 * Handles team cleanup when user leaves
 */
export function useNavigationGuard({
    hasTeam,
    isAdmin,
    onLeaveTeam,
    onDeleteRoom,
    roomId
}) {
    const router = useRouter();
    const [showLeaveModal, setShowLeaveModal] = useState(false);
    const [pendingNavigation, setPendingNavigation] = useState(null);
    const [isLeaving, setIsLeaving] = useState(false);

    // Intercept browser back button and navigation
    useEffect(() => {
        const handleBeforeUnload = (e) => {
            if (hasTeam || isAdmin) {
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
        };

        const handlePopState = (e) => {
            if (hasTeam || isAdmin) {
                e.preventDefault();
                window.history.pushState(null, '', window.location.pathname);
                setShowLeaveModal(true);
                setPendingNavigation('back');
            }
        };

        // Add event listeners
        window.addEventListener('beforeunload', handleBeforeUnload);
        window.addEventListener('popstate', handlePopState);

        // Push initial state to enable back button interception
        window.history.pushState(null, '', window.location.pathname);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [hasTeam, isAdmin]);

    const handleNavigateAway = (destination) => {
        if (hasTeam || isAdmin) {
            setShowLeaveModal(true);
            setPendingNavigation(destination);
        } else {
            router.push(destination);
        }
    };

    const handleConfirmLeave = async () => {
        setIsLeaving(true);

        try {
            if (isAdmin) {
                // Admin leaving - delete room
                if (onDeleteRoom) {
                    await onDeleteRoom();
                }
            } else if (hasTeam) {
                // Regular user - leave team
                if (onLeaveTeam) {
                    await onLeaveTeam();
                }
            }

            // Navigate away
            setShowLeaveModal(false);
            if (pendingNavigation === 'back') {
                router.back();
            } else if (pendingNavigation) {
                router.push(pendingNavigation);
            } else {
                router.push('/room');
            }
        } catch (error) {
            console.error('Error leaving:', error);
        } finally {
            setIsLeaving(false);
        }
    };

    const handleCancelLeave = () => {
        setShowLeaveModal(false);
        setPendingNavigation(null);
        // Re-push state to maintain back button interception
        window.history.pushState(null, '', window.location.pathname);
    };

    const LeaveConfirmationModal = () => (
        <Modal
            isOpen={showLeaveModal}
            onClose={handleCancelLeave}
            title={isAdmin ? "Delete Room?" : "Leave Waiting Room?"}
        >
            <div className="space-y-6">
                {/* Warning Icon */}
                <div className="flex justify-center">
                    <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center">
                        <AlertTriangle className="w-8 h-8 text-amber-600" />
                    </div>
                </div>

                {/* Message */}
                <div className="text-center space-y-2">
                    {isAdmin ? (
                        <>
                            <h3 className="text-lg font-bold text-gray-900">
                                You are the Room Admin
                            </h3>
                            <p className="text-sm text-gray-600">
                                If you leave, the room will be <span className="font-semibold text-red-600">permanently deleted</span> and all participants will be removed.
                            </p>
                            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                <p className="text-xs text-red-700 font-medium">
                                    ⚠️ This action cannot be undone. All teams and progress will be lost.
                                </p>
                            </div>
                        </>
                    ) : hasTeam ? (
                        <>
                            <h3 className="text-lg font-bold text-gray-900">
                                You're in a Team
                            </h3>
                            <p className="text-sm text-gray-600">
                                Leaving the waiting room will automatically remove you from your current team.
                            </p>
                            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                <p className="text-xs text-blue-700 font-medium">
                                    💡 You can rejoin the room and create/join a team again later.
                                </p>
                            </div>
                        </>
                    ) : (
                        <>
                            <h3 className="text-lg font-bold text-gray-900">
                                Leave Waiting Room?
                            </h3>
                            <p className="text-sm text-gray-600">
                                Are you sure you want to leave this room?
                            </p>
                        </>
                    )}
                </div>

                {/* Actions */}
                <div className="flex gap-3">
                    <Button
                        onClick={handleCancelLeave}
                        variant="outline"
                        className="flex-1"
                        disabled={isLeaving}
                    >
                        Stay in Room
                    </Button>
                    <Button
                        onClick={handleConfirmLeave}
                        variant="danger"
                        className="flex-1"
                        isLoading={isLeaving}
                        icon={<LogOut className="w-4 h-4" />}
                    >
                        {isAdmin ? 'Delete Room' : 'Leave Room'}
                    </Button>
                </div>
            </div>
        </Modal>
    );

    return {
        showLeaveModal,
        handleNavigateAway,
        LeaveConfirmationModal,
    };
}

export default useNavigationGuard;
