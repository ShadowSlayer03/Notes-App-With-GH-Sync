import { DeletedNote } from "../../schema/DeletedNoteSchema";
import { base64ToString, createOrUpdateFrontMatter, rawContentToDetails, stringToBase64 } from "../../utils/notes";
import createGithubClient from "../client";
import { repoName } from "../constants";

const checkCommitAndRestoreDeletedNote = async (accessToken: string, userName: string, deletedNoteData: DeletedNote) => {
    try {
        const octokit = createGithubClient(accessToken);

        const { title, folder, deleteCommitSha, previousCommitSha, restoreAsTitle } = deletedNoteData;

        const filePath = `${folder}/${title}.md`;

        // SELFNOTE: Get delete commit details to see if the deleted note was actually deleted in this particular commit
        const deletedCommitDetails = await octokit.request("GET /repos/{owner}/{repo}/commits/{ref}", {
            owner: userName,
            repo: repoName,
            ref: deleteCommitSha,
            headers: {
                "X-GitHub-Api-Version": "2026-03-10"
            }
        });

        if (!deletedCommitDetails.data || !deletedCommitDetails.data.files || deletedCommitDetails?.data.files?.length == 0) {
            throw new Error(
                "Delete commit is invalid or contains no file changes!"
            );
        }

        const deletedFile = deletedCommitDetails?.data?.files.find(
            (file) =>
                file.filename === filePath &&
                file.status === "removed"
        );

        if (!deletedFile) {
            throw new Error(
                `Deleted note ${filePath} was not found in the deletion commit!`
            );
        }

        // SELFNOTE: Get the previous state/content of the file before deletion from the previousCommitSha
        const { data: previousFile } = await octokit.request(
            "GET /repos/{owner}/{repo}/contents/{path}",
            {
                owner: userName,
                repo: repoName,
                path: filePath,
                ref: previousCommitSha,
                headers: {
                    "X-GitHub-Api-Version": "2026-03-10"
                }
            }
        );

        if (Array.isArray(previousFile)) {
            throw new Error(
                "Expected a file but GitHub returned a directory!"
            );
        }

        if (previousFile.type !== "file") {
            throw new Error(
                "The deleted note was not a file in the previous commit!"
            );
        }

        if (!previousFile.content) {
            throw new Error(
                "Previous note content was not returned by GitHub!"
            );
        }

        const notePath = restoreAsTitle ? `${folder}/${restoreAsTitle}.md` : filePath;

        let contentToBeRestored: string = previousFile.content;

        if (restoreAsTitle) {
            const decodedFileContent = base64ToString(previousFile.content);
            let { frontMatter, content } = rawContentToDetails(decodedFileContent);

            frontMatter = {
                ...frontMatter,
                title: restoreAsTitle
            }

            const updatedContent = createOrUpdateFrontMatter(content, frontMatter);
            contentToBeRestored = stringToBase64(updatedContent);
        }

        // SELFNOTE: Use the content in base64 to create a new file in the same folder
        const { data: restoredFile } = await octokit.request('PUT /repos/{owner}/{repo}/contents/{path}', {
            owner: userName,
            repo: repoName,
            path: notePath,
            message: restoreAsTitle
                ? `Restored deleted note ${title} as ${restoreAsTitle} in ${folder}`
                : `Restored deleted note ${title} in ${folder}`,
            content: contentToBeRestored,
            headers: {
                'X-GitHub-Api-Version': '2026-03-10'
            }
        });

        return {
            previousFile,
            restoredFile
        }

    } catch (err) {
        throw new Error(
            err instanceof Error ? err.message : "Unknown error"
        );
    }
}

export default checkCommitAndRestoreDeletedNote;