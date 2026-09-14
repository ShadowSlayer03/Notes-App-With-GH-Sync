import { Note } from "../../schema/NoteSchema";
import createGithubClient from "../client";
import { repoName } from "../constants";

const deleteNote = async (token: string, userName: string, title: string, folder: string) => {
    try {

        const octokit = createGithubClient(token);

        const { data: noteData } = await octokit.request('GET /repos/{owner}/{repo}/contents/{path}', {
            owner: userName,
            repo: repoName,
            path: `${folder}/${title}.md`,
            headers: {
                'X-GitHub-Api-Version': '2026-03-10'
            }
        });

        if (Array.isArray(noteData)) {
            throw new Error("Expected a file, but GitHub returned a directory");
        }

        const { data: deletedNoteData } = await octokit.request('DELETE /repos/{owner}/{repo}/contents/{path}', {
            owner: userName,
            repo: repoName,
            path: `${folder}/${title}.md`,
            message: `Delete note ${title}`,
            sha: noteData.sha,
            headers: {
                'X-GitHub-Api-Version': '2026-03-10'
            }
        });

        return deletedNoteData;

    } catch (err) {
        throw new Error(
            err instanceof Error ? err.message : "Unknown error"
        );
    }
}

export default deleteNote;