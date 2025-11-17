'use client';

import type { GitHubRepository } from '@/lib/domain/GithubEntities';
import RepositoryCard from './RepositoryCard';
import LoadingSpinner from './LoadingSpinner';

interface RepositoryListProps {
  repositories: GitHubRepository[];
  username: string;
  hasMoreRepos?: boolean;
  onLoadMore?: () => void;
  isLoading?: boolean;
}

export default function RepositoryList({ 
  repositories, 
  username, 
  hasMoreRepos = false,
  onLoadMore,
  isLoading = false,
}: RepositoryListProps) {
  if (!isLoading && repositories.length === 0) {
    return (
      <div className="w-full p-4 text-center text-gray-600">
        No public repositories found for {username}
      </div>
    );
  }

  return (
    <div className="w-full space-y-3">
      {repositories.map((repository) => (
        <RepositoryCard key={repository.id} repository={repository} />
      ))}
      
      <div className="text-sm text-gray-600 pb-2 text-center">
        Showing {repositories.length} {repositories.length === 1 ? 'repository' : 'repositories'}
      </div>

      {hasMoreRepos && onLoadMore && (
        <div className="flex justify-center pt-2">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <button
              onClick={onLoadMore}
              aria-label={`Load more repositories for ${username}`}
              className="px-4 py-2 text-sm bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors"
            >
              Load More
            </button>
          )}
        </div>
      )}
    </div>
  );
}
