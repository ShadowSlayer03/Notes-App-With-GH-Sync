import { Context } from "hono";
import { error, success } from "../../../utils/response";
import { decryptGithubToken } from "../../../utils/access";
import { allNotesFolderId } from "../../../github/constants";
import getAllNotes from "../../../github/notes/getAllNotes";
import getSpecificNotes from "../../../github/notes/getSpecificNotes";
import getSpecificNoteDetails from "../../../github/notes/getSpecificNoteDetails";
import { getDb } from "../../../db/client";
import { deletedNotes, sharedLinks } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { isValidUUIDv4 } from "../../../utils/notes";

const getNotes = async (c: Context) => {
    try {
        const user = c.get('user');
        const folderId = c.req.query('folder');

        if (!folderId) {
            return error({ c, message: 'Folder name not found!', statusCode: 400 });
        }

        const decryptedToken = await decryptGithubToken(user.githubAccessToken, c);

        const userName = user.profileUrl.split('/').pop() ?? 'User';

        let result = null;

        if (folderId === allNotesFolderId) {
            result = await getAllNotes(decryptedToken, userName);
        } else {
            result = await getSpecificNotes(decryptedToken, userName, folderId);
        }

        return success({ c, message: 'Notes retrieved successfully!', data: result, statusCode: 200 });
    } catch (err) {
        return error({ c, message: 'Failed to get notes! ' + err, statusCode: 500 });
    }
}

const getNoteDetails = async (c: Context) => {
    try {
        const user = c.get('user');

        const folderId = c.req.param('folderId');
        const id = c.req.param('id');
        const ref = c.req.query('ref');

        if (!folderId) {
            return error({ c, message: 'Invalid folderId!', statusCode: 400 });
        }

        if (!id) {
            return error({ c, message: 'Invalid noteId!', statusCode: 400 });
        }

        const decryptedToken = await decryptGithubToken(user.githubAccessToken, c);

        const userName = user.profileUrl.split('/').pop() ?? 'User';

        const noteDetails = await getSpecificNoteDetails(decryptedToken, userName, folderId, id, ref);

        return success({ c, message: 'Note details retrieved successfully!', data: noteDetails, statusCode: 200 });

    } catch (err) {
        return error({ c, message: 'Failed to get note details! ' + err, statusCode: 500 });
    }
}

const getSharedLink = async (c: Context) => {
    try {

        const shareId = c.req.query('shareId');

        if (!shareId) {
            return error({ c, message: 'Invalid shareId!', statusCode: 400 });
        }

        if (!isValidUUIDv4(shareId)) {
            return error({ c, message: 'Invalid shareId format!', statusCode: 401 });
        }

        const db = getDb(c);

        const sharedLink = await db
            .select()
            .from(sharedLinks)
            .where(eq(sharedLinks.shareId, shareId))
            .limit(1);

        return success({ c, message: 'Retrieved shared link successfully!', data: sharedLink.at(0), statusCode: 200 });
    } catch (err) {
        return error({ c, message: 'Failed to get shared link!', statusCode: 500 });
    }
}
const getDeletedNotes = async (c: Context) => {
    try {
        const db = getDb(c);

        const deletedNotesFromDB = await db
            .select()
            .from(deletedNotes)
            .all();

        return success({ c, message: 'Retrieved deleted notes successfully!', data: deletedNotesFromDB, statusCode: 200 });

    } catch (err) {
        return error({ c, message: 'Failed to get deleted notes!', statusCode: 500 });
    }
}

export {
    getNotes,
    getNoteDetails,
    getSharedLink,
    getDeletedNotes
}
