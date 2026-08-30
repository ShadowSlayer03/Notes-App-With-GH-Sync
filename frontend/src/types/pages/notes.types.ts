type NotesMetadata = {
    title: string;
    desc: string;
    folder: string;
}

type Notes = NotesMetadata & {
    id: string;
    data: string;
    theme: string;
    pinned: boolean;
    updatedAt: string;
    updatedBy: string;
    updatedByAvatarUrl: string;
}

type DetailedNotes = {
    folder: {
        name: string;
        path: string;
    };
    notes: Notes[];
};

type SharedNoteLink = {
    shareId: string;
    userId: string;
    noteTitle: string;
    noteContent: string;
}

type DeletedNote = {
    id: string;
    title: string;
    desc: string;
    folder: string;
    deleteCommitSha: string;
    previousCommitSha: string;
    deletedAt: Date;
    restoreAsTitle?: string;
}

type EditorOptions = {
    data: string;
    theme: string;
    pinned: boolean;
}

type NoteTheme =
    | 'default'
    | 'paper'
    | 'parchment'
    | 'graph'
    | 'grid'
    | 'dots'
    | 'linen'
    | 'terminal'
    | 'midnight'
    | 'sepia';

export type {
    Notes,
    DetailedNotes,
    NoteTheme,
    EditorOptions,
    SharedNoteLink,
    DeletedNote
}