/**
 * Central Hooks Export
 * Import all hooks from one place
 */

// Base hooks
export {
    useAPI,
    useFetch,
    useMutation,
    usePagination,
    useInfiniteScroll,
    useDebouncedAPI,
    usePolling,
} from './useAPI';

// Authentication hooks
export {
    useRegister,
    useVerifyEmail,
    useLogin,
    useLogout,
    useCurrentUser,
    useResendVerification,
    useForgotPassword,
    useResetPassword,
    useAuth,
} from './useAuth';

// Room hooks
export {
    useCreateRoom,
    useRooms,
    useRoomDetails,
    useJoinRoom,
    useStartRoom,
    useEndRoom,
    useDeleteRoom,
} from './useRoom';

// Question and submission hooks
export {
    useRoomQuestions,
    useQuestionDetails,
    useAddQuestions,
    useAssignQuestion,
    useRunCode,
    useSubmitSolution,
    useMySubmissions,
    useQuestionSubmissions,
    useSubmissionDetails,
} from './useQuestion';

// Code execution hooks
export { useCodeExecution } from './useCodeExecution';

// Team hooks
export {
    useCreateTeam,
    useRoomTeams,
    useTeamDetails,
    useJoinTeam,
    useRequestJoinTeam,
} from './useTeam';
