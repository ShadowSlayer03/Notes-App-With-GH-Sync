import { Context } from "hono";
import { error, success } from "../../../utils/response";
import { Note } from "../../../schema/NoteSchema";
import deleteNote from "../../../github/notes/deleteNote";
import { decryptGithubToken } from "../../../utils/access";
import { getDb } from "../../../db/client";
import { deletedNotes } from "../../../db/schema";

const deleteNotes = async (c: Context) => {
    try {
        const user = c.get('user');
        const noteDetails = await c.req.json<Note>();

        const { title, desc, folder } = noteDetails;

        if (!title || !folder) {
            return error({ c, message: 'Invalid note details!', statusCode: 400 });
        }

        const userName = user.profileUrl.split('/').pop() ?? 'User';
        const decryptedToken = await decryptGithubToken(user.githubAccessToken, c);

        const deletedNote = await deleteNote(decryptedToken, userName, title, folder);

        const deleteCommitSha = deletedNote.commit?.sha;
        const parentCommitSha = deletedNote.commit?.parents?.[0]?.sha;

        if (!deleteCommitSha || !parentCommitSha) {
            return error({ c, message: 'Delete SHA or parent commit SHA is missing! ', statusCode: 404 });
        }

        const db = getDb(c);

        const deletedNoteRow = await db.insert(deletedNotes).values({
            title,
            folder,
            desc,
            deleteCommitSha,
            previousCommitSha: parentCommitSha
        }).returning();

        return success({ c, message: 'Note deleted successfully!', data: deletedNoteRow, statusCode: 200 });

    } catch (err) {
        return error({ c, message: 'Failed to delete note! ' + err, statusCode: 500 });
    }
}

export {
    deleteNotes
}