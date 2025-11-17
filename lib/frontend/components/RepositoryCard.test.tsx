import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import RepositoryCard from './RepositoryCard';
import { GitHubRepository } from '@/lib/domain/GithubEntities';

describe('RepositoryCard', () => {
  const mockRepository: GitHubRepository = {
    id: 1,
    name: 'test-repo',
    full_name: 'testuser/test-repo',
    html_url: 'https://github.com/testuser/test-repo',
    description: 'A test repository',
    stargazers_count: 42,
    language: 'TypeScript',
    forks_count: 5,
    updated_at: '2023-12-01T00:00:00Z',
  };

  it('should render repository name', () => {
    render(<RepositoryCard repository={mockRepository} />);
    
    expect(screen.getByText('test-repo')).toBeInTheDocument();
  });

  it('should render repository description', () => {
    render(<RepositoryCard repository={mockRepository} />);
    
    expect(screen.getByText('A test repository')).toBeInTheDocument();
  });

  it('should render star count', () => {
    render(<RepositoryCard repository={mockRepository} />);
    
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('should render star icon', () => {
    const { container } = render(<RepositoryCard repository={mockRepository} />);
    
    const starIcon = container.querySelector('svg');
    expect(starIcon).toBeInTheDocument();
  });

  it('should have correct link to repository', () => {
    render(<RepositoryCard repository={mockRepository} />);
    
    const link = screen.getByRole('link');
    expect(link).toHaveAttribute('href', 'https://github.com/testuser/test-repo');
    expect(link).toHaveAttribute('target', '_blank');
    expect(link).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('should not render description when not provided', () => {
    const repoWithoutDescription: GitHubRepository = {
      ...mockRepository,
      description: null,
    };
    
    const { container } = render(<RepositoryCard repository={repoWithoutDescription} />);
    
    expect(screen.getByText('test-repo')).toBeInTheDocument();
    expect(container.querySelector('p')).not.toBeInTheDocument();
  });

  it('should render repository with empty description', () => {
    const repoWithEmptyDescription: GitHubRepository = {
      ...mockRepository,
      description: '',
    };
    
    const { container } = render(<RepositoryCard repository={repoWithEmptyDescription} />);
    
    expect(screen.getByText('test-repo')).toBeInTheDocument();
    expect(container.querySelector('p')).not.toBeInTheDocument();
  });

  it('should render repository with zero stars', () => {
    const repoWithZeroStars: GitHubRepository = {
      ...mockRepository,
      stargazers_count: 0,
    };
    
    render(<RepositoryCard repository={repoWithZeroStars} />);
    
    expect(screen.getByText('0')).toBeInTheDocument();
  });

  it('should render repository with large star count', () => {
    const repoWithManyStars: GitHubRepository = {
      ...mockRepository,
      stargazers_count: 12345,
    };
    
    render(<RepositoryCard repository={repoWithManyStars} />);
    
    expect(screen.getByText('12345')).toBeInTheDocument();
  });

  it('should have correct styling classes', () => {
    const { container } = render(<RepositoryCard repository={mockRepository} />);
    
    const link = container.querySelector('a');
    expect(link).toHaveClass('block', 'p-4', 'bg-gray-100', 'hover:bg-gray-200');
  });

  it('should render long repository name', () => {
    const repoWithLongName: GitHubRepository = {
      ...mockRepository,
      name: 'this-is-a-very-long-repository-name-that-should-be-truncated',
    };
    
    render(<RepositoryCard repository={repoWithLongName} />);
    
    expect(screen.getByText('this-is-a-very-long-repository-name-that-should-be-truncated')).toBeInTheDocument();
  });

  it('should render long description', () => {
    const repoWithLongDescription: GitHubRepository = {
      ...mockRepository,
      description: 'This is a very long description that should be clamped to two lines when displayed in the UI because we do not want it to take up too much space',
    };
    
    render(<RepositoryCard repository={repoWithLongDescription} />);
    
    expect(screen.getByText(/This is a very long description/)).toBeInTheDocument();
  });
});
