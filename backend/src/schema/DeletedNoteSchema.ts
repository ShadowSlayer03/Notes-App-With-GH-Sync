import z from "zod";

export const DeletedNotesSchema = z.object({
	id: z.number().int(),
	title: z.string(),
	restoreAsTitle: z.string().optional(),
	desc: z.string(),
	folder: z.string(),
	deleteCommitSha: z.string(),
	previousCommitSha: z.string(),
	deletedAt: z.coerce.date()
});

export type DeletedNote = z.infer<typeof DeletedNotesSchema>;
