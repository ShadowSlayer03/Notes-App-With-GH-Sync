import { Hono } from 'hono';
import { logout } from '../../controllers/api/user/post.controller';
import { checkUserAuthentication, getUserDetails } from '../../controllers/api/user/get.controller';

const userAPI = new Hono();

userAPI.get('/check-session', checkUserAuthentication);

userAPI.get('/me', getUserDetails);

userAPI.post('/logout', logout);

export default userAPI;