import matter from "@11ty/gray-matter";
import createGithubClient from "../client";
import { repoName } from "../constants";
import { base64ToString } from "../../utils/notes";

const getSpecificNoteDetails = async (
    accessToken: string,
    userName: string,
    folderId: string,
    noteId: string,
    ref?: string
) => {
    try {
        const octokit = createGithubClient(accessToken);

        const { data } = await octokit.request(
            "GET /repos/{owner}/{repo}/contents/{path}",
            {
                owner: userName,
                repo: repoName,
                path: `${folderId}/${noteId}.md`,
                ...(ref ? { ref } : {}),
                headers: {
                    "X-GitHub-Api-Version": "2026-03-10"
                }
            }
        );

        if (!("content" in data)) {
            throw new Error("Expected a markdown file.");
        }

        const markdown = base64ToString(data.content);

        const {
            data: frontmatter,
            content
        } = matter(markdown);

        return {
            ...frontmatter,
            data: content,
            sha: data.sha,
            path: data.path,
            name: data.name
        };
    } catch (err) {
        throw new Error(
            err instanceof Error ? err.message : "Unknown error"
        );
    }
};

export default getSpecificNoteDetails;