    import { CANCELLED } from "dns";

    export const UserRolesEnum = {
        ADMIN: 'ADMIN',
        USER: 'USER',
        TEAM_LEAD: 'TEAM_LEAD',
        TEAM_MEMBER: 'TEAM_MEMBER'
    }

    export const AvailableUserRoles = Object.values(UserRolesEnum);


    export const LoginTypesEnum = {
        EMAIL_PASSWORD: 'EMAIL_PASSWORD',
        GOOGLE_OAUTH: 'GOOGLE',
        GITHUB_OAUTH: 'GITHUB'
    }

    export const AvailableLoginTypes = Object.values(LoginTypesEnum);

    export const USER_TEMPORARY_TOKEN_EXPIRY = 20 * 60 * 1000; 


    export const RoomStatus ={
        WAITING:"WAITING",
        IN_PROGRESS:"IN_PROGRESS",
        COMPLETED:"COMPLETED",
        CANCELLED:"CANCELLED"
    }

    export const AvailableRoomStatus = Object.values(RoomStatus)



export const MembershipStatus = { 
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED",
    LEFT: "LEFT"
}

export const AvailableMembershipStatus = Object.values(MembershipStatus);

export const RequestStatus = {
    PENDING: "PENDING",
    APPROVED: "APPROVED",
    REJECTED: "REJECTED"
}

export const AvailableRequestStatus = Object.values(RequestStatus);


export const Difficulty = {
    EASY: "EASY",
    MEDIUM: "MEDIUM",
    HARD: "HARD"
}

export const AvailableDifficulty = Object.values(Difficulty);

export const ProgrammingLanguage = {
    JAVASCRIPT: "JAVASCRIPT",
    PYTHON: "PYTHON",
    JAVA: "JAVA",
    CPP: "CPP",
    C: "C",
    GO: "GO",
    RUST: "RUST"
}

export const AvailableProgrammingLanguage = Object.values(ProgrammingLanguage);