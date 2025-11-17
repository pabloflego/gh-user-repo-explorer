import { GitHubRepository, GitHubUserSearchResponse } from "@/lib/domain/GithubEntities";

export interface ClientApiPort {
  searchUsers(query: string): Promise<GitHubUserSearchResponse>;
  fetchUserRepositories(username: string): Promise<GitHubRepository[]>;
}