import type { GithubApiPort } from '../ports/GithubApiPort';
import type { GitHubUser, GitHubRepository } from '@/lib/domain/GithubEntities';

// Mock data
const mockUsers: Record<string, GitHubUser> = {
  octocat: {
    id: 1,
    login: 'octocat',
    avatar_url: 'https://avatars.githubusercontent.com/u/583231',
    html_url: 'https://github.com/octocat',
    public_repos: 8,
  },
  torvalds: {
    id: 2,
    login: 'torvalds',
    avatar_url: 'https://avatars.githubusercontent.com/u/1024025',
    html_url: 'https://github.com/torvalds',
    public_repos: 100,
  },
  testuser: {
    id: 3,
    login: 'testuser',
    avatar_url: 'https://avatars.githubusercontent.com/u/123456',
    html_url: 'https://github.com/testuser',
    public_repos: 0,
  },
};

const mockRepositories: Record<string, GitHubRepository[]> = {
  octocat: [
    {
      id: 1,
      name: 'Hello-World',
      full_name: 'octocat/Hello-World',
      html_url: 'https://github.com/octocat/Hello-World',
      description: 'My first repository on GitHub!',
      stargazers_count: 2000,
      forks_count: 500,
      language: 'TypeScript',
      updated_at: '2024-01-15T10:30:00Z',
    },
    {
      id: 2,
      name: 'Spoon-Knife',
      full_name: 'octocat/Spoon-Knife',
      html_url: 'https://github.com/octocat/Spoon-Knife',
      description: 'This repo is for demonstration purposes only.',
      stargazers_count: 12000,
      forks_count: 8000,
      language: 'HTML',
      updated_at: '2024-01-10T08:20:00Z',
    },
    {
      id: 3,
      name: 'octocat.github.io',
      full_name: 'octocat/octocat.github.io',
      html_url: 'https://github.com/octocat/octocat.github.io',
      description: 'Personal website',
      stargazers_count: 150,
      forks_count: 30,
      language: 'JavaScript',
      updated_at: '2023-12-20T14:45:00Z',
    },
    {
      id: 4,
      name: 'test-repo',
      full_name: 'octocat/test-repo',
      html_url: 'https://github.com/octocat/test-repo',
      description: 'Test repository',
      stargazers_count: 50,
      forks_count: 10,
      language: 'Python',
      updated_at: '2023-11-05T09:15:00Z',
    },
    {
      id: 5,
      name: 'another-repo',
      full_name: 'octocat/another-repo',
      html_url: 'https://github.com/octocat/another-repo',
      description: 'Another test repository',
      stargazers_count: 25,
      forks_count: 5,
      language: 'Go',
      updated_at: '2023-10-12T16:30:00Z',
    },
    {
      id: 6,
      name: 'sample-project',
      full_name: 'octocat/sample-project',
      html_url: 'https://github.com/octocat/sample-project',
      description: 'Sample project for testing',
      stargazers_count: 10,
      forks_count: 2,
      language: 'Rust',
      updated_at: '2023-09-18T11:00:00Z',
    },
    {
      id: 7,
      name: 'demo-app',
      full_name: 'octocat/demo-app',
      html_url: 'https://github.com/octocat/demo-app',
      description: 'Demo application',
      stargazers_count: 5,
      forks_count: 1,
      language: 'Java',
      updated_at: '2023-08-22T13:45:00Z',
    },
    {
      id: 8,
      name: 'learning-git',
      full_name: 'octocat/learning-git',
      html_url: 'https://github.com/octocat/learning-git',
      description: 'Learning git basics',
      stargazers_count: 3,
      forks_count: 0,
      language: null,
      updated_at: '2023-07-30T10:20:00Z',
    },
  ],
  torvalds: Array.from({ length: 100 }, (_, i) => ({
    id: 100 + i,
    name: `repo-${i + 1}`,
    full_name: `torvalds/repo-${i + 1}`,
    html_url: `https://github.com/torvalds/repo-${i + 1}`,
    description: `Repository ${i + 1} description`,
    stargazers_count: Math.floor(Math.random() * 10000),
    forks_count: Math.floor(Math.random() * 1000),
    language: ['C', 'C++', 'Rust', 'Python', null][Math.floor(Math.random() * 5)],
    updated_at: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
  })),
  testuser: [],
};

export class InMemoryGithubApi implements GithubApiPort {
  async searchUsers(query: string, limit: number = 30): Promise<{ items: GitHubUser[]; total_count: number }> {
    // Simulate network delay
    await this.delay(100);

    const matchingUsers = Object.values(mockUsers).filter(user =>
      user.login.toLowerCase().includes(query.toLowerCase())
    );

    const limitedUsers = matchingUsers.slice(0, limit);

    return {
      items: limitedUsers,
      total_count: matchingUsers.length,
    };
  }

  async getUserRepositories(
    username: string,
    page: number = 1,
    perPage: number = 30
  ): Promise<{ items: GitHubRepository[]; hasNextPage: boolean }> {
    // Simulate network delay
    await this.delay(200);

    const repos = mockRepositories[username] || [];
    const start = (page - 1) * perPage;
    const end = start + perPage;
    const paginatedRepos = repos.slice(start, end);
    const hasNextPage = end < repos.length;

    return {
      items: paginatedRepos,
      hasNextPage,
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
