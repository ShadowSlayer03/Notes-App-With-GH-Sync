import { Context } from "hono"
import { error, success } from "../../../utils/response";
import getFolders from "../../../github/folders/getFolders";
import { decryptGithubToken } from "../../../utils/access";

const getAllFolders = async (c: Context) => {
    try {
        const user = c.get('user');

        const decryptedToken = await decryptGithubToken(user.githubAccessToken, c);

        const userName = user.profileUrl.split('/').pop() ?? 'User';

        const result = await getFolders(decryptedToken, userName);

        return success({ c, message: 'Folders retrieved successfully!', data: result, statusCode: 200 });
    } catch (err) {
        return error({ c, message: 'Failed to get folders! ' + err, statusCode: 500 });
    }
}

export {
    getAllFolders
}