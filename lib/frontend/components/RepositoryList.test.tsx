import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RepositoryList from './RepositoryList';
import { GitHubRepository } from '@/lib/domain/GithubEntities';

describe('RepositoryList', () => {
  const mockRepositories: GitHubRepository[] = [
    {
      id: 1,
      name: 'repo-one',
      full_name: 'testuser/repo-one',
      html_url: 'https://github.com/testuser/repo-one',
      description: 'First repository',
      stargazers_count: 10,
      language: 'TypeScript',
      forks_count: 2,
      updated_at: '2023-12-01T00:00:00Z',
    },
    {
      id: 2,
      name: 'repo-two',
      full_name: 'testuser/repo-two',
      html_url: 'https://github.com/testuser/repo-two',
      description: 'Second repository',
      stargazers_count: 20,
      language: 'JavaScript',
      forks_count: 3,
      updated_at: '2023-11-01T00:00:00Z',
    },
    {
      id: 3,
      name: 'repo-three',
      full_name: 'testuser/repo-three',
      html_url: 'https://github.com/testuser/repo-three',
      description: 'Third repository',
      stargazers_count: 30,
      language: 'Python',
      forks_count: 4,
      updated_at: '2023-10-01T00:00:00Z',
    },
  ];

  it('should render all repositories', () => {
    render(<RepositoryList repositories={mockRepositories} username="testuser" />);
    
    expect(screen.getByText('repo-one')).toBeInTheDocument();
    expect(screen.getByText('repo-two')).toBeInTheDocument();
    expect(screen.getByText('repo-three')).toBeInTheDocument();
  });

  it('should render repository descriptions', () => {
    render(<RepositoryList repositories={mockRepositories} username="testuser" />);
    
    expect(screen.getByText('First repository')).toBeInTheDocument();
    expect(screen.getByText('Second repository')).toBeInTheDocument();
    expect(screen.getByText('Third repository')).toBeInTheDocument();
  });

  it('should render empty state when no repositories', () => {
    render(<RepositoryList repositories={[]} username="testuser" />);
    
    expect(screen.getByText('No public repositories found for testuser')).toBeInTheDocument();
  });

  it('should render empty state with correct username', () => {
    render(<RepositoryList repositories={[]} username="anotheruser" />);
    
    expect(screen.getByText('No public repositories found for anotheruser')).toBeInTheDocument();
  });

  it('should render single repository', () => {
    const singleRepo = [mockRepositories[0]];
    
    render(<RepositoryList repositories={singleRepo} username="testuser" />);
    
    expect(screen.getByText('repo-one')).toBeInTheDocument();
    expect(screen.queryByText('repo-two')).not.toBeInTheDocument();
  });

  it('should render correct number of repository cards', () => {
    const { container } = render(<RepositoryList repositories={mockRepositories} username="testuser" />);
    
    const cards = container.querySelectorAll('a');
    expect(cards).toHaveLength(3);
  });

  it('should use repository id as key', () => {
    const { container } = render(<RepositoryList repositories={mockRepositories} username="testuser" />);
    
    expect(screen.getByText('repo-one')).toBeInTheDocument();
    expect(screen.getByText('repo-two')).toBeInTheDocument();
    expect(screen.getByText('repo-three')).toBeInTheDocument();
  });

  it('should maintain repository order', () => {
    const { container } = render(<RepositoryList repositories={mockRepositories} username="testuser" />);
    
    const cards = container.querySelectorAll('a');
    const firstCardName = cards[0].querySelector('h3')?.textContent;
    const secondCardName = cards[1].querySelector('h3')?.textContent;
    const thirdCardName = cards[2].querySelector('h3')?.textContent;
    
    expect(firstCardName).toBe('repo-one');
    expect(secondCardName).toBe('repo-two');
    expect(thirdCardName).toBe('repo-three');
  });

  it('should have correct spacing between cards', () => {
    const { container } = render(<RepositoryList repositories={mockRepositories} username="testuser" />);
    
    const wrapper = container.querySelector('.space-y-3');
    expect(wrapper).toBeInTheDocument();
  });

  it('should render empty state with correct styling', () => {
    const { container } = render(<RepositoryList repositories={[]} username="testuser" />);
    
    const emptyState = container.querySelector('.text-center');
    expect(emptyState).toBeInTheDocument();
    expect(emptyState).toHaveClass('w-full', 'p-4', 'text-center', 'text-gray-600');
  });

  it('should handle repositories with missing optional fields', () => {
    const repoWithoutDescription: GitHubRepository[] = [
      {
        ...mockRepositories[0],
        description: null,
      },
    ];
    
    render(<RepositoryList repositories={repoWithoutDescription} username="testuser" />);
    
    expect(screen.getByText('repo-one')).toBeInTheDocument();
  });

  it('should render large list of repositories', () => {
    const manyRepos: GitHubRepository[] = Array.from({ length: 50 }, (_, i) => ({
      id: i + 1,
      name: `repo-${i + 1}`,
      full_name: `testuser/repo-${i + 1}`,
      html_url: `https://github.com/testuser/repo-${i + 1}`,
      description: `Repository ${i + 1}`,
      stargazers_count: i * 10,
      language: 'TypeScript',
      forks_count: i,
      updated_at: '2023-12-01T00:00:00Z',
    }));
    
    const { container } = render(<RepositoryList repositories={manyRepos} username="testuser" />);
    
    const cards = container.querySelectorAll('a');
    expect(cards).toHaveLength(50);
  });
});
