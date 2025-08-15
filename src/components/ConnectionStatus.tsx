import React from 'react';
import { Wifi, WifiOff, AlertCircle } from 'lucide-react';

interface ConnectionStatusProps {
  isConnected: boolean;
  error: string | null;
  onReconnect: () => void;
}

export const ConnectionStatus: React.FC<ConnectionStatusProps> = ({
  isConnected,
  error,
  onReconnect
}) => {
  if (isConnected) {
    return (
      <div className="flex items-center gap-2 text-green-600 bg-green-50 px-3 py-2 rounded-lg border border-green-200">
        <Wifi className="w-4 h-4" />
        <span className="text-sm font-medium">Live Feed Connected</span>
        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 text-red-600 bg-red-50 px-3 py-2 rounded-lg border border-red-200">
      {error ? (
        <>
          <AlertCircle className="w-4 h-4" />
          <span className="text-sm font-medium">Connection Error</span>
        </>
      ) : (
        <>
          <WifiOff className="w-4 h-4" />
          <span className="text-sm font-medium">Disconnected</span>
        </>
      )}
      <button
        onClick={onReconnect}
        className="text-xs bg-red-100 hover:bg-red-200 px-2 py-1 rounded transition-colors"
      >
        Retry
      </button>
    </div>
  );
};