import { Context } from "hono";

const publishEnsureRepository = async (c: Context, ghUserId: string, ghAccessToken: string) => {
    await c.env.REPOSITORY_QUEUE.send({
        type: 'ensure-repository',
        userId: ghUserId,
        accessToken: ghAccessToken
    });
}

export {
    publishEnsureRepository
};