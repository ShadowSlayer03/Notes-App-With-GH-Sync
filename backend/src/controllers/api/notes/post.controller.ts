import { Context } from "hono"
import { Note } from "../../../schema/NoteSchema";
import { decryptGithubToken } from "../../../utils/access";

import { error, success } from "../../../utils/response";
import createNewNote from "../../../github/notes/createNewNote";
import { getDb } from "../../../db/client";
import { deletedNotes, sharedLinks } from "../../../db/schema";
import getSpecificNotes from "../../../github/notes/getSpecificNotes";
import checkCommitAndRestoreDeletedNote from "../../../github/notes/checkCommitAndRestoreDeletedNote";
import { DeletedNote } from "../../../schema/DeletedNoteSchema";
import { eq } from "drizzle-orm";

const createNote = async (c: Context) => {
    try {
        const user = c.get('user');

        const body = await c.req.json<Note>();

        const decryptedToken = await decryptGithubToken(user.githubAccessToken, c);

        const owner = user.profileUrl.split('/').pop();
        const avatarUrl = user.avatarUrl;

        const result = await createNewNote(decryptedToken, owner, avatarUrl, body);

        return success({ c, message: 'Note created successfully!', data: result, statusCode: 200 });
    } catch (err) {
        return error({ c, message: 'Error while creating note! ' + err, statusCode: 500 });
    }
}

const createSharedNoteLink = async (c: Context) => {
    try {
        const user = c.get('user');

        const noteDetails = await c.req.json();

        const db = getDb(c);

        const newSharedLink = await db.insert(sharedLinks).values({
            userId: user.id,
            noteTitle: noteDetails.title,
            noteContent: noteDetails.data
        }).returning();

        return success({ c, message: 'Note share link created successfully!', data: newSharedLink.at(0), statusCode: 200 })

    } catch (err) {
        return error({ c, message: 'Error while creating shared note link', statusCode: 500 });
    }
}

// SELFNOTE: Same API endpoint hit when restore is conflicting due to a file with same name
// Need to pass a new deletedNoteData with modified title then
const restoreDeletedNote = async (c: Context) => {
    try {
        const deletedNoteData = await c.req.json<DeletedNote>();
        const user = c.get('user');

        const { title, folder, restoreAsTitle } = deletedNoteData;

        const decryptedToken = await decryptGithubToken(user.githubAccessToken, c);

        const userName = user.profileUrl.split('/').pop() ?? 'User';

        const notesFromFolder = await getSpecificNotes(decryptedToken, userName, folder);

        const newNoteTitle = restoreAsTitle ?? title;

        const noteAlreadyExists = notesFromFolder.notes.some(
            (note) => note.title === newNoteTitle
        );

        if (noteAlreadyExists) {
            return error({ c, message: 'Note already exists in the folder!', statusCode: 409 });
        }

        const restoredNewNote = await checkCommitAndRestoreDeletedNote(decryptedToken, userName, deletedNoteData);

        const db = getDb(c);

        if (restoredNewNote) {
            const deletedNoteFromDB = await db
                .delete(deletedNotes)
                .where(eq(deletedNotes.id, deletedNoteData.id));

            if (!deletedNoteFromDB) {
                return error({ c, message: 'Note not found in deleted notes table!', statusCode: 404 })
            }
        }

        return success({ c, message: `Restored deleted note ${deletedNoteData.title} successfully!`, data: restoredNewNote, statusCode: 200 });

    } catch (err) {
        return error({ c, message: 'Error while restoring deleted note: ' + err, statusCode: 500 });
    }
}

export {
    createNote,
    createSharedNoteLink,
    restoreDeletedNote
}