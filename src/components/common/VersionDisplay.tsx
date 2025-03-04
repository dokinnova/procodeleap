
import React from 'react';
import { APP_VERSION } from '@/version';

interface VersionDisplayProps {
  className?: string;
}

export const VersionDisplay: React.FC<VersionDisplayProps> = ({ className = '' }) => {
  return (
    <span className={`text-xs text-gray-400 ${className}`}>
      v{APP_VERSION}
    </span>
  );
};
