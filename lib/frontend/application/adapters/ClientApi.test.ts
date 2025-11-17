import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ClientApi } from './ClientApi';
import type { BrowserHttpClientPort } from '../ports/BrowserHttpClientPort';

describe('ClientApi', () => {
  let clientApi: ClientApi;
  let mockHttpClient: BrowserHttpClientPort & ReturnType<typeof vi.fn>;

  beforeEach(() => {
    mockHttpClient = vi.fn() as BrowserHttpClientPort & ReturnType<typeof vi.fn>;
    clientApi = new ClientApi(mockHttpClient);
  });

  describe('searchUsers', () => {
    it('should fetch users successfully', async () => {
      const mockUsers = { items: [{ id: 1, login: 'testuser' }] };
      mockHttpClient.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers,
      } as Response);

      const result = await clientApi.searchUsers('testuser');

      expect(mockHttpClient).toHaveBeenCalledWith('/api/users?q=testuser');
      expect(result).toEqual(mockUsers);
    });

    it('should encode query parameter', async () => {
      const mockUsers = { items: [] };
      mockHttpClient.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers,
      } as Response);

      await clientApi.searchUsers('test user');

      expect(mockHttpClient).toHaveBeenCalledWith('/api/users?q=test%20user');
    });

    it('should handle special characters in query', async () => {
      const mockUsers = { items: [] };
      mockHttpClient.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers,
      } as Response);

      await clientApi.searchUsers('test@user#123');

      expect(mockHttpClient).toHaveBeenCalledWith('/api/users?q=test%40user%23123');
    });

    it('should throw error when response is not ok with error message', async () => {
      mockHttpClient.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'User not found' }),
      } as Response);

      await expect(clientApi.searchUsers('nonexistent')).rejects.toThrow('User not found');
    });

    it('should throw default error when response is not ok without error message', async () => {
      mockHttpClient.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      } as Response);

      await expect(clientApi.searchUsers('test')).rejects.toThrow('Failed to fetch users');
    });

    it('should handle empty query', async () => {
      const mockUsers = { items: [] };
      mockHttpClient.mockResolvedValueOnce({
        ok: true,
        json: async () => mockUsers,
      } as Response);

      await clientApi.searchUsers('');

      expect(mockHttpClient).toHaveBeenCalledWith('/api/users?q=');
    });

    it('should handle network error', async () => {
      mockHttpClient.mockRejectedValueOnce(new Error('Network error'));

      await expect(clientApi.searchUsers('test')).rejects.toThrow('Network error');
    });
  });

  describe('fetchUserRepositories', () => {
    it('should fetch user repositories successfully', async () => {
      const mockRepos = { items: [{ id: 1, name: 'repo1' }] };
      mockHttpClient.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRepos,
      } as Response);

      const result = await clientApi.fetchUserRepositories('testuser');

      expect(mockHttpClient).toHaveBeenCalledWith('/api/users/testuser/repos?page=1');
      expect(result).toEqual(mockRepos);
    });

    it('should handle username with special characters', async () => {
      const mockRepos = { items: [] };
      mockHttpClient.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRepos,
      } as Response);

      await clientApi.fetchUserRepositories('test-user');

      expect(mockHttpClient).toHaveBeenCalledWith('/api/users/test-user/repos?page=1');
    });

    it('should throw error when response is not ok with error message', async () => {
      mockHttpClient.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Repository not found' }),
      } as Response);

      await expect(clientApi.fetchUserRepositories('testuser')).rejects.toThrow('Repository not found');
    });

    it('should throw default error when response is not ok without error message', async () => {
      mockHttpClient.mockResolvedValueOnce({
        ok: false,
        json: async () => ({}),
      } as Response);

      await expect(clientApi.fetchUserRepositories('testuser')).rejects.toThrow('Failed to fetch user repositories');
    });

    it('should handle empty username', async () => {
      const mockRepos = { items: [] };
      mockHttpClient.mockResolvedValueOnce({
        ok: true,
        json: async () => mockRepos,
      } as Response);

      await clientApi.fetchUserRepositories('');

      expect(mockHttpClient).toHaveBeenCalledWith('/api/users//repos?page=1');
    });

    it('should handle network error', async () => {
      mockHttpClient.mockRejectedValueOnce(new Error('Network error'));

      await expect(clientApi.fetchUserRepositories('testuser')).rejects.toThrow('Network error');
    });

    it('should handle 404 error', async () => {
      mockHttpClient.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'Not Found' }),
      } as Response);

      await expect(clientApi.fetchUserRepositories('nonexistent')).rejects.toThrow('Not Found');
    });

    it('should handle rate limit error', async () => {
      mockHttpClient.mockResolvedValueOnce({
        ok: false,
        json: async () => ({ error: 'API rate limit exceeded' }),
      } as Response);

      await expect(clientApi.fetchUserRepositories('testuser')).rejects.toThrow('API rate limit exceeded');
    });
  });
});
