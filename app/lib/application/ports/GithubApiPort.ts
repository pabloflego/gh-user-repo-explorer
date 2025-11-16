export interface GitHubUser {
  id: number;
  login: string;
  avatar_url: string;
  html_url: string;
  name?: string;
  bio?: string;
  public_repos?: number;
  followers?: number;
  following?: number;
}

export interface GitHubRepository {
  id: number;
  name: string;
  full_name: string;
  description: string | null;
  html_url: string;
  stargazers_count: number;
  forks_count: number;
  language: string | null;
  updated_at: string;
  topics?: string[];
}

export interface GitHubUserSearchResponse {
  items: GitHubUser[];
  total_count: number;
}

export interface GithubApiPort {
  searchUsers(query: string, limit?: number): Promise<GitHubUserSearchResponse>;
  getUserRepositories(username: string, perPage?: number): Promise<GitHubRepository[]>;
}