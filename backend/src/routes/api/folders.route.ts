import { Hono } from "hono";
import { getAllFolders } from "../../controllers/api/folders/get.controller";
import { createFolder } from "../../controllers/api/folders/post.controller";
import { zValidator } from "@hono/zod-validator";
import { FolderSchema } from "../../schema/FolderSchema";

const folderAPI = new Hono();

folderAPI.get('/', getAllFolders);

folderAPI.post('/create', zValidator('json', FolderSchema) , createFolder);

export default folderAPI;

