/**
 * Room Hooks
 * Ready-to-use hooks for room management
 */

import { useRouter } from 'next/navigation';
import API from '../index';
import { useFetch, useMutation } from './useAPI';

/**
 * Hook for creating a room
 */
export function useCreateRoom() {
    const router = useRouter();

    return useMutation(API.rooms.createRoom, {
        successMessage: 'Room created successfully!',
        onSuccess: (data) => {
            router.push(`/room/${data.id}/waiting`);
        },
    });
}

/**
 * Hook for getting all rooms
 */
export function useRooms(filters = {}) {
    return useFetch(
        () => API.rooms.getAllRooms(filters),
        [JSON.stringify(filters)],
        {
            showErrorToast: false,
        }
    );
}

/**
 * Hook for getting room details
 */
export function useRoomDetails(roomId) {
    return useFetch(
        () => API.rooms.getRoomDetails(roomId),
        [roomId],
        {
            skip: !roomId,
            showErrorToast: false,
        }
    );
}

/**
 * Hook for joining a room
 */
export function useJoinRoom() {
    const router = useRouter();

    return useMutation(
        ({ code, password }) => API.rooms.joinRoom(code, password),
        {
            successMessage: 'Joined room successfully!',
            onSuccess: (data) => {
                router.push(`/room/${data.room.id}/waiting`);
            },
        }
    );
}

/**
 * Hook for starting a room
 */
export function useStartRoom() {
    return useMutation(
        (roomId) => API.rooms.startRoom(roomId),
        {
            successMessage: 'Room started!',
        }
    );
}

/**
 * Hook for ending a room
 */
export function useEndRoom() {
    return useMutation(
        (roomId) => API.rooms.endRoom(roomId),
        {
            successMessage: 'Room ended!',
        }
    );
}

/**
 * Hook for deleting a room
 */
export function useDeleteRoom() {
    const router = useRouter();

    return useMutation(
        (roomId) => API.rooms.deleteRoom(roomId),
        {
            successMessage: 'Room deleted successfully!',
            onSuccess: () => {
                router.push('/room');
            },
        }
    );
}
