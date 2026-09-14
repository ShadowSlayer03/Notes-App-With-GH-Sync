import { toJsonObject } from "../../utils/folders";
import createGithubClient from "../client";
import { metadataFileName, repoName } from "../constants";

const getFolders = async (accessToken: string, userName: string) => {
    try {
        const octokit = createGithubClient(accessToken);

        const { data } = await octokit.request(
            'GET /repos/{owner}/{repo}/contents/{path}',
            {
                owner: userName,
                repo: repoName,
                path: '',
                headers: {
                    'X-GitHub-Api-Version': '2026-03-10'
                }
            }
        );

        if (!Array.isArray(data)) {
            throw new Error('Invalid repo response from Github');
        }

        if (data.length === 0) {
            return [];
        }

        const folders = data.filter((item) => item.type === "dir");

        const metadata = await Promise.all(
            folders.map(async (folder) => {
                const { data } = await octokit.request(
                    "GET /repos/{owner}/{repo}/contents/{path}",
                    {
                        owner: userName,
                        repo: repoName,
                        path: `${folder.path}/${metadataFileName}`,
                        headers: {
                            "X-GitHub-Api-Version": "2026-03-10"
                        }
                    }
                );

                if (Array.isArray(data)) {
                    throw new Error("Expected metadata file.");
                }

                if (!("content" in data) || !data.content) {
                    throw new Error("Missing metadata content.");
                }

                return toJsonObject(data.content);
            })
        );

        return metadata;

    } catch (err) {
        throw new Error(
            `${err instanceof Error ? err.message : 'Unknown error'}`
        );
    }
};

export default getFolders;