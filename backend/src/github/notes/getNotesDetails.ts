import matter from "@11ty/gray-matter";
import createGithubClient from "../client";
import { repoName } from "../constants";

const getNotesDetails = async (
	accessToken: string,
	userName: string,
	folderId: string
) => {
	try {
		const octokit = createGithubClient(accessToken);

		const { data } = await octokit.request(
			"GET /repos/{owner}/{repo}/contents/{path}",
			{
				owner: userName,
				repo: repoName,
				path: folderId,
				headers: {
					"X-GitHub-Api-Version": "2026-03-10"
				}
			}
		);

		if (!Array.isArray(data)) {
			return [];
		}

		return await Promise.all(
			data
				.filter(
					(item) =>
						item.type === "file" &&
						item.name.endsWith(".md")
				)
				.map(async (note) => {
					const response = await fetch(note.download_url!);

					if (!response.ok) {
						throw new Error(
							`Failed to fetch ${note.name}`
						);
					}

					const markdown = await response.text();

					const { data: frontmatter } = matter(markdown);

					return frontmatter;
				})
		);
	} catch (err) {
		throw new Error(
			err instanceof Error ? err.message : "Unknown error"
		);
	}
};

export default getNotesDetails;