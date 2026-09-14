import { deleteCookie, getCookie } from "hono/cookie";
import { createMiddleware } from "hono/factory";
import { error } from "../utils/response";
import { hashSessionToken } from "../utils/session";
import { getDb } from "../db/client";
import { sessions, users } from "../db/schema";
import { eq } from "drizzle-orm";

const validateSession = createMiddleware(async (c, next) => {
    try {
        const sessionToken = getCookie(c, 'kairno_session');

        if (!sessionToken) {
            return error({
                c,
                message: '[MW]: Unauthorized, session token not found',
                statusCode: 401
            });
        }

        const tokenHash = await hashSessionToken(sessionToken);

        const db = getDb(c);

        const result = await db
            .select({
                session: sessions,
                user: users
            })
            .from(sessions)
            .innerJoin(users, eq(sessions.userId, users.id))
            .where(eq(sessions.tokenHash, tokenHash))
            .get();

        if (!result) {
            return error({
                c,
                message: '[MW]: User and session not found!',
                statusCode: 404
            });
        }

        const { session, user } = result;

        if (!session) {
            deleteCookie(c, 'kairno_session', {
                path: '/'
            });

            return error({
                c,
                message: '[MW]: Unauthorized, session not found',
                statusCode: 401
            });
        }

        if (session.expiresAt <= new Date()) {
            await db
                .delete(sessions)
                .where(eq(sessions.tokenHash, tokenHash));

            deleteCookie(c, 'kairno_session', {
                path: '/'
            });

            return error({
                c,
                message: '[MW]: Session expired, login again!',
                statusCode: 401
            });
        }

        c.set('session', session);
        c.set('user', user);

        await next();
    } catch (err) {
        console.error(err);

        return error({
            c,
            message: '[MW]: Internal server error',
            statusCode: 500
        });
    }
});

export default validateSession;