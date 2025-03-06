
import React, { useEffect, useState } from 'react';
import { APP_VERSION } from '@/version';

interface VersionDisplayProps {
  className?: string;
}

export const VersionDisplay: React.FC<VersionDisplayProps> = ({ className = '' }) => {
  const [version, setVersion] = useState(APP_VERSION);

  // Ensure version is up-to-date even after hot reloads
  useEffect(() => {
    // Force version update whenever component mounts
    setVersion(APP_VERSION);
    
    // Listen for storage events in case version is updated in another tab
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'app_version') {
        setVersion(e.newValue || APP_VERSION);
      }
    };
    
    window.addEventListener('storage', handleStorageChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, []);

  return (
    <span className={`text-xs text-gray-400 ${className}`} title="Versión de la aplicación">
      v{version}
    </span>
  );
};
