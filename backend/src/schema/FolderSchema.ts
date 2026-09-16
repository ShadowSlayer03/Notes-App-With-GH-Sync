import { z } from "zod";

export const FolderSchema = z.object({
    id: z.string().min(1).max(100),
    title: z.string().min(1).max(100),
    icon: z.string().min(1),
    theme: z.string().min(1),
    isLocked: z.boolean()
});

export type Folder = z.infer<typeof FolderSchema>;