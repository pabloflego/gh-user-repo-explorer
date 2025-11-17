'use client';

import { useState, useEffect } from 'react';

interface SearchBoxProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
}

const sanitizeInput = (input: string): string => {
  return input
    .trim()
    .replace(/\s+/g, ' ')
    .replace(/[<>\"'&]/g, '');
};

export default function SearchBox({ value, onChange, onSearch }: SearchBoxProps) {
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

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => { onChange(sanitizeInput(e.target.value)) };

  return (
    <div className="w-full">
      <input
        type="text"
        value={value}
        onChange={handleInputChange}
        placeholder="Enter username"
        className="w-full px-4 py-3 text-base bg-gray-100 border-0 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800 placeholder-gray-500"
      />
      <button
        onClick={onSearch}
        className="w-full mt-4 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-medium rounded-lg transition-colors"
      >
        Search
      </button>
    </div>
  );
}
