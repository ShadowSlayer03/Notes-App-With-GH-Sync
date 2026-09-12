import { Context } from "hono";
import { error, success } from "../../../utils/response";
import getVersionsAndVersionDetails from "../../../github/versions/getVersionsAndVersionDetails";
import { decryptGithubToken } from "../../../utils/access";

const getVersionsForNote = async (c: Context) => {
    try {
        const user = c.get('user');
        const noteId = c.req.param('noteId');
        const folderId = c.req.query('folder');

        console.log("NoteId:", noteId);
        console.log("FolderId:", folderId);

        if (!folderId) {
            return error({ c, message: 'Folder name not found!', statusCode: 400 });
        }

        if (!noteId) {
            return error({ c, message: 'Note Id not found!', statusCode: 400 });
        }
    
        const decryptedToken = await decryptGithubToken(user.githubAccessToken, c);
        
        const userName = user.profileUrl.split('/').pop() ?? 'User';

        const versions = await getVersionsAndVersionDetails(decryptedToken, userName, folderId, noteId);

        return success({ c, message: 'Retrieved note versions successfully', data: versions, statusCode: 200,  });

    } catch (err) {
        return error({ c, message: 'Error occurred while fetching note versions: ' + err, statusCode: 500 });
    }
}

export {
    getVersionsForNote
}