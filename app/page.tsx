'use client';
import ErrorMessage from "@/lib/frontend/components/ErrorMessage";
import LoadingSpinner from "@/lib/frontend/components/LoadingSpinner";
import SearchBox from "@/lib/frontend/components/SearchBox";
import UserList from "@/lib/frontend/components/UserList";
import { useClientApi } from "@/lib/frontend/ClientApiProvider";
import { useCallback, useState, useRef } from "react";
import type { GitHubUser, GitHubRepository } from "@/lib/domain/GithubEntities";

export default function Home() {
  const clientApi = useClientApi();
  const [searchQuery, setSearchQuery] = useState('');
  const [users, setUsers] = useState<GitHubUser[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const [selectedUser, setSelectedUser] = useState<GitHubUser | null>(null);
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [isLoadingRepos, setIsLoadingRepos] = useState(false);
  const currentPageRef = useRef(1);
  const [hasMoreRepos, setHasMoreRepos] = useState(false);

  const searchUsers = useCallback(async () => {
    if (!searchQuery.trim()) {
      setUsers([]);
      return;
    }
    setIsLoading(true);
    setError(null);

    try {
      const data = await clientApi.searchUsers(searchQuery);
      setUsers(data.items || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred while searching users');
      setUsers([]);
    } finally {
      setIsLoading(false);
    }
  }, [searchQuery, clientApi]);

  const handleUserSelection = useCallback(async (user: GitHubUser) => {
    if (selectedUser?.id === user.id) {
      setSelectedUser(null);
      return;
    }

    setSelectedUser(user);
    setRepositories([]);
    currentPageRef.current = 1;
    setHasMoreRepos(false);
    setIsLoadingRepos(true);
    setError(null);

    try {
      const data = await clientApi.fetchUserRepositories(user.login, 1);
      setRepositories(data.items || []);
      setHasMoreRepos(data.hasNextPage || false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch repositories');
      setRepositories([]);
      setHasMoreRepos(false);
    } finally {
      setIsLoadingRepos(false);
    }
  }, [selectedUser, clientApi]);

  const loadMoreRepositories = useCallback(async () => {
    if (!selectedUser || isLoadingRepos) return;

    setIsLoadingRepos(true);
    setError(null);

    const nextPage = currentPageRef.current + 1;

    try {
      const data = await clientApi.fetchUserRepositories(selectedUser.login, nextPage);
      setRepositories(prev => [...prev, ...(data.items || [])]);
      setHasMoreRepos(data.hasNextPage || false);
      currentPageRef.current = nextPage;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more repositories');
    } finally {
      setIsLoadingRepos(false);
    }
  }, [selectedUser, isLoadingRepos, clientApi]);

  const isEmptyQuery = !searchQuery && users.length === 0 && !isLoading;
  const maybeResults = !isLoading && searchQuery.trim();

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

        {maybeResults && (
          <div className="bg-white rounded-lg shadow-md p-6 mb-4">
            <UserList 
              users={users} 
              selectedUser={selectedUser}
              repositories={repositories}
              isLoadingRepos={isLoadingRepos}
              onUserSelect={handleUserSelection}
              hasMoreRepos={hasMoreRepos}
              onLoadMore={loadMoreRepositories}
            />
          </div>
        )}

        {isEmptyQuery && (
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
