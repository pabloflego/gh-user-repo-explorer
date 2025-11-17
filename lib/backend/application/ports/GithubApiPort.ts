import { GitHubUserSearchResponse, GitHubRepository } from "@/lib/domain/GithubEntities";

export interface GithubApiPort {
  searchUsers(query: string, limit?: number): Promise<GitHubUserSearchResponse>;
  getUserRepositories(username: string, perPage?: number): Promise<GitHubRepository[]>;
}