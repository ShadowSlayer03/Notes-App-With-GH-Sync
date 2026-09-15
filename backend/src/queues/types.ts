export type RepositoryJob =
    | {
        type: 'ensure-repository';
        userId: number;
        accessToken: string;
    };

// These are not final
export type AIJob =
    | {
        type: 'index-note';
        userId: number;
        notePath: string;
    };

export type MediaJob =
    | {
        type: 'process-image';
        userId: number;
        url: string;
    };