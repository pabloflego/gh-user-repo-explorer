import type { GitHubRepository, GitHubUser } from "@/lib/domain/GithubEntities";

export interface GitHubUserSearchResponse {
  items: GitHubUser[];
  total_count: number;
}

export interface GitHubRepositoriesResponse {
  items: GitHubRepository[];
  hasNextPage: boolean;
}

export interface GithubApiPort {
  searchUsers(query: string, limit?: number): Promise<GitHubUserSearchResponse>;
  getUserRepositories(username: string, page?: number, perPage?: number): Promise<GitHubRepositoriesResponse>;
}