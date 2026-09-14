import createGithubClient from "../client";
import { repoName } from "../constants";
import getNotesDetails from "./getNotesDetails";

const getAllNotes = async (
    accessToken: string,
    userName: string
) => {
    try {
        const octokit = createGithubClient(accessToken);

        const { data } = await octokit.request(
            "GET /repos/{owner}/{repo}/contents/{path}",
            {
                owner: userName,
                repo: repoName,
                path: "",
                headers: {
                    "X-GitHub-Api-Version": "2026-03-10"
                }
            }
        );

        if (!Array.isArray(data)) {
            return [];
        }

        const folders = data.filter(
            (item) => item.type === "dir"
        );

        const folderContents = await Promise.all(
            folders.map(async (folder) => {
                // const { data: notes } = await octokit.request(
                //     "GET /repos/{owner}/{repo}/contents/{path}",
                //     {
                //         owner: userName,
                //         repo: repoName,
                //         path: folder.path,
                //         headers: {
                //             "X-GitHub-Api-Version": "2026-03-10"
                //         }
                //     }
                // );

                const notes = await getNotesDetails(
                    accessToken,
                    userName,
                    folder.path
                );

                return {
                    folder,
                    notes
                };
            })
        );

        return folderContents;
    } catch (err) {
        throw new Error(
            err instanceof Error ? err.message : "Unknown error"
        );
    }
};

export default getAllNotes;