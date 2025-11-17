import type { GitHubRepository, GitHubUser } from "@/lib/domain/GithubEntities";

export interface GitHubUserSearchResponse {
  items: GitHubUser[];
  total_count: number;
}

export interface GitHubRepositoriesResponse {
  items: GitHubRepository[];
  hasNextPage: boolean;
}

export interface ClientApiPort {
  searchUsers(query: string): Promise<GitHubUserSearchResponse>;
  fetchUserRepositories(username: string, page?: number): Promise<GitHubRepositoriesResponse>;
}