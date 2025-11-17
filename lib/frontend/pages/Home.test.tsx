import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Home } from './Home';
import type { ClientApi } from '@/lib/frontend/application/adapters/ClientApi';

vi.mock('@/lib/frontend/ClientApiProvider', () => ({
  useClientApi: vi.fn(),
}));

import { useClientApi } from '@/lib/frontend/ClientApiProvider';

describe('Home', () => {
  let mockClientApi: ClientApi;

  beforeEach(() => {
    mockClientApi = {
      searchUsers: vi.fn(),
      fetchUserRepositories: vi.fn(),
    } as unknown as ClientApi;

    vi.mocked(useClientApi).mockReturnValue(mockClientApi);
  });

  describe('Initial State', () => {
    it('should render the search box', () => {
      render(<Home />);
      expect(screen.getByPlaceholderText('Enter username')).toBeInTheDocument();
    });

    it('should show empty state message initially', () => {
      render(<Home />);
      expect(screen.getByText('Enter a GitHub username to get started')).toBeInTheDocument();
    });

    it('should not show loading spinner initially', () => {
      render(<Home />);
      const spinner = document.querySelector('.animate-spin');
      expect(spinner).not.toBeInTheDocument();
    });

    it('should not show error message initially', () => {
      render(<Home />);
      expect(screen.queryByText(/error|failed/i)).not.toBeInTheDocument();
    });
  });

  describe('User Search', () => {
    it('should search for users when search button is clicked', async () => {
      const user = userEvent.setup();
      const mockUsers = {
        items: [
          { id: 1, login: 'testuser', avatar_url: 'https://example.com/avatar.jpg', public_repos: 10 },
        ],
      };
      vi.mocked(mockClientApi.searchUsers).mockResolvedValue(mockUsers);

      render(<Home />);

      const input = screen.getByPlaceholderText('Enter username');
      const searchButton = screen.getByRole('button', { name: /search/i });

      await user.type(input, 'testuser');
      await user.click(searchButton);

      await waitFor(() => {
        expect(mockClientApi.searchUsers).toHaveBeenCalledWith('testuser');
        expect(screen.getByText('testuser')).toBeInTheDocument();
      });
    });

    it('should show loading spinner while searching', async () => {
      const user = userEvent.setup();
      let resolveSearch: (value: any) => void;
      const searchPromise = new Promise((resolve) => {
        resolveSearch = resolve;
      });
      vi.mocked(mockClientApi.searchUsers).mockReturnValue(searchPromise as any);

      render(<Home />);

      const input = screen.getByPlaceholderText('Enter username');
      const searchButton = screen.getByRole('button', { name: /search/i });

      await user.type(input, 'testuser');
      await user.click(searchButton);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();

      resolveSearch!({ items: [] });
    });

    it('should show error message when search fails', async () => {
      const user = userEvent.setup();
      vi.mocked(mockClientApi.searchUsers).mockRejectedValue(new Error('Search failed'));

      render(<Home />);

      const input = screen.getByPlaceholderText('Enter username');
      const searchButton = screen.getByRole('button', { name: /search/i });

      await user.type(input, 'testuser');
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('Search failed')).toBeInTheDocument();
      });
    });

    it('should clear users when search query is empty', async () => {
      const user = userEvent.setup();
      const mockUsers = {
        items: [
          { id: 1, login: 'testuser', avatar_url: 'https://example.com/avatar.jpg', public_repos: 10 },
        ],
      };
      vi.mocked(mockClientApi.searchUsers).mockResolvedValue(mockUsers);

      render(<Home />);

      const input = screen.getByPlaceholderText('Enter username');
      const searchButton = screen.getByRole('button', { name: /search/i });

      // First search
      await user.type(input, 'testuser');
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('testuser')).toBeInTheDocument();
      });

      // Clear and search again
      await user.clear(input);
      await user.click(searchButton);

      expect(mockClientApi.searchUsers).toHaveBeenCalledTimes(1);
      expect(screen.queryByText('testuser')).not.toBeInTheDocument();
    });

    it('should not search when query is only whitespace', async () => {
      const user = userEvent.setup();
      render(<Home />);

      const input = screen.getByPlaceholderText('Enter username');
      const searchButton = screen.getByRole('button', { name: /search/i });

      await user.type(input, '   ');
      await user.click(searchButton);

      expect(mockClientApi.searchUsers).not.toHaveBeenCalled();
    });
  });

  describe('User Selection and Repository Loading', () => {
    it('should load repositories when user is clicked', async () => {
      const user = userEvent.setup();
      const mockUsers = {
        items: [
          { id: 1, login: 'testuser', avatar_url: 'https://example.com/avatar.jpg', public_repos: 10 },
        ],
      };
      const mockRepos = {
        items: [
          { id: 1, name: 'repo1', html_url: 'https://github.com/testuser/repo1', description: 'Test repo' },
        ],
        hasNextPage: false,
      };
      vi.mocked(mockClientApi.searchUsers).mockResolvedValue(mockUsers);
      vi.mocked(mockClientApi.fetchUserRepositories).mockResolvedValue(mockRepos);

      render(<Home />);

      const input = screen.getByPlaceholderText('Enter username');
      const searchButton = screen.getByRole('button', { name: /search/i });

      await user.type(input, 'testuser');
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('testuser')).toBeInTheDocument();
      });

      const userButton = screen.getByText('testuser');
      await user.click(userButton);

      await waitFor(() => {
        expect(mockClientApi.fetchUserRepositories).toHaveBeenCalledWith('testuser', 1);
        expect(screen.getByText('repo1')).toBeInTheDocument();
      });
    });

    it('should collapse repositories when user is clicked again', async () => {
      const user = userEvent.setup();
      const mockUsers = {
        items: [
          { id: 1, login: 'testuser', avatar_url: 'https://example.com/avatar.jpg', public_repos: 10 },
        ],
      };
      const mockRepos = {
        items: [
          { id: 1, name: 'repo1', html_url: 'https://github.com/testuser/repo1', description: 'Test repo' },
        ],
        hasNextPage: false,
      };
      vi.mocked(mockClientApi.searchUsers).mockResolvedValue(mockUsers);
      vi.mocked(mockClientApi.fetchUserRepositories).mockResolvedValue(mockRepos);

      render(<Home />);

      const input = screen.getByPlaceholderText('Enter username');
      const searchButton = screen.getByRole('button', { name: /search/i });

      await user.type(input, 'testuser');
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('testuser')).toBeInTheDocument();
      });

      const userButton = screen.getByText('testuser');
      await user.click(userButton);

      await waitFor(() => {
        expect(screen.getByText('repo1')).toBeInTheDocument();
      });

      // Click again to collapse
      await user.click(userButton);

      await waitFor(() => {
        expect(screen.queryByText('repo1')).not.toBeInTheDocument();
      });
    });

    it('should show error when repository loading fails', async () => {
      const user = userEvent.setup();
      const mockUsers = {
        items: [
          { id: 1, login: 'testuser', avatar_url: 'https://example.com/avatar.jpg', public_repos: 10 },
        ],
      };
      vi.mocked(mockClientApi.searchUsers).mockResolvedValue(mockUsers);
      vi.mocked(mockClientApi.fetchUserRepositories).mockRejectedValue(new Error('Failed to fetch repositories'));

      render(<Home />);

      const input = screen.getByPlaceholderText('Enter username');
      const searchButton = screen.getByRole('button', { name: /search/i });

      await user.type(input, 'testuser');
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('testuser')).toBeInTheDocument();
      });

      const userButton = screen.getByText('testuser');
      await user.click(userButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to fetch repositories')).toBeInTheDocument();
      });
    });
  });

  describe('Pagination', () => {
    it('should load more repositories when Load More is clicked', async () => {
      const user = userEvent.setup();
      const mockUsers = {
        items: [
          { id: 1, login: 'testuser', avatar_url: 'https://example.com/avatar.jpg', public_repos: 60 },
        ],
      };
      const mockReposPage1 = {
        items: [
          { id: 1, name: 'repo1', html_url: 'https://github.com/testuser/repo1', description: 'Test repo 1' },
        ],
        hasNextPage: true,
      };
      const mockReposPage2 = {
        items: [
          { id: 2, name: 'repo2', html_url: 'https://github.com/testuser/repo2', description: 'Test repo 2' },
        ],
        hasNextPage: false,
      };
      vi.mocked(mockClientApi.searchUsers).mockResolvedValue(mockUsers);
      vi.mocked(mockClientApi.fetchUserRepositories)
        .mockResolvedValueOnce(mockReposPage1)
        .mockResolvedValueOnce(mockReposPage2);

      render(<Home />);

      const input = screen.getByPlaceholderText('Enter username');
      const searchButton = screen.getByRole('button', { name: /search/i });

      await user.type(input, 'testuser');
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('testuser')).toBeInTheDocument();
      });

      const userButton = screen.getByText('testuser');
      await user.click(userButton);

      await waitFor(() => {
        expect(screen.getByText('repo1')).toBeInTheDocument();
        expect(screen.getByText(/load more/i)).toBeInTheDocument();
      });

      const loadMoreButton = screen.getByText(/load more/i);
      await user.click(loadMoreButton);

      await waitFor(() => {
        expect(mockClientApi.fetchUserRepositories).toHaveBeenCalledWith('testuser', 2);
        expect(screen.getByText('repo1')).toBeInTheDocument();
        expect(screen.getByText('repo2')).toBeInTheDocument();
      });
    });

    it('should hide Load More button when there are no more pages', async () => {
      const user = userEvent.setup();
      const mockUsers = {
        items: [
          { id: 1, login: 'testuser', avatar_url: 'https://example.com/avatar.jpg', public_repos: 10 },
        ],
      };
      const mockRepos = {
        items: [
          { id: 1, name: 'repo1', html_url: 'https://github.com/testuser/repo1', description: 'Test repo' },
        ],
        hasNextPage: false,
      };
      vi.mocked(mockClientApi.searchUsers).mockResolvedValue(mockUsers);
      vi.mocked(mockClientApi.fetchUserRepositories).mockResolvedValue(mockRepos);

      render(<Home />);

      const input = screen.getByPlaceholderText('Enter username');
      const searchButton = screen.getByRole('button', { name: /search/i });

      await user.type(input, 'testuser');
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('testuser')).toBeInTheDocument();
      });

      const userButton = screen.getByText('testuser');
      await user.click(userButton);

      await waitFor(() => {
        expect(screen.getByText('repo1')).toBeInTheDocument();
        expect(screen.queryByText(/load more/i)).not.toBeInTheDocument();
      });
    });

    it('should show loading spinner when loading more repositories', async () => {
      const user = userEvent.setup();
      const mockUsers = {
        items: [
          { id: 1, login: 'testuser', avatar_url: 'https://example.com/avatar.jpg', public_repos: 60 },
        ],
      };
      const mockReposPage1 = {
        items: [
          { id: 1, name: 'repo1', html_url: 'https://github.com/testuser/repo1', description: 'Test repo 1' },
        ],
        hasNextPage: true,
      };
      let resolveLoadMore: (value: any) => void;
      const loadMorePromise = new Promise((resolve) => {
        resolveLoadMore = resolve;
      });

      vi.mocked(mockClientApi.searchUsers).mockResolvedValue(mockUsers);
      vi.mocked(mockClientApi.fetchUserRepositories)
        .mockResolvedValueOnce(mockReposPage1)
        .mockReturnValueOnce(loadMorePromise as any);

      render(<Home />);

      const input = screen.getByPlaceholderText('Enter username');
      const searchButton = screen.getByRole('button', { name: /search/i });

      await user.type(input, 'testuser');
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('testuser')).toBeInTheDocument();
      });

      const userButton = screen.getByText('testuser');
      await user.click(userButton);

      await waitFor(() => {
        expect(screen.getByText(/load more/i)).toBeInTheDocument();
      });

      const loadMoreButton = screen.getByText(/load more/i);
      await user.click(loadMoreButton);

      const spinner = document.querySelector('.animate-spin');
      expect(spinner).toBeInTheDocument();

      resolveLoadMore!({ items: [], hasNextPage: false });
    });

    it('should show error when loading more repositories fails', async () => {
      const user = userEvent.setup();
      const mockUsers = {
        items: [
          { id: 1, login: 'testuser', avatar_url: 'https://example.com/avatar.jpg', public_repos: 60 },
        ],
      };
      const mockReposPage1 = {
        items: [
          { id: 1, name: 'repo1', html_url: 'https://github.com/testuser/repo1', description: 'Test repo 1' },
        ],
        hasNextPage: true,
      };
      vi.mocked(mockClientApi.searchUsers).mockResolvedValue(mockUsers);
      vi.mocked(mockClientApi.fetchUserRepositories)
        .mockResolvedValueOnce(mockReposPage1)
        .mockRejectedValueOnce(new Error('Failed to load more repositories'));

      render(<Home />);

      const input = screen.getByPlaceholderText('Enter username');
      const searchButton = screen.getByRole('button', { name: /search/i });

      await user.type(input, 'testuser');
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('testuser')).toBeInTheDocument();
      });

      const userButton = screen.getByText('testuser');
      await user.click(userButton);

      await waitFor(() => {
        expect(screen.getByText(/load more/i)).toBeInTheDocument();
      });

      const loadMoreButton = screen.getByText(/load more/i);
      await user.click(loadMoreButton);

      await waitFor(() => {
        expect(screen.getByText('Failed to load more repositories')).toBeInTheDocument();
      });
    });

    it('should reset pagination when selecting a different user', async () => {
      const user = userEvent.setup();
      const mockUsers = {
        items: [
          { id: 1, login: 'user1', avatar_url: 'https://example.com/avatar1.jpg', public_repos: 60 },
          { id: 2, login: 'user2', avatar_url: 'https://example.com/avatar2.jpg', public_repos: 30 },
        ],
      };
      const mockReposUser1Page1 = {
        items: [
          { id: 1, name: 'repo1', html_url: 'https://github.com/user1/repo1', description: 'Test repo 1' },
        ],
        hasNextPage: true,
      };
      const mockReposUser1Page2 = {
        items: [
          { id: 2, name: 'repo2', html_url: 'https://github.com/user1/repo2', description: 'Test repo 2' },
        ],
        hasNextPage: false,
      };
      const mockReposUser2 = {
        items: [
          { id: 3, name: 'repo3', html_url: 'https://github.com/user2/repo3', description: 'Test repo 3' },
        ],
        hasNextPage: false,
      };
      vi.mocked(mockClientApi.searchUsers).mockResolvedValue(mockUsers);
      vi.mocked(mockClientApi.fetchUserRepositories)
        .mockResolvedValueOnce(mockReposUser1Page1)
        .mockResolvedValueOnce(mockReposUser1Page2)
        .mockResolvedValueOnce(mockReposUser2);

      render(<Home />);

      const input = screen.getByPlaceholderText('Enter username');
      const searchButton = screen.getByRole('button', { name: /search/i });

      await user.type(input, 'user');
      await user.click(searchButton);

      await waitFor(() => {
        expect(screen.getByText('user1')).toBeInTheDocument();
      });

      // Select first user
      const user1Button = screen.getByText('user1');
      await user.click(user1Button);

      await waitFor(() => {
        expect(screen.getByText('repo1')).toBeInTheDocument();
      });

      // Load more for first user
      const loadMoreButton = screen.getByText(/load more/i);
      await user.click(loadMoreButton);

      await waitFor(() => {
        expect(screen.getByText('repo2')).toBeInTheDocument();
      });

      // Select second user
      const user2Button = screen.getByText('user2');
      await user.click(user2Button);

      await waitFor(() => {
        expect(mockClientApi.fetchUserRepositories).toHaveBeenCalledWith('user2', 1);
        expect(screen.getByText('repo3')).toBeInTheDocument();
        expect(screen.queryByText('repo1')).not.toBeInTheDocument();
        expect(screen.queryByText('repo2')).not.toBeInTheDocument();
      });
    });
  });
});
