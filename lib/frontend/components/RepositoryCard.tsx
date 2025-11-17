'use client';

import { GitHubRepository } from "@/lib/domain/GithubEntities";


interface RepositoryCardProps {
  repository: GitHubRepository;
}

export default function RepositoryCard({ repository }: RepositoryCardProps) {
  return (
    <a
      href={repository.html_url}
      target="_blank"
      rel="noopener noreferrer"
      className="block p-4 bg-gray-100 hover:bg-gray-200 transition-colors rounded-lg"
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-gray-900 font-semibold text-lg mb-1 truncate">
            {repository.name}
          </h3>
          {repository.description && (
            <p className="text-gray-600 text-sm mb-2 line-clamp-2">
              {repository.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-1 flex-shrink-0">
          <span className="text-gray-900 font-semibold text-lg">
            {repository.stargazers_count}
          </span>
          <svg
            className="w-5 h-5 text-gray-900"
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        </div>
      </div>
    </a>
  );
}
