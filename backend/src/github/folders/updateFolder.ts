import { Folder } from "../../schema/FolderSchema";
import createGithubClient from "../client";
import { repoName } from "../constants";
import { toBase64, toJsonObject } from "../../utils/folders";

const metadataFileName = ".kairno.json";

const updateFolder = async (
    accessToken: string,
    owner: string,
    folderId: string,
    updatedFolder?: Partial<Folder>
) => {
    try {
        const octokit = createGithubClient(accessToken);

        const { data: folderContents } = await octokit.request(
            "GET /repos/{owner}/{repo}/contents/{path}",
            {
                owner,
                repo: repoName,
                path: folderId,
                headers: {
                    "X-GitHub-Api-Version": "2026-03-10"
                }
            }
        );

        if (!Array.isArray(folderContents)) {
            throw new Error("Folder not found.");
        }

        const noteCount = folderContents.filter(
            (item) =>
                item.type === "file" &&
                item.name.endsWith(".md")
        ).length;

        const { data: metadataFile } = await octokit.request(
            "GET /repos/{owner}/{repo}/contents/{path}",
            {
                owner,
                repo: repoName,
                path: `${folderId}/${metadataFileName}`,
                headers: {
                    "X-GitHub-Api-Version": "2026-03-10"
                }
            }
        );

        if (Array.isArray(metadataFile) || metadataFile.type !== "file") {
            throw new Error("Invalid folder metadata.");
        }

        const existingFolder = toJsonObject<Folder>(metadataFile.content);


        const mergedFolder = {
            ...existingFolder,
            ...updatedFolder,
            noteCount
        };

        const existingContent = toBase64(existingFolder);
        const newContent = toBase64(mergedFolder);

        if (existingContent === newContent) {
            return metadataFile;
        }

        const { data } = await octokit.request(
            "PUT /repos/{owner}/{repo}/contents/{path}",
            {
                owner,
                repo: repoName,
                path: `${folderId}/${metadataFileName}`,
                message: `Update folder metadata for ${folderId}`,
                content: toBase64(
                    mergedFolder
                ),
                sha: metadataFile.sha,
                headers: {
                    "X-GitHub-Api-Version": "2026-03-10"
                }
            }
        );

        return data;
    } catch (err) {
        throw new Error(
            `Failed to update folder: ${err instanceof Error ? err.message : "Unknown error"
            }`
        );
    }
};

export default updateFolder;