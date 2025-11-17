'use client';

import { GitHubRepository } from '@/lib/domain/GithubEntities';
import RepositoryCard from './RepositoryCard';

interface RepositoryListProps {
  repositories: GitHubRepository[];
  username: string;
}

export default function RepositoryList({ repositories, username }: RepositoryListProps) {
  if (repositories.length === 0) {
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
    </div>
  );
}
