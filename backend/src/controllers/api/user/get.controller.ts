import { Context } from "hono";
import { getCookie } from "hono/cookie";
import { getDb } from "../../../db/client";
import { sessions, users } from "../../../db/schema";
import { eq } from "drizzle-orm";
import { hashSessionToken } from "../../../utils/session";
import { error, success } from "../../../utils/response";

// This is also being done in the middleware now
const checkUserAuthentication = async (c: Context) => {
    try {
        const sessionToken = getCookie(c, 'kairno_session');

        if (!sessionToken) {
            return error({c, message: 'Unauthorized, no token found!', statusCode: 401});
        }

        const db = getDb(c);

        const hashedSessionToken = await hashSessionToken(sessionToken);

        const sessionFromDB = await db
            .select()
            .from(sessions)
            .where(eq(sessions.tokenHash, hashedSessionToken))
            .get();

        if (!sessionFromDB) {
            return error({c, message: 'Unauthorized, no session found!', statusCode: 401});
        }

        if (sessionFromDB.expiresAt.getTime() < Date.now()) {
            return error({c, message:  'Token expired, please login again!', statusCode: 401});
        }

        const { userId, createdAt, expiresAt } = sessionFromDB;

        return success({ c, message: 'Success', data: { userId, createdAt, expiresAt }, statusCode: 200 });
    } catch (err) {
        return error({ c, message: 'Error occurred: ' + err, statusCode: 500 });
    }
}

const getUserDetails = async (c: Context) => {
    try {
        const session = c.get('session');

        const user = c.get('user');

        if (!session) {
            return error({ c, message: 'Session does not exist!', statusCode: 404 });
        }

        if(!user){
            return error({ c, message: 'User does not exist!', statusCode: 404 });
        }

        // const db = getDb(c);

        // const userFromDb = await db
        //     .select()
        //     .from(users)
        //     .where(eq(users.id, session.userId))
        //     .get();

        // if (!userFromDb) {
        //     return error({ c, message: 'User does not exist!', statusCode: 404 });
        // }

        return success({ c, message: 'User details found', data: user, statusCode: 200 });
    } catch (err) {
        return error({ c, message: 'Error occurred: ' + err, statusCode: 500 });
    }
}

export {
    checkUserAuthentication,
    getUserDetails
}