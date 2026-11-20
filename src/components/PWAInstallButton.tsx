import React from 'react';
import { WifiOff } from 'lucide-react';
import { useOnlineStatus } from '../hooks/usePWAInstall';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();

  if (isOnline) return null;

  return (
    <div className="px-3 py-1.5 bg-sky-100 border-t border-sky-200 flex items-center justify-center gap-2 text-xs font-semibold text-[#1A365D] shrink-0">
      <WifiOff className="w-3.5 h-3.5 text-[#3B9AE1]" />
      <span>Modo offline · Jogos prontos para brincar</span>
    </div>
  );
};
