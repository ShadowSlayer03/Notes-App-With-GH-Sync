import { Hono } from "hono";
import { getVersionsForNote } from "../../controllers/api/versions/get.controller";

const versionsAPI = new Hono();

versionsAPI.get('/:noteId', getVersionsForNote);

export default versionsAPI;