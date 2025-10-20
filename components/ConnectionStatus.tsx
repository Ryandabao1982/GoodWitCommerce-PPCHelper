/**
 * Connection Status Component
 * Displays the current connection status (database vs localStorage)
 */

import React, { useState, useEffect } from 'react';
import { getConnectionStatus } from '../utils/hybridStorage';

interface ConnectionStatusProps {
  className?: string;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({ className = '' }) => {
  const [status, setStatus] = useState<{
    isConnected: boolean;
    isAuthenticated: boolean;
    usingDatabase: boolean;
    usingLocalStorage: boolean;
  } | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const checkStatus = async () => {
      const currentStatus = await getConnectionStatus();
      setStatus(currentStatus);
    };

    checkStatus();
    
    // Check status every 30 seconds
    const interval = setInterval(checkStatus, 30000);
    
    return () => clearInterval(interval);
  }, []);

  if (!status) {
    return null;
  }

  const getStatusIcon = () => {
    if (status.usingDatabase) {
      return (
        <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      );
    }
    return (
      <svg className="w-4 h-4 text-yellow-500" fill="currentColor" viewBox="0 0 20 20">
        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
      </svg>
    );
  };

  const getStatusText = () => {
    if (status.usingDatabase) {
      return 'Cloud Sync';
    }
    return 'Local Only';
  };

  const getStatusColor = () => {
    if (status.usingDatabase) {
      return 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800';
    }
    return 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800';
  };

  const getDetailedStatus = () => {
    if (status.usingDatabase) {
      return (
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          ✓ Data synced to cloud<br />
          ✓ Available across devices<br />
          ✓ Automatic backups enabled
        </div>
      );
    } else if (status.isConnected && !status.isAuthenticated) {
      return (
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          ⚠ Not signed in<br />
          • Data saved locally only<br />
          • Sign in to sync across devices
        </div>
      );
    } else {
      return (
        <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
          ⚠ Database not configured<br />
          • Data saved locally only<br />
          • Configure in Settings to enable cloud sync
        </div>
      );
    }
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border ${getStatusColor()} transition-all hover:shadow-sm`}
        title={`Storage mode: ${getStatusText()}`}
      >
        {getStatusIcon()}
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          {getStatusText()}
        </span>
        <svg 
          className={`w-3 h-3 text-gray-500 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isExpanded && (
        <div className="absolute top-full mt-2 right-0 w-64 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
              Connection Status
            </h3>
            <button
              onClick={() => setIsExpanded(false)}
              className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          
          {getDetailedStatus()}
          
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {status.usingLocalStorage && (
                <div className="flex items-center gap-1 mb-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M3 12v3c0 1.657 3.134 3 7 3s7-1.343 7-3v-3c0 1.657-3.134 3-7 3s-7-1.343-7-3z" />
                    <path d="M3 7v3c0 1.657 3.134 3 7 3s7-1.343 7-3V7c0 1.657-3.134 3-7 3S3 8.657 3 7z" />
                    <path d="M17 5c0 1.657-3.134 3-7 3S3 6.657 3 5s3.134-3 7-3 7 1.343 7 3z" />
                  </svg>
                  <span>Local storage active</span>
                </div>
              )}
              {status.usingDatabase && (
                <div className="flex items-center gap-1">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M2 5a2 2 0 012-2h12a2 2 0 012 2v10a2 2 0 01-2 2H4a2 2 0 01-2-2V5zm3.293 1.293a1 1 0 011.414 0l3 3a1 1 0 010 1.414l-3 3a1 1 0 01-1.414-1.414L7.586 10 5.293 7.707a1 1 0 010-1.414zM11 12a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                  <span>Cloud database active</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
