import { createClient } from "@libsql/client/web";
import { drizzle } from "drizzle-orm/libsql";
import { Context } from "hono";
import { env } from "hono/adapter";

export function getDb(c: Context) {
    const { TURSO_AUTH_TOKEN, TURSO_DATABASE_URL } = env(c);

    const turso =  createClient({
        url: TURSO_DATABASE_URL,
        authToken: TURSO_AUTH_TOKEN,
    });

    return drizzle(turso);
}
