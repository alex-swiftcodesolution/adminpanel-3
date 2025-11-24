// components/shared/ErrorMessage.tsx

import { AlertTriangle } from "lucide-react";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
}

export default function ErrorMessage({ message, onRetry }: ErrorMessageProps) {
  return (
    <div className="bg-red-50 border-2 border-red-200 rounded-lg p-6 text-center">
      <AlertTriangle className="w-12 h-12 text-red-600 mx-auto mb-3" />
      <p className="text-red-800 font-semibold mb-2">Error</p>
      <p className="text-red-700 text-sm mb-4">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
}
