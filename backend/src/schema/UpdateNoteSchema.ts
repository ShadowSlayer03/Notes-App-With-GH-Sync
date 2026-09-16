import { z } from 'zod';

export const UpdateNoteSchema = z.object({
	id: z
		.string()
		.trim()
		.min(1, 'Note ID is required'),

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
		.min(1, 'Folder is required'),

	theme: z
		.string()
		.trim()
		.min(1, 'Theme is required'),

	commitMsg: z
		.string()
		.trim()
		.min(1, 'Commit message is required')
		.max(120, 'Commit message cannot exceed 120 characters'),

	data: z
		.string()
		.min(1, 'Content is required')
		.max(100_000, 'Content cannot exceed 100,000 characters'),

	pinned: z
		.boolean(),

	updatedBy: z
		.string()
		.trim()
		.min(1, 'Updated by is required'),

	updatedByAvatarUrl: z
		.url('Invalid avatar URL')
});

export type UpdateNote = z.infer<typeof UpdateNoteSchema>;