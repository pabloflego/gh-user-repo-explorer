import { describe, it, expect, vi, beforeEach } from 'vitest';
import { 
  GithubApi, 
  ApiError, 
  EmptyQueryError, 
  EmptyUsernameError, 
  RateLimitError, 
  InvalidQueryError, 
  UserNotFoundError,
  GITHUB_API_BASE_URL,
  GITHUB_API_HEADERS
} from './GithubApi';
import { GitHubUserSearchResponse, GitHubRepository } from '@/lib/application/ports/GithubApiPort';
import { HttpClientPort } from '@/lib/application/ports/HttpClientPort';

describe('GithubApi', () => {
  let mockHttpClient: HttpClientPort & ReturnType<typeof vi.fn>;
  let githubApi: GithubApi;

  beforeEach(() => {
    mockHttpClient = vi.fn() as HttpClientPort & ReturnType<typeof vi.fn>;
    githubApi = new GithubApi(mockHttpClient);
  });

  describe('searchUsers', () => {
    it('should successfully search for users', async () => {
      const mockResponse: GitHubUserSearchResponse = {
        items: [
          {
            id: 1,
            login: 'testuser',
            avatar_url: 'https://example.com/avatar.jpg',
            html_url: 'https://github.com/testuser',
          },
        ],
        total_count: 1,
      };

      mockHttpClient.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      const result = await githubApi.searchUsers('testuser');

      expect(mockHttpClient).toHaveBeenCalledWith(
        `${GITHUB_API_BASE_URL}/search/users?q=testuser&per_page=5`,
        expect.objectContaining({
          headers: GITHUB_API_HEADERS,
        })
      );
      expect(result).toEqual(mockResponse);
    });

    it('should apply custom limit parameter', async () => {
      const mockResponse: GitHubUserSearchResponse = {
        items: [],
        total_count: 0,
      };

      mockHttpClient.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await githubApi.searchUsers('testuser', 10);

      expect(mockHttpClient).toHaveBeenCalledWith(
        `${GITHUB_API_BASE_URL}/search/users?q=testuser&per_page=10`,
        expect.any(Object)
      );
    });

    it('should encode special characters in query', async () => {
      const mockResponse: GitHubUserSearchResponse = {
        items: [],
        total_count: 0,
      };

      mockHttpClient.mockResolvedValue({
        ok: true,
        json: async () => mockResponse,
      });

      await githubApi.searchUsers('user name+special');

      expect(mockHttpClient).toHaveBeenCalledWith(
        expect.stringContaining('user%20name%2Bspecial'),
        expect.any(Object)
      );
    });

    it('should throw EmptyQueryError when query is empty', async () => {
      await expect(githubApi.searchUsers('')).rejects.toThrow(EmptyQueryError);
      expect(mockHttpClient).not.toHaveBeenCalled();
    });

    it('should throw EmptyQueryError when query is only whitespace', async () => {
      await expect(githubApi.searchUsers('   ')).rejects.toThrow(EmptyQueryError);
      expect(mockHttpClient).not.toHaveBeenCalled();
    });

    it('should throw RateLimitError when response status is 403', async () => {
      mockHttpClient.mockResolvedValue({
        ok: false,
        status: 403,
      });

      await expect(githubApi.searchUsers('testuser')).rejects.toThrow(RateLimitError);
    });

    it('should throw InvalidQueryError when response status is 422', async () => {
      mockHttpClient.mockResolvedValue({
        ok: false,
        status: 422,
      });

      await expect(githubApi.searchUsers('testuser')).rejects.toThrow(InvalidQueryError);
    });

    it('should throw ApiError for other error status codes', async () => {
      mockHttpClient.mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(githubApi.searchUsers('testuser')).rejects.toThrow(ApiError);
      await expect(githubApi.searchUsers('testuser')).rejects.toThrow('GitHub API error: 500');
    });
  });

  describe('getUserRepositories', () => {
    it('should successfully fetch user repositories', async () => {
      const mockRepos: GitHubRepository[] = [
        {
          id: 1,
          name: 'repo1',
          full_name: 'testuser/repo1',
          description: 'Test repository',
          html_url: 'https://github.com/testuser/repo1',
          stargazers_count: 10,
          forks_count: 5,
          language: 'TypeScript',
          updated_at: '2025-01-01T00:00:00Z',
        },
      ];

      mockHttpClient.mockResolvedValue({
        ok: true,
        json: async () => mockRepos,
        headers: new Headers(),
      });

      const result = await githubApi.getUserRepositories('testuser');

      expect(mockHttpClient).toHaveBeenCalledWith(
        `${GITHUB_API_BASE_URL}/users/testuser/repos?sort=full_name&page=1&per_page=30`,
        expect.objectContaining({
          headers: GITHUB_API_HEADERS,
        })
      );
      expect(result).toEqual({ items: mockRepos, hasNextPage: false });
    });

    it('should apply custom perPage parameter', async () => {
      mockHttpClient.mockResolvedValue({
        ok: true,
        json: async () => [],
        headers: new Headers(),
      });

      await githubApi.getUserRepositories('testuser', 2, 50);

      expect(mockHttpClient).toHaveBeenCalledWith(
        `${GITHUB_API_BASE_URL}/users/testuser/repos?sort=full_name&page=2&per_page=50`,
        expect.any(Object)
      );
    });

    it('should encode special characters in username', async () => {
      mockHttpClient.mockResolvedValue({
        ok: true,
        json: async () => [],
        headers: new Headers(),
      });

      await githubApi.getUserRepositories('user-name+special');

      expect(mockHttpClient).toHaveBeenCalledWith(
        expect.stringContaining('user-name%2Bspecial'),
        expect.any(Object)
      );
    });

    it('should throw EmptyUsernameError when username is empty', async () => {
      await expect(githubApi.getUserRepositories('')).rejects.toThrow(EmptyUsernameError);
      expect(mockHttpClient).not.toHaveBeenCalled();
    });

    it('should throw EmptyUsernameError when username is only whitespace', async () => {
      await expect(githubApi.getUserRepositories('   ')).rejects.toThrow(EmptyUsernameError);
      expect(mockHttpClient).not.toHaveBeenCalled();
    });

    it('should throw RateLimitError when response status is 403', async () => {
      mockHttpClient.mockResolvedValue({
        ok: false,
        status: 403,
      });

      await expect(githubApi.getUserRepositories('testuser')).rejects.toThrow(RateLimitError);
    });

    it('should throw UserNotFoundError when response status is 404', async () => {
      mockHttpClient.mockResolvedValue({
        ok: false,
        status: 404,
      });

      await expect(githubApi.getUserRepositories('testuser')).rejects.toThrow(UserNotFoundError);
    });

    it('should throw ApiError for other error status codes', async () => {
      mockHttpClient.mockResolvedValue({
        ok: false,
        status: 500,
      });

      await expect(githubApi.getUserRepositories('testuser')).rejects.toThrow(ApiError);
      await expect(githubApi.getUserRepositories('testuser')).rejects.toThrow('GitHub API error: 500');
    });

    it('should detect next page from Link header', async () => {
      const headers = new Headers();
      headers.set('Link', '<https://api.github.com/user/repos?page=2>; rel="next", <https://api.github.com/user/repos?page=3>; rel="last"');

      mockHttpClient.mockResolvedValue({
        ok: true,
        json: async () => [],
        headers,
      });

      const result = await githubApi.getUserRepositories('testuser');
      expect(result.hasNextPage).toBe(true);
    });

    it('should return hasNextPage false when no Link header', async () => {
      mockHttpClient.mockResolvedValue({
        ok: true,
        json: async () => [],
        headers: new Headers(),
      });

      const result = await githubApi.getUserRepositories('testuser');
      expect(result.hasNextPage).toBe(false);
    });
  });

  describe('Custom Error Classes', () => {
    it('ApiError should have correct properties', () => {
      const error = new ApiError('Test error', 500);
      expect(error.name).toBe('ApiError');
      expect(error.message).toBe('Test error');
      expect(error.statusCode).toBe(500);
      expect(error).toBeInstanceOf(Error);
    });

    it('EmptyQueryError should have correct properties', () => {
      const error = new EmptyQueryError();
      expect(error.name).toBe('EmptyQueryError');
      expect(error.message).toBe('Search query cannot be empty');
      expect(error).toBeInstanceOf(Error);
    });

    it('EmptyQueryError should accept custom message', () => {
      const error = new EmptyQueryError('Custom message');
      expect(error.message).toBe('Custom message');
    });

    it('EmptyUsernameError should have correct properties', () => {
      const error = new EmptyUsernameError();
      expect(error.name).toBe('EmptyUsernameError');
      expect(error.message).toBe('Username cannot be empty');
      expect(error).toBeInstanceOf(Error);
    });

    it('EmptyUsernameError should accept custom message', () => {
      const error = new EmptyUsernameError('Custom message');
      expect(error.message).toBe('Custom message');
    });

    it('RateLimitError should have correct properties', () => {
      const error = new RateLimitError();
      expect(error.name).toBe('RateLimitError');
      expect(error.statusCode).toBe(403);
      expect(error.message).toBe('GitHub API rate limit exceeded. Please try again later.');
      expect(error).toBeInstanceOf(ApiError);
    });

    it('RateLimitError should accept custom message', () => {
      const error = new RateLimitError('Custom rate limit message');
      expect(error.message).toBe('Custom rate limit message');
      expect(error.statusCode).toBe(403);
    });

    it('InvalidQueryError should have correct properties', () => {
      const error = new InvalidQueryError();
      expect(error.name).toBe('InvalidQueryError');
      expect(error.statusCode).toBe(422);
      expect(error.message).toBe('Invalid search query');
      expect(error).toBeInstanceOf(ApiError);
    });

    it('InvalidQueryError should accept custom message', () => {
      const error = new InvalidQueryError('Custom invalid query message');
      expect(error.message).toBe('Custom invalid query message');
      expect(error.statusCode).toBe(422);
    });

    it('UserNotFoundError should have correct properties', () => {
      const error = new UserNotFoundError();
      expect(error.name).toBe('UserNotFoundError');
      expect(error.statusCode).toBe(404);
      expect(error.message).toBe('User not found');
      expect(error).toBeInstanceOf(ApiError);
    });

    it('UserNotFoundError should accept custom message', () => {
      const error = new UserNotFoundError('Custom user not found message');
      expect(error.message).toBe('Custom user not found message');
      expect(error.statusCode).toBe(404);
    });
  });
});
