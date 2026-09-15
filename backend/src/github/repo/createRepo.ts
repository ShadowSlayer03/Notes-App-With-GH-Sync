import { Context } from "hono";
import createGithubClient from "../client";
import { repoName } from "../constants";

async function createRepo(accessToken: string) {
    try {
        const octokit = createGithubClient(accessToken);

        const { data } = await octokit.request('POST /user/repos', {
            name: repoName,
            'private': true,
            description: 'Git native notes stored in GitHub and managed by Kairno',
            auto_init: true,
            headers: {
                'X-GitHub-Api-Version': '2026-03-10'
            }
        });

        const repoResponse = {
            id: data.id,
            name: data.name,
            url: data.html_url,
            isPrivate: data.private
        }

        return repoResponse;
    } catch (err) {
        throw new Error(
            `Failed to create repository: ${err instanceof Error ? err.message : 'Unknown error'}`
        );
    }
}

export default createRepo;