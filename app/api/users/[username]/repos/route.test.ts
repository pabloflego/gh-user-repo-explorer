import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { 
  GithubApi,
  ApiError,
  EmptyUsernameError,
  RateLimitError,
  UserNotFoundError,
} from '@/lib/application/adapters/GithubApi';
import { Logger } from '@/lib/application/adapters/Logger';

vi.mock('@/lib/application/adapters/GithubApi', async () => {
  const actual = await vi.importActual('@/lib/application/adapters/GithubApi');
  return {
    ...actual,
    GithubApi: vi.fn(),
  };
});

vi.mock('@/lib/application/adapters/Logger', () => {
  return {
    Logger: vi.fn(),
  };
});

describe('GET /api/users/[username]/repos', () => {
  let mockGetUserRepositories: ReturnType<typeof vi.fn>;
  let mockLoggerLog: ReturnType<typeof vi.fn>;
  let mockLoggerError: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetUserRepositories = vi.fn();
    mockLoggerLog = vi.fn();
    mockLoggerError = vi.fn();
    
    (GithubApi as unknown as ReturnType<typeof vi.fn>).mockImplementation(function(this: any) {
      this.getUserRepositories = mockGetUserRepositories;
    });
    
    (Logger as unknown as ReturnType<typeof vi.fn>).mockImplementation(function(this: any) {
      this.log = mockLoggerLog;
      this.error = mockLoggerError;
    });
  });

  it('should return 400 when username parameter is missing', async () => {
    const request = new Request('http://localhost:3000/api/users//repos');
    const params = Promise.resolve({ username: '' });
    
    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Username parameter is required' });
    expect(mockGetUserRepositories).not.toHaveBeenCalled();
    expect(mockLoggerError).not.toHaveBeenCalled();
  });

  it('should successfully return repositories when username is provided', async () => {
    const mockRepos = [
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

    mockGetUserRepositories.mockResolvedValue(mockRepos);

    const request = new Request('http://localhost:3000/api/users/testuser/repos');
    const params = Promise.resolve({ username: 'testuser' });
    
    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockRepos);
    expect(mockGetUserRepositories).toHaveBeenCalledWith('testuser');
    expect(mockLoggerError).not.toHaveBeenCalled();
  });

  it('should handle ApiError with correct status code', async () => {
    mockGetUserRepositories.mockRejectedValue(new ApiError('API Error', 500));

    const request = new Request('http://localhost:3000/api/users/testuser/repos');
    const params = Promise.resolve({ username: 'testuser' });
    
    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'API Error' });
    expect(Logger).toHaveBeenCalledWith('ReposAPI');
    expect(mockLoggerError).toHaveBeenCalledWith('API Error (status: 500)');
  });

  it('should handle RateLimitError with 403 status', async () => {
    mockGetUserRepositories.mockRejectedValue(new RateLimitError());

    const request = new Request('http://localhost:3000/api/users/testuser/repos');
    const params = Promise.resolve({ username: 'testuser' });
    
    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data).toEqual({ error: 'GitHub API rate limit exceeded. Please try again later.' });
    expect(Logger).toHaveBeenCalledWith('ReposAPI');
    expect(mockLoggerError).toHaveBeenCalledWith('GitHub API rate limit exceeded. Please try again later. (status: 403)');
  });

  it('should handle UserNotFoundError with 404 status', async () => {
    mockGetUserRepositories.mockRejectedValue(new UserNotFoundError());

    const request = new Request('http://localhost:3000/api/users/testuser/repos');
    const params = Promise.resolve({ username: 'testuser' });
    
    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({ error: 'User not found' });
    expect(Logger).toHaveBeenCalledWith('ReposAPI');
    expect(mockLoggerError).toHaveBeenCalledWith('User not found (status: 404)');
  });

  it('should handle EmptyUsernameError with 400 status', async () => {
    mockGetUserRepositories.mockRejectedValue(new EmptyUsernameError());

    const request = new Request('http://localhost:3000/api/users/testuser/repos');
    const params = Promise.resolve({ username: 'testuser' });
    
    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Username cannot be empty' });
    expect(Logger).toHaveBeenCalledWith('ReposAPI');
    expect(mockLoggerError).toHaveBeenCalledWith('Username cannot be empty (status: 400)');
  });

  it('should handle generic Error with 500 status', async () => {
    mockGetUserRepositories.mockRejectedValue(new Error('Network error'));

    const request = new Request('http://localhost:3000/api/users/testuser/repos');
    const params = Promise.resolve({ username: 'testuser' });
    
    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Network error' });
    expect(Logger).toHaveBeenCalledWith('ReposAPI');
    expect(mockLoggerError).toHaveBeenCalledWith('Network error (status: 500)');
  });

  it('should handle unknown error with default message', async () => {
    mockGetUserRepositories.mockRejectedValue('Unknown error');

    const request = new Request('http://localhost:3000/api/users/testuser/repos');
    const params = Promise.resolve({ username: 'testuser' });
    
    const response = await GET(request, { params });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to fetch repositories from GitHub' });
    expect(Logger).toHaveBeenCalledWith('ReposAPI');
    expect(mockLoggerError).toHaveBeenCalledWith('Failed to fetch repositories from GitHub (status: 500)');
  });

  it('should pass username parameter correctly to getUserRepositories', async () => {
    mockGetUserRepositories.mockResolvedValue([]);

    const request = new Request('http://localhost:3000/api/users/john-doe/repos');
    const params = Promise.resolve({ username: 'john-doe' });
    
    await GET(request, { params });

    expect(mockGetUserRepositories).toHaveBeenCalledWith('john-doe');
  });

  it('should create new GithubApi instance for each request', async () => {
    mockGetUserRepositories.mockResolvedValue([]);

    const request1 = new Request('http://localhost:3000/api/users/user1/repos');
    const params1 = Promise.resolve({ username: 'user1' });
    
    const request2 = new Request('http://localhost:3000/api/users/user2/repos');
    const params2 = Promise.resolve({ username: 'user2' });
    
    await GET(request1, { params: params1 });
    await GET(request2, { params: params2 });

    expect(GithubApi).toHaveBeenCalledTimes(2);
  });
});
