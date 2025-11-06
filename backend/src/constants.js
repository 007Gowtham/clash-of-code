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