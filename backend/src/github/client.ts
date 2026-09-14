import { Octokit } from "octokit";

const createGithubClient = (accessToken: string) => {
    return new Octokit({
        auth: accessToken
    });
}

export default createGithubClient;