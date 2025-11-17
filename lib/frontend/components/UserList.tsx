'use client';

import type { GitHubUser, GitHubRepository } from "@/lib/domain/GithubEntities";
import UserCard from './UserCard';
import { useCallback, useState } from 'react';


interface UserListProps {
  users: GitHubUser[];
}

export default function UserList({ users }: UserListProps) {
  const [selectedUser, setSelectedUser] = useState<GitHubUser | null>(null);
  const [repositories, setRepositories] = useState<GitHubRepository[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const handleUserSelection = useCallback(async (user: GitHubUser) => {
    // TODO: Implement repository fetching logic
  }, [selectedUser]);

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-600">
          No users found.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full space-y-2">
      <p className="text-gray-600 text-sm mb-3">
        Showing users for &quot;{users[0]?.login.split(/[0-9]/)[0] || 'search'}&quot;
      </p>
      {users.map((user) => (
        <UserCard
          key={user.id}
          user={user}
          onClick={() => handleUserSelection(user)}
          isExpanded={selectedUser?.id === user.id}
          repositories={selectedUser?.id === user.id ? repositories : []}
          isLoading={selectedUser?.id === user.id ? isLoading : false}
        />
      ))}
    </div>
  );
}
