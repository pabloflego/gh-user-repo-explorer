'use client';
import { GitHubUser } from "@/lib/application/ports/GithubApiPort";
import ErrorMessage from "@/lib/ui/ErrorMessage";
import LoadingSpinner from "@/lib/ui/LoadingSpinner";
import SearchInput from "@/lib/ui/SearchInput";
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
          <SearchInput
            value={searchQuery}
            onChange={setSearchQuery}
            onSearch={searchUsers}
          />
          <button
            onClick={searchUsers}
            className="w-full mt-4 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
          >
            Search
          </button>
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
