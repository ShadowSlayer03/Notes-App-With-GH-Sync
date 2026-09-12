import { Context } from "hono";
import { decryptGithubToken } from "../../../utils/access";
import { error, success } from "../../../utils/response";
import createNewFolder from "../../../github/folders/createNewFolder";
import { Folder } from "../../../schema/FolderSchema";

const createFolder = async (c: Context) => {
    try {
        const user = c.get('user');

        const body = await c.req.json<Folder>();

        const decryptedToken = await decryptGithubToken(user.githubAccessToken, c);

        const owner = user.profileUrl.split('/').pop();

        const result = await createNewFolder(decryptedToken, owner, body);

        return success({ c, message: 'Folder created successfully!', data: result, statusCode: 200 });
    } catch (err) {
        return error({ c, message: "Error while creating folder! " + err, statusCode: 500 });
    }
}

export {
    createFolder
}