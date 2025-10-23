import React, { useId, useMemo, useTransition } from 'react';

export const ErrorFallback = ({ error, resetErrorBoundary }: {
  error: Error;
  resetErrorBoundary: () => void;
}) => {
  // React 19: Essential IDs and transitions
  const componentId = useId();
  const [, startTransition] = useTransition();
  
  // React 19: Memoized error message for better performance
  const memoizedErrorMessage = useMemo(() => error.message, [error.message]);
  
  // React 19: Smooth error recovery
  const handleRetry = () => {
    startTransition(() => {
      resetErrorBoundary();
    });
  };

  return (
    <div data-component-id={componentId} className="p-6 text-center">
      <h2 className="text-xl font-semibold mb-4">Something went wrong</h2>
      <p className="text-gray-600 mb-4">{memoizedErrorMessage}</p>
      <button 
        onClick={handleRetry}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
      >
        Try again
      </button>
    </div>
  );
};