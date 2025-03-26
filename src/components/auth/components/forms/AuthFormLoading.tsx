
import React from 'react';

export const AuthFormLoading: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-32">
      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
    </div>
  );
};
