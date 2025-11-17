'use client';

import type { GitHubUser, GitHubRepository } from "@/lib/domain/GithubEntities";
import LoadingSpinner from './LoadingSpinner';
import RepositoryList from './RepositoryList';

interface UserCardProps {
  user: GitHubUser;
  onClick: () => void;
  isExpanded?: boolean;
  repositories?: GitHubRepository[];
  isLoading?: boolean;
}

export default function UserCard({ 
  user, 
  onClick, 
  isExpanded = false,
  repositories = [],
  isLoading = false
}: UserCardProps) {
  return (
    <div className="w-full rounded-lg overflow-hidden">
      <button
        onClick={onClick}
        className="w-full px-4 py-3 bg-gray-100 hover:bg-gray-200 transition-colors text-left flex items-center justify-between rounded-lg"
      >
        <span className="text-gray-800 font-medium">{user.login}</span>
        <svg
          className={`w-5 h-5 text-gray-600 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      
      {isExpanded && (
        <div className="mt-3 pl-4">
          {isLoading ? (
            <LoadingSpinner />
          ) : (
            <RepositoryList repositories={repositories} username={user.login} />
          )}
        </div>
      )}
    </div>
  );
}
