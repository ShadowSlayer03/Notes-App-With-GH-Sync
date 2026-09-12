import { Context } from "hono";
import { UpdateNote } from "../../../schema/UpdateNoteSchema";
import { decryptGithubToken } from "../../../utils/access";
import updateCurrentNote from "../../../github/notes/updateCurrentNote";
import { error, success } from "../../../utils/response";

const updateNote = async (c: Context) => {
    try {
        const user = c.get('user');

        const body = await c.req.json<UpdateNote>();

        const decryptedToken = await decryptGithubToken(user.githubAccessToken, c);

        const owner = user.profileUrl.split('/').pop();
        const avatarUrl = user.avatarUrl;

        const result = await updateCurrentNote(decryptedToken, owner, avatarUrl, body);

        return success({ c, message: `Updated note ${result?.content?.path} successfully!`, data: result, statusCode: 200 })
    } catch (err) {
        return error({ c, message: "Error while updating note! " + err, statusCode: 500 });
    }
}

export {
    updateNote
}