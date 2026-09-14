import createGithubClient from "../client";
import { repoName } from "../constants";
import getNotesDetails from "./getNotesDetails";

const getSpecificNotes = async (
    accessToken: string,
    userName: string,
    folderId: string) => {
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
            throw new Error("Expected repository contents to be a directory");
        }

        const folder = data.filter(
            (item) => item.type === "dir" && item.name === folderId
        ).at(0);

        if (!folder) {
            throw new Error(`Folder "${folderId}" not found`);
        }

        const notes = await getNotesDetails(accessToken, userName, folderId);

        return {
            folder,
            notes
        };
    } catch (err) {
        throw new Error(
            err instanceof Error ? err.message : "Unknown error"
        );
    }
}

export default getSpecificNotes;