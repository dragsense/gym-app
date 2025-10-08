import React from 'react';

export const ErrorFallback = ({ error, resetErrorBoundary }: {
  error: Error;
  resetErrorBoundary: () => void;
}) => (
  <div>
    <h2>Something went wrong</h2>
    <p>{error.message}</p>
    <button onClick={resetErrorBoundary}>Try again</button>
  </div>
);