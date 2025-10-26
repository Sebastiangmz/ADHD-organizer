
import React from 'react';

const LoadingSpinner: React.FC<{ message: string }> = ({ message }) => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-white/50 rounded-lg">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-lg font-semibold text-blue-700">{message}</p>
      <p className="mt-1 text-sm text-gray-500">Esto puede tomar un momento...</p>
    </div>
  );
};

export default LoadingSpinner;
