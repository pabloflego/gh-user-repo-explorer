'use client';

import { useState, useEffect } from 'react';

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
}

export default function SearchInput({ value, onChange, onSearch }: SearchInputProps) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedValue(value);
    }, 300);

    return () => clearTimeout(timer);
  }, [value]);

  useEffect(() => {
    if (debouncedValue.trim()) {
      onSearch();
    }
  }, [debouncedValue, onSearch]);

  return (
    <div className="w-full">
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Enter username"
        className="w-full px-4 py-3 text-base bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-500"
      />
    </div>
  );
}
