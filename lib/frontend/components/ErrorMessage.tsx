'use client';

interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="w-full p-4 bg-red-50 border border-red-200 rounded-lg" role="alert" aria-live="assertive">
      <p className="text-red-800 text-sm">{message}</p>
    </div>
  );
}
