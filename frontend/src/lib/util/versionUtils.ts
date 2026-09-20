import type { NoteVersion } from "../../types/pages/versions.types";


function formatVersionDate(date: string) {
    return new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        timeStyle: 'short'
    }).format(new Date(date));
}

function getVersionNumber(noteVersions: NoteVersion[], version: NoteVersion) {
    const index = noteVersions.findIndex((item) => item.sha === version.sha);

    return noteVersions.length - index;
}

export {
    formatVersionDate,
    getVersionNumber
}