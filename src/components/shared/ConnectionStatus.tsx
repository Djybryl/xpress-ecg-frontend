import { useState, useEffect } from 'react';
import { WifiOff, Cloud, CloudOff } from 'lucide-react';

export function ConnectionStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isConnectedToServer, setIsConnectedToServer] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Simulate server connection check (would be real WebSocket/API check)
    const checkServer = setInterval(() => {
      // Simulate occasional disconnection for demo
      setIsConnectedToServer(Math.random() > 0.05);
    }, 10000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(checkServer);
    };
  }, []);

  const status = !isOnline ? 'offline' : !isConnectedToServer ? 'disconnected' : 'connected';

  const statusConfig = {
    connected: {
      icon: Cloud,
      color: 'text-green-500',
      bg: 'bg-green-500',
      label: 'Connecté',
      description: 'Synchronisation en temps réel active',
    },
    disconnected: {
      icon: CloudOff,
      color: 'text-amber-500',
      bg: 'bg-amber-500',
      label: 'Reconnexion...',
      description: 'Tentative de reconnexion au serveur',
    },
    offline: {
      icon: WifiOff,
      color: 'text-red-500',
      bg: 'bg-red-500',
      label: 'Hors ligne',
      description: 'Vérifiez votre connexion internet',
    },
  };

  const config = statusConfig[status];
  const Icon = config.icon;

  return (
    <div 
      className="relative"
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <div className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 cursor-pointer transition-colors">
        <div className="relative">
          <Icon className={`h-4 w-4 ${config.color}`} />
          <span className={`absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full ${config.bg} ${status !== 'connected' ? 'animate-pulse' : ''}`} />
        </div>
        <span className={`text-xs font-medium ${config.color} hidden sm:inline`}>
          {config.label}
        </span>
      </div>

      {/* Tooltip */}
      {showTooltip && (
        <div className="absolute top-full right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 p-3 z-50 animate-in fade-in slide-in-from-top-1">
          <div className="flex items-center gap-2 mb-1">
            <span className={`w-2 h-2 rounded-full ${config.bg}`} />
            <span className="font-medium text-gray-900 dark:text-white text-sm">
              {config.label}
            </span>
          </div>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {config.description}
          </p>
        </div>
      )}
    </div>
  );
}

