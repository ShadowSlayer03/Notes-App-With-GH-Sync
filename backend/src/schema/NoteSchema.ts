import { z } from 'zod';

export const NoteSchema = z.object({
	title: z
		.string()
		.trim()
		.min(1, 'Title is required')
		.max(100, 'Title cannot exceed 100 characters'),

	desc: z
		.string()
		.trim()
		.min(1, 'Description is required')
		.max(180, 'Description cannot exceed 180 characters'),

	folder: z
		.string()
		.trim()
		.min(1, 'Folder is required')
});

export type Note = z.infer<typeof NoteSchema>;