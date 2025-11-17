'use client';
import { GitHubUser } from "@/lib/application/ports/GithubApiPort";
import ErrorMessage from "@/lib/client/components/ErrorMessage";
import LoadingSpinner from "@/lib/client/components/LoadingSpinner";
import SearchBox from "@/lib/client/components/SearchBox";
import { useCallback, useState } from "react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<GitHubUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const searchUsers = useCallback(async () => {
    // TODO: Implement user search logic
  }, [searchQuery]);

  const isEmptyState = !searchQuery && users.length === 0 && !isLoading;

  return (
    <div className="min-h-screen bg-gray-200 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto">
        <div className="bg-white rounded-lg shadow-md p-6 mb-4">
          <SearchBox
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={searchUsers}
          />
        </div>

        {isLoading && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <LoadingSpinner />
          </div>
        )}

        {error && (
          <div className="mb-4">
            <ErrorMessage message={error} />
          </div>
        )}

        {/* Users List */}

        {isEmptyState && (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-600">
              Enter a GitHub username to get started
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
