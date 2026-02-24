import { Bell } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { useNotificationStore } from '@/stores/useNotificationStore';
import { useEffect } from 'react';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function NotificationBell() {
  const {
    notifications,
    unreadCount,
    initForRole,
    markAsRead,
    markAllAsRead,
  } = useNotificationStore();

  useEffect(() => {
    initForRole('cardiologue'); // Rôle sera fourni par contexte en prod
  }, [initForRole]);

  const handleNotificationClick = async (id: string) => {
    await markAsRead(id);
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">
              {unreadCount}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <div className="flex items-center justify-between p-2 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={() => markAllAsRead()}
            >
              Tout marquer comme lu
            </Button>
          )}
        </div>
        <div className="max-h-[400px] overflow-auto">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-sm text-gray-500">
              Aucune notification
            </div>
          ) : (
            notifications.map((notification) => (
              <DropdownMenuItem
                key={notification.id}
                className={`p-3 cursor-pointer ${!notification.read ? 'bg-blue-50' : ''}`}
                onClick={() => handleNotificationClick(notification.id)}
              >
                <div className="space-y-1">
                  <div className="text-sm">
                    {notification.type === 'new_ecg' && (
                      <>
                        Nouvel ECG reçu pour{' '}
                        <span className="font-medium">
                          {notification.message}
                        </span>
                      </>
                    )}
                  </div>
                  <div className="text-xs text-gray-500">
                    {format(new Date(notification.createdAt), 'PPp', { locale: fr })}
                  </div>
                </div>
              </DropdownMenuItem>
            ))
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}