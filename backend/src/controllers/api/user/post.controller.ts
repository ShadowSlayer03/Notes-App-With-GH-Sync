import { Context } from "hono";
import { error, success } from "../../../utils/response";
import { deleteCookie, getCookie } from "hono/cookie";
import { hashSessionToken } from "../../../utils/session";
import { getDb } from "../../../db/client";
import { sessions } from "../../../db/schema";
import { eq } from "drizzle-orm";

const logout = async (c: Context) => {
    try {
        const sessionToken = getCookie(c, 'kairno_session');

        if (!sessionToken) {
            return error({ c, message: 'Unauthorized, no token found!', statusCode: 401 });
        }

        const hashedSessionToken = await hashSessionToken(sessionToken);

        const db = getDb(c);

        const deletedSession = await db
            .delete(sessions)
            .where(eq(sessions.tokenHash, hashedSessionToken))
            .returning();

        if (deletedSession.length===0) {
            return error({ c, message: 'Session does not exist!', statusCode: 404 });
        }

        deleteCookie(c, 'kairno_session');

        return success({ c, message: 'Logout successful!', statusCode: 200 });

    } catch (err) {
        return error({ c, message: 'Error logging out: ' + err, statusCode: 500 })
    }
}

export {
    logout
}