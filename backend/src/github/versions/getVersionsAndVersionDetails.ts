import { repoName } from "../constants";

// Not using Octokit here since it would be restricted due to CF workers bottleneck
async function getVersionsAndVersionDetails(
    token: string,
    userName: string,
    folderId: string,
    noteId: string
) {
    const path = `${folderId}/${noteId}.md`;

    const url = new URL(
        `https://api.github.com/repos/${encodeURIComponent(userName)}/${encodeURIComponent(repoName)}/commits`
    );

    url.searchParams.set("path", path);
    url.searchParams.set("per_page", "100");

    const response = await fetch(url, {
        method: "GET",
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/vnd.github+json",
            "X-GitHub-Api-Version": "2026-03-10",
            "User-Agent": "Kairno"
        }
    });

    if (!response.ok) {
        const body = await response.text();

        throw new Error(
            `GitHub API error ${response.status}: ${body}`
        );
    }

    const commits = await response.json() as Array<{
        sha: string;
        commit: {
            message: string;
            committer?: {
                date?: string | null;
            } | null;
        };
        committer?: {
            login?: string | null;
        } | null;
    }>;

    return commits.map((commit) => ({
        sha: commit.sha,
        label: commit.commit.message,
        date: commit.commit.committer?.date,
        committerUsername: commit.committer?.login
    }));
}

export default getVersionsAndVersionDetails;