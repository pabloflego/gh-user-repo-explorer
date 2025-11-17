'use client';

export default function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center py-8" role="status" aria-live="polite">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      <span className="sr-only">Loading...</span>
    </div>
  );
}
