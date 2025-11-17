import { GithubApiPort, GitHubRepository, GitHubUserSearchResponse } from "@/lib/application/ports/GithubApiPort";
import { HttpClientPort } from "../ports/HttpClientPort";

export const GITHUB_API_BASE_URL = 'https://api.github.com';
export const GITHUB_API_HEADERS = {
  'Accept': 'application/vnd.github.v3+json',
  'User-Agent': 'GitHub-User-Search-App',
};

export class ApiError extends Error {
  constructor(message: string, public readonly statusCode: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export class EmptyQueryError extends Error {
  constructor(message: string = 'Search query cannot be empty') {
    super(message);
    this.name = 'EmptyQueryError';
  }
}

export class EmptyUsernameError extends Error {
  constructor(message: string = 'Username cannot be empty') {
    super(message);
    this.name = 'EmptyUsernameError';
  }
}

export class RateLimitError extends ApiError {
  constructor(message: string = 'GitHub API rate limit exceeded. Please try again later.') {
    super(message, 403);
    this.name = 'RateLimitError';
  }
}

export class InvalidQueryError extends ApiError {
  constructor(message: string = 'Invalid search query') {
    super(message, 422);
    this.name = 'InvalidQueryError';
  }
}

export class UserNotFoundError extends ApiError {
  constructor(message: string = 'User not found') {
    super(message, 404);
    this.name = 'UserNotFoundError';
  }
}

export class GithubApi implements GithubApiPort {

  constructor(
    private httpClient: HttpClientPort = fetch
  ) {}

  async searchUsers(query: string, limit: number = 5): Promise<GitHubUserSearchResponse> {
    if (!query.trim()) {
      throw new EmptyQueryError();
    }

    const url = `${GITHUB_API_BASE_URL}/search/users?q=${encodeURIComponent(query)}&per_page=${limit}`;

    const response = await this.httpClient(url, {
      headers: GITHUB_API_HEADERS,
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new RateLimitError();
      }
      if (response.status === 422) {
        throw new InvalidQueryError();
      }
      throw new ApiError(`GitHub API error: ${response.status}`, response.status);
    }

    const data: GitHubUserSearchResponse = await response.json();
    
    return {
      items: data.items,
      total_count: data.total_count,
    };
  }

  async getUserRepositories(username: string, perPage: number = 100): Promise<GitHubRepository[]> {
    if (!username.trim()) {
      throw new EmptyUsernameError();
    }

    const url = `${GITHUB_API_BASE_URL}/users/${encodeURIComponent(username)}/repos?sort=updated&per_page=${perPage}`;

    const response = await this.httpClient(url, {
      headers: GITHUB_API_HEADERS,
      next: { revalidate: 60 },
    });

    if (!response.ok) {
      if (response.status === 403) {
        throw new RateLimitError();
      }
      if (response.status === 404) {
        throw new UserNotFoundError();
      }
      throw new ApiError(`GitHub API error: ${response.status}`, response.status);
    }

    const data: GitHubRepository[] = await response.json();
    return data;
  }
}