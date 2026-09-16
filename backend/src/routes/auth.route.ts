import { Hono } from 'hono';
import { getGithubAuth, getGithubUserDetails } from '../controllers/auth.controller';

const auth = new Hono();

auth.get('/github', getGithubAuth);

auth.get('/github/callback', getGithubUserDetails);

export default auth;