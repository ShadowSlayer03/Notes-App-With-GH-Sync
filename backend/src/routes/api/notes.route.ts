import { Hono } from "hono";
import { getNotes, getNoteDetails, getSharedLink, getDeletedNotes } from "../../controllers/api/notes/get.controller";
import { zValidator } from "@hono/zod-validator";
import { createNote, createSharedNoteLink, restoreDeletedNote } from "../../controllers/api/notes/post.controller";
import { NoteSchema } from "../../schema/NoteSchema";
import { updateNote } from "../../controllers/api/notes/put.controller";
import { deleteNotes } from "../../controllers/api/notes/delete.controller";
import { DeletedNotesSchema } from "../../schema/DeletedNoteSchema";

const notesAPI = new Hono();

notesAPI.get('/', getNotes);

notesAPI.post('/create', zValidator('json', NoteSchema), createNote);

notesAPI.get('/:folderId/:id', getNoteDetails);

notesAPI.put('/update', zValidator('json', NoteSchema), updateNote);

notesAPI.delete('/delete', zValidator('json', NoteSchema), deleteNotes);

notesAPI.post('/share', zValidator('json', NoteSchema), createSharedNoteLink);

notesAPI.get('/share', getSharedLink);

notesAPI.get('/deleted', getDeletedNotes);

notesAPI.post('/restore', zValidator('json', DeletedNotesSchema), restoreDeletedNote);

export default notesAPI;