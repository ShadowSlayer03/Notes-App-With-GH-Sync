import { Folder } from "../../schema/FolderSchema";
import { toBase64 } from "../../utils/folders";
import createGithubClient from "../client";
import { repoName } from "../constants";

const createNewFolder = async (accessToken: string, owner: string, folderDetails: Folder) => {
    try {
        const octokit = createGithubClient(accessToken);

        let outputFolderDetails = {
            ...folderDetails,
            noteCount: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString() 
        }

        try {
            const metadataResponse = await octokit.request(
                "GET /repos/{owner}/{repo}/contents/{path}",
                {
                    owner,
                    repo: repoName,
                    path: `${folderDetails.id}/.kairno.json`,
                    headers: {
                        "X-GitHub-Api-Version": "2026-03-10"
                    }
                }
            );

            if (metadataResponse) {
                throw new Error("Folder with the same name already exists!");
            }
        } catch (err: any) {
            if (err.status !== 404) throw err;
        }

        const newFileInsideFolder = await octokit.request("PUT /repos/{owner}/{repo}/contents/{path}", {
            owner,
            repo: repoName,
            path: `${folderDetails.id}/.kairno.json`,

            message: `Create folder ${folderDetails.title} and metadata JSON`,

            content: toBase64(outputFolderDetails),

            headers: {
                "X-GitHub-Api-Version": "2026-03-10"
            }
        });

        if (!newFileInsideFolder) {
            throw new Error("Could not create metadata json inside folder");
        }

        return newFileInsideFolder;

    } catch (err) {
        throw new Error(
            `Failed to create a new folder: ${err instanceof Error ? err.message : 'Unknown error'}`
        );
    }
}

export default createNewFolder;