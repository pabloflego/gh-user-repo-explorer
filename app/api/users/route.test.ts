import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from './route';
import { GithubApi, RateLimitError, InvalidQueryError, EmptyQueryError, ApiError } from '@/lib/backend/application/adapters/GithubApi';
import { Logger } from '@/lib/backend/application/adapters/Logger';

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

describe('GET /api/users', () => {
  let mockSearchUsers: ReturnType<typeof vi.fn>;
  let mockLoggerLog: ReturnType<typeof vi.fn>;
  let mockLoggerError: ReturnType<typeof vi.fn>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockSearchUsers = vi.fn();
    mockLoggerLog = vi.fn();
    mockLoggerError = vi.fn();
    
    (GithubApi as unknown as ReturnType<typeof vi.fn>).mockImplementation(function(this: any) {
      this.searchUsers = mockSearchUsers;
    });
    
    (Logger as unknown as ReturnType<typeof vi.fn>).mockImplementation(function(this: any) {
      this.log = mockLoggerLog;
      this.error = mockLoggerError;
    });
  });

  it('should return 400 when query parameter is missing', async () => {
    const request = new Request('http://localhost:3000/api/users');
    
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Query parameter "q" is required' });
    expect(mockSearchUsers).not.toHaveBeenCalled();
    expect(mockLoggerError).not.toHaveBeenCalled();
  });

  it('should successfully return users when query is provided', async () => {
    const mockUsers = {
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

    mockSearchUsers.mockResolvedValue(mockUsers);

    const request = new Request('http://localhost:3000/api/users?q=testuser');
    
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockUsers);
    expect(mockSearchUsers).toHaveBeenCalledWith('testuser', 5);
    expect(mockLoggerError).not.toHaveBeenCalled();
  });

  it('should handle ApiError with correct status code', async () => {
    mockSearchUsers.mockRejectedValue(new ApiError('API Error', 500));

    const request = new Request('http://localhost:3000/api/users?q=testuser');
    
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'API Error' });
    expect(Logger).toHaveBeenCalledWith('UserAPI');
    expect(mockLoggerError).toHaveBeenCalledWith('API Error (status: 500)');
  });

  it('should handle RateLimitError with 403 status', async () => {
    mockSearchUsers.mockRejectedValue(new RateLimitError());

    const request = new Request('http://localhost:3000/api/users?q=testuser');
    
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(403);
    expect(data).toEqual({ error: 'GitHub API rate limit exceeded. Please try again later.' });
    expect(Logger).toHaveBeenCalledWith('UserAPI');
    expect(mockLoggerError).toHaveBeenCalledWith('GitHub API rate limit exceeded. Please try again later. (status: 403)');
  });

  it('should handle InvalidQueryError with 422 status', async () => {
    mockSearchUsers.mockRejectedValue(new InvalidQueryError());

    const request = new Request('http://localhost:3000/api/users?q=testuser');
    
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(422);
    expect(data).toEqual({ error: 'Invalid search query' });
    expect(Logger).toHaveBeenCalledWith('UserAPI');
    expect(mockLoggerError).toHaveBeenCalledWith('Invalid search query (status: 422)');
  });

  it('should handle EmptyQueryError with 400 status', async () => {
    mockSearchUsers.mockRejectedValue(new EmptyQueryError());

    const request = new Request('http://localhost:3000/api/users?q=testuser');
    
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Search query cannot be empty' });
    expect(Logger).toHaveBeenCalledWith('UserAPI');
    expect(mockLoggerError).toHaveBeenCalledWith('Search query cannot be empty (status: 400)');
  });

  it('should handle generic Error with 500 status', async () => {
    mockSearchUsers.mockRejectedValue(new Error('Network error'));

    const request = new Request('http://localhost:3000/api/users?q=testuser');
    
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Network error' });
    expect(Logger).toHaveBeenCalledWith('UserAPI');
    expect(mockLoggerError).toHaveBeenCalledWith('Network error (status: 500)');
  });

  it('should handle unknown error with default message', async () => {
    mockSearchUsers.mockRejectedValue('Unknown error');

    const request = new Request('http://localhost:3000/api/users?q=testuser');
    
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual({ error: 'Failed to fetch users from GitHub' });
    expect(Logger).toHaveBeenCalledWith('UserAPI');
    expect(mockLoggerError).toHaveBeenCalledWith('Failed to fetch users from GitHub (status: 500)');
  });

  it('should handle empty query string parameter', async () => {
    const request = new Request('http://localhost:3000/api/users?q=');
    
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({ error: 'Query parameter "q" is required' });
    expect(mockSearchUsers).not.toHaveBeenCalled();
    expect(mockLoggerError).not.toHaveBeenCalled();
  });

  it('should pass query parameter correctly to searchUsers', async () => {
    const mockUsers = {
      items: [],
      total_count: 0,
    };

    mockSearchUsers.mockResolvedValue(mockUsers);

    const request = new Request('http://localhost:3000/api/users?q=john+doe');
    
    await GET(request);

    expect(mockSearchUsers).toHaveBeenCalledWith('john doe', 5);
  });

  it('should create new GitHubApi instance for each request', async () => {
    mockSearchUsers.mockResolvedValue({ items: [], total_count: 0 });

    const request1 = new Request('http://localhost:3000/api/users?q=user1');
    const request2 = new Request('http://localhost:3000/api/users?q=user2');
    
    await GET(request1);
    await GET(request2);

    expect(GithubApi).toHaveBeenCalledTimes(2);
  });
});
