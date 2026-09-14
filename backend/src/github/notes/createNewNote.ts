import { Note } from "../../schema/NoteSchema";
import { createOrUpdateFrontMatter, stringToBase64 } from "../../utils/notes";
import createGithubClient from "../client";
import { defaultNoteTheme, repoName } from "../constants";
import updateFolder from "../folders/updateFolder";

const createNewNote = async (accessToken: string, owner: string, avatarUrl: string, noteDetails: Note) => {
    try {
        const { title, desc, folder } = noteDetails;

        const frontMatter = {
            title,
            desc,
            folder,
            theme: defaultNoteTheme,
            pinned: false,
            updatedAt: new Date().toISOString(),
            updatedBy: owner,
            updatedByAvatarUrl: avatarUrl
        }

        const octokit = createGithubClient(accessToken);

        const newNoteContent = createOrUpdateFrontMatter('', frontMatter);

        const { data } = await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
            owner,
            repo: repoName,
            path: `${folder}/${title}.md`,
            message: `Created new note: ${title}`,
            content: stringToBase64(newNoteContent),
            headers: {
                "X-GitHub-Api-Version": "2026-03-10"
            }
        });

        await updateFolder(accessToken, owner, folder);

        return data;

    } catch (err) {
        throw new Error(
            `Failed to create a new note: ${err instanceof Error ? err.message : 'Unknown error'}`
        );
    }
}

export default createNewNote;