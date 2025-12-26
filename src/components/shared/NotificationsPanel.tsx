import { useState } from 'react';
import { Bell, CheckCheck, Trash2, AlertCircle, MessageSquare, UserPlus, Activity, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAppStore, type Notification } from '@/stores/appStore';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface NotificationsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NotificationsPanel({ isOpen, onClose }: NotificationsPanelProps) {
  const { notifications, unreadCount, markAsRead, markAllAsRead, clearNotifications } = useAppStore();
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const filteredNotifications = filter === 'unread' 
    ? notifications.filter(n => !n.read) 
    : notifications;

  const getIcon = (type: Notification['type']) => {
    switch (type) {
      case 'ecg_urgent':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
      case 'ecg_normal':
        return <Activity className="h-5 w-5 text-indigo-500" />;
      case 'second_opinion':
        return <UserPlus className="h-5 w-5 text-amber-500" />;
      case 'message':
        return <MessageSquare className="h-5 w-5 text-blue-500" />;
      case 'system':
        return <Settings className="h-5 w-5 text-gray-500" />;
      default:
        return <Bell className="h-5 w-5 text-gray-500" />;
    }
  };

  const formatTime = (date: Date) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
  };

  if (!isOpen) return null;

  return (
    <div className="absolute right-0 top-12 w-96 bg-white dark:bg-gray-900 rounded-xl shadow-2xl border dark:border-gray-700 z-50 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
      {/* Header */}
      <div className="p-4 border-b dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-indigo-600" />
            <h3 className="font-semibold text-gray-900 dark:text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="px-2 py-0.5 bg-red-100 text-red-700 text-xs font-semibold rounded-full">
                {unreadCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
          >
            ✕
          </button>
        </div>

        {/* Filters & Actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-1">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                filter === 'all'
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              Toutes
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-3 py-1 text-xs font-medium rounded-full transition-colors ${
                filter === 'unread'
                  ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300'
                  : 'text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-700'
              }`}
            >
              Non lues
            </button>
          </div>
          <div className="flex gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="h-7 text-xs"
              disabled={unreadCount === 0}
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Tout lire
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearNotifications}
              className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
              disabled={notifications.length === 0}
            >
              <Trash2 className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-[400px] overflow-y-auto">
        {filteredNotifications.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
            <p className="font-medium">Aucune notification</p>
            <p className="text-sm mt-1">Vous êtes à jour !</p>
          </div>
        ) : (
          <div className="divide-y dark:divide-gray-700">
            {filteredNotifications.map((notification) => (
              <div
                key={notification.id}
                className={`p-4 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer transition-colors ${
                  !notification.read ? 'bg-indigo-50/50 dark:bg-indigo-900/20' : ''
                }`}
                onClick={() => markAsRead(notification.id)}
              >
                <div className="flex gap-3">
                  <div className="flex-shrink-0 mt-0.5">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <p className={`text-sm ${!notification.read ? 'font-semibold' : 'font-medium'} text-gray-900 dark:text-white`}>
                        {notification.title}
                      </p>
                      {!notification.read && (
                        <span className="w-2 h-2 bg-indigo-600 rounded-full flex-shrink-0 mt-1.5" />
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-0.5 line-clamp-2">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                      {formatTime(notification.timestamp)}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Footer */}
      {notifications.length > 5 && (
        <div className="p-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800 text-center">
          <Button variant="ghost" size="sm" className="text-indigo-600 hover:text-indigo-700">
            Voir toutes les notifications
          </Button>
        </div>
      )}
    </div>
  );
}
