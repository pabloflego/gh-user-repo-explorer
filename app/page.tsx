'use client';
import SearchInput from "@/lib/ui/SearchInput";
import { useCallback, useState } from "react";

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');

  const searchUsers = useCallback(async () => {
    // TODO: Implement user search logic
  }, [searchQuery]);

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

        {/* Loading State */}

        {/* Errors */}

        {/* Users List */}

        {/* Empty State */}
      </div>
    </div>
  );
}
