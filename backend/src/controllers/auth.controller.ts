import { Context } from "hono";
import { env } from "hono/adapter";
import { setCookie } from "hono/cookie";
import { getDb } from "../db/client";
import { sessions, users } from "../db/schema";
import { generateSessionToken, hashSessionToken } from "../utils/session";
import { GitHubEmailResponse, GitHubTokenResponse, GitHubUserResponse } from "./types/authTypes";
import createRepo from "../github/repo/createRepo";
import { eq } from "drizzle-orm";
import { error } from "../utils/response";
import { encryptGithubToken } from "../utils/access";

const getGithubAuth = (c: Context) => {
    const { GITHUB_OAUTH_CLIENT_ID, BACKEND_MAIN_URI, } = env(c);

    const redirectURI = `${BACKEND_MAIN_URI}/auth/github/callback`;

    const url = `https://github.com/login/oauth/authorize?client_id=${GITHUB_OAUTH_CLIENT_ID}&redirect_uri=${redirectURI}&scope=repo%20user:email`;

    return c.redirect(url);
}

const getGithubUserDetails = async (c: Context) => {
    const {
        GITHUB_OAUTH_CLIENT_ID,
        GITHUB_OAUTH_CLIENT_SECRET,
        FRONTEND_MAIN_URI
    } = env(c);

    const code = c.req.query('code');

    if (!code) {
        return error({ c, message: 'Missing Github OAuth code', statusCode: 400 });
    }

    const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
        method: 'POST',
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            client_id: GITHUB_OAUTH_CLIENT_ID,
            client_secret: GITHUB_OAUTH_CLIENT_SECRET,
            code
        })
    });

    if (!tokenRes.ok) {
        const errorBody = await tokenRes.text();

        console.error('TOKEN EXCHANGE FAILED:', {
            status: tokenRes.status,
            statusText: tokenRes.statusText,
            body: errorBody
        });

        return error({ c, message: 'Token exchange failed', statusCode: 502 });
    }

    const tokenData = await tokenRes.json() as GitHubTokenResponse;

    if (!tokenData.access_token) {
        console.error('GitHub access token missing:', tokenData);

        return error({ c, message: 'Github authentication failed', statusCode: 401 });
    }

    const githubHeaders = {
        Authorization: `Bearer ${tokenData.access_token}`,
        'User-Agent': 'Kairno'
    };

    const [userRes, emailRes] = await Promise.all([
        fetch('https://api.github.com/user', {
            headers: githubHeaders
        }),
        fetch('https://api.github.com/user/emails', {
            headers: githubHeaders
        })
    ]);

    if (!userRes.ok) {
        const errorBody = await userRes.text();

        console.error('GitHub user request failed:', {
            status: userRes.status,
            body: errorBody
        });

        return error({ c, message: 'Failed to fetch GitHub user', statusCode: 502 });
    }

    if (!emailRes.ok) {
        const errorBody = await emailRes.text();

        console.error('GitHub email request failed:', {
            status: emailRes.status,
            body: errorBody
        });

        return error({ c, message: 'Failed to fetch GitHub emails', statusCode: 502 });
    }

    const userResJSON = await userRes.json() as GitHubUserResponse;
    const emailResJSON = await emailRes.json() as GitHubEmailResponse[];

    const primaryEmail =
        emailResJSON.find(
            ({ primary, verified }) => primary && verified
        )?.email ?? null;

    const db = getDb(c);

    let user = await db
        .select()
        .from(users)
        .where(eq(users.githubId, userResJSON.id))
        .get();

    const encryptedToken = await encryptGithubToken(
        tokenData.access_token,
        c
    );

    if (!user) {
        const repo = await createRepo(tokenData.access_token);

        const [createdUser] = await db
            .insert(users)
            .values({
                githubId: userResJSON.id,
                githubRepoId: repo.id,
                githubAccessToken: encryptedToken,
                name: userResJSON.name,
                email: primaryEmail,
                avatarUrl: userResJSON.avatar_url,
                profileUrl: userResJSON.html_url
            })
            .returning();

        user = createdUser;
    } else {
        await db
            .update(users)
            .set({
                githubAccessToken: encryptedToken,
                updatedAt: new Date()
            })
            .where(eq(users.id, user.id));

        user.githubAccessToken = encryptedToken;
        user.updatedAt = new Date();
    }

    const rawSessionToken = generateSessionToken();
    const tokenHash = await hashSessionToken(rawSessionToken);

    const sessionDurationMs = 1000 * 60 * 60 * 24;
    const expiresAt = new Date(Date.now() + sessionDurationMs);

    const [session] = await db
        .insert(sessions)
        .values({
            tokenHash,
            userId: user.id,
            expiresAt
        })
        .returning();

    if (!session) {
        return error({ c, message: 'Failed to create session', statusCode: 500 });
    }

    setCookie(c, 'kairno_session', rawSessionToken, {
        path: '/',
        secure: true,
        httpOnly: true,
        sameSite: 'Lax',
        maxAge: Math.floor(sessionDurationMs / 1000)
    });

    return c.redirect(`${FRONTEND_MAIN_URI}/`);
};

export {
    getGithubAuth,
    getGithubUserDetails
}