import { useRouter } from 'next/navigation';
import API from '../index';
import { useFetch, useMutation } from './useAPI';

export function useCreateTeam() {
    return useMutation(API.teams.createTeam, {
        successMessage: 'Team created successfully!',
    });
}

export function useRoomTeams(roomId, filters = {}) {
    return useFetch(
        () => API.teams.getTeamsInRoom(roomId, filters),
        [roomId, JSON.stringify(filters)],
        {
            skip: !roomId,
            showErrorToast: false,
        }
    );
}

export function useTeamDetails(teamId) {
    return useFetch(
        () => API.teams.getTeamDetails(teamId),
        [teamId],
        {
            skip: !teamId,
        }
    );
}

export function useJoinTeam() {
    return useMutation(API.teams.joinTeam, {
        successMessage: 'Joined team successfully!',
    });
}

export function useRequestJoinTeam() {
    return useMutation(API.teams.requestToJoin, {
        successMessage: 'Join request sent!',
    });
}
