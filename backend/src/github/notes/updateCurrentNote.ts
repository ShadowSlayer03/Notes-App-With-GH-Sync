import matter from "@11ty/gray-matter";
import { UpdateNote } from "../../schema/UpdateNoteSchema";
import { base64ToString, createOrUpdateFrontMatter, rawContentToDetails, stringToBase64 } from "../../utils/notes";
import createGithubClient from "../client";
import { repoName } from "../constants";

const updateCurrentNote = async (accessToken: string, owner: string, avatarUrl: string, noteDetails: UpdateNote) => {
    try {
        const octokit = createGithubClient(accessToken);

        const { title, desc, folder, commitMsg, theme, data, pinned: isPinned  } = noteDetails;

        const { data: file } = await octokit.request(
            'GET /repos/{owner}/{repo}/contents/{path}',
            {
                owner,
                repo: repoName,
                path: `${folder}/${title}.md`,
                headers: {
                    'X-GitHub-Api-Version': '2026-03-10'
                }
            }
        );

        if (Array.isArray(file)) {
            throw new Error('Expected a file, but GitHub returned a directory.');
        }

        if (file.type !== 'file' || !file.content) {
            throw new Error('GitHub file does not contain readable content.');
        }

        const decodedFileContent = base64ToString(file.content);
        let { frontMatter, content } = rawContentToDetails(decodedFileContent);

        frontMatter = {
            ...frontMatter,
            desc,
            pinned: isPinned || frontMatter.pinned || false,
            theme: theme || frontMatter.theme || 'default',
            updatedAt: new Date().toISOString(),
            updatedBy: owner,
            updatedByAvatarUrl: avatarUrl
        }

        const updatedContent = createOrUpdateFrontMatter(data, frontMatter);
        const base64EncodedTotalContent = stringToBase64(updatedContent);

        const { data: updatedResult } = await octokit.request(
            "PUT /repos/{owner}/{repo}/contents/{path}",
            {
                owner,
                repo: repoName,
                path: file.path,
                message: commitMsg,
                content: base64EncodedTotalContent,
                sha: file.sha,
                headers: {
                    "X-GitHub-Api-Version": "2026-03-10"
                }
            }
        );

        return updatedResult;
    } catch (err) {
        throw new Error(
            err instanceof Error ? err.message : "Unknown error"
        );
    }
}

export default updateCurrentNote;