
type AuthenticatedSession = {
    userId: number;
    expiresAt: Date;
    createdAt: Date;
} | undefined;


type AuthenticatedUser = {
    id: number;
    githubId: number;
    name: string | null;
    email: string | null;
    avatarUrl: string | null;
    profileUrl: string | null;
};

export type {
    AuthenticatedSession,
    AuthenticatedUser
}