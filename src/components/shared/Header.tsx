import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity, Search, Bell, User, Settings, LogOut,
  Menu, ChevronDown, AlertTriangle, FileText, MessageSquare, Info, X, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { roleLabels, roleColors } from '@/config/navigation';
import { useAuthContext } from '@/providers/AuthProvider';
import { useNotificationStore, type AppNotification } from '@/stores/useNotificationStore';
import { ConfirmDialog } from '@/components/shared/ConfirmDialog';
import { GlobalSearch } from '@/components/shared/GlobalSearch';
import { cn } from '@/lib/utils';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

interface HeaderProps {
  onLogout: () => void;
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
}

const notifIcons: Record<AppNotification['type'], React.ReactNode> = {
  urgent: <AlertTriangle className="w-4 h-4 text-red-500" />,
  new_ecg: <Activity className="w-4 h-4 text-indigo-500" />,
  report_ready: <FileText className="w-4 h-4 text-green-500" />,
  second_opinion: <MessageSquare className="w-4 h-4 text-amber-500" />,
  info: <Info className="w-4 h-4 text-slate-400" />,
};

export function Header({ onLogout, onMenuToggle, showMenuButton = false }: HeaderProps) {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const [searchOpen, setSearchOpen] = useState(false);
  const [logoutConfirm, setLogoutConfirm] = useState(false);

  const { notifications, unreadCount, markAsRead, markAllAsRead, deleteNotification, clearAll } = useNotificationStore();
  const recentNotifications = notifications.slice(0, 5);

  if (!user) return null;

  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  const timeAgo = (dateStr: string) =>
    formatDistanceToNow(new Date(dateStr), { addSuffix: true, locale: fr });

  return (
    <>
      <header className="border-b border-border/50 bg-white/90 backdrop-blur-md sticky top-0 z-50 h-[52px]">
        <div className="w-full px-4 h-full flex items-center justify-between">
          {/* Partie gauche */}
          <div className="flex items-center gap-4">
            {showMenuButton && (
              <Button
                variant="ghost" size="icon"
                className="lg:hidden"
                onClick={onMenuToggle}
                aria-label="Ouvrir le menu"
              >
                <Menu className="h-5 w-5" />
              </Button>
            )}

            {/* Logo */}
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => navigate(`/${user.role}`)}
            >
              <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-sm">
                <Activity className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-base font-bold bg-gradient-to-r from-indigo-600 to-indigo-500 bg-clip-text text-transparent hidden sm:block">
                Xpress-ECG
              </h1>
            </div>

            {/* Badge rôle */}
            <span className={`hidden md:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${roleColors[user.role]}`}>
              {roleLabels[user.role]}
            </span>

            {/* Recherche — desktop */}
            <button
              onClick={() => setSearchOpen(true)}
              className="relative hidden md:flex items-center gap-2 pl-3 pr-4 h-8 w-[220px] rounded-md bg-slate-50/80 border border-slate-200/80 text-slate-400 text-sm hover:bg-white hover:border-indigo-300 transition-colors"
              aria-label="Ouvrir la recherche globale"
            >
              <Search className="h-3.5 w-3.5 flex-shrink-0" />
              <span>Rechercher...</span>
              <kbd className="ml-auto text-[10px] bg-slate-100 text-slate-400 px-1.5 py-0.5 rounded border border-slate-200">⌘K</kbd>
            </button>

            {/* Recherche — mobile */}
            <Button
              variant="ghost" size="icon"
              className="md:hidden h-8 w-8"
              onClick={() => setSearchOpen(true)}
              aria-label="Rechercher"
            >
              <Search className="h-4 w-4" />
            </Button>
          </div>

          {/* Partie droite */}
          <div className="flex items-center gap-3">
            {/* Notifications */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-8 w-8" aria-label="Notifications">
                  <Bell className="h-4 w-4 text-slate-500" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">
                      {unreadCount > 9 ? '9+' : unreadCount}
                    </span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80 p-0">
                <div className="flex items-center justify-between px-4 py-3 border-b">
                  <span className="font-semibold text-sm text-gray-900">
                    Notifications {unreadCount > 0 && <span className="text-indigo-600">({unreadCount})</span>}
                  </span>
                  <div className="flex items-center gap-2">
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-xs text-indigo-600 hover:text-indigo-700 font-medium"
                      >
                        Tout lire
                      </button>
                    )}
                    {notifications.length > 0 && (
                      <button
                        onClick={clearAll}
                        className="text-xs text-red-500 hover:text-red-600 font-medium flex items-center gap-0.5"
                        title="Tout effacer"
                      >
                        <Trash2 className="h-3 w-3" />
                      </button>
                    )}
                  </div>
                </div>
                <div className="max-h-[360px] overflow-auto">
                  {recentNotifications.length > 0 ? (
                    recentNotifications.map((notif) => (
                      <div
                        key={notif.id}
                        className={cn(
                          'flex items-start gap-3 px-4 py-3 border-b border-slate-50 last:border-0 group',
                          !notif.read && 'bg-indigo-50/40'
                        )}
                      >
                        <button
                          onClick={() => markAsRead(notif.id)}
                          className="flex items-start gap-3 flex-1 text-left hover:opacity-80 transition-opacity min-w-0"
                        >
                          <div className="mt-0.5 flex-shrink-0">
                            {notifIcons[notif.type]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className={cn('text-sm leading-tight', !notif.read ? 'font-semibold text-gray-900' : 'font-medium text-gray-700')}>
                              {notif.title}
                            </p>
                            <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{notif.message}</p>
                            <p className="text-[11px] text-slate-400 mt-1">{timeAgo(notif.createdAt)}</p>
                          </div>
                          {!notif.read && (
                            <span className="w-2 h-2 rounded-full bg-indigo-500 flex-shrink-0 mt-1.5" />
                          )}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); deleteNotification(notif.id); }}
                          className="opacity-0 group-hover:opacity-100 transition-opacity text-gray-300 hover:text-red-400 flex-shrink-0 mt-0.5"
                          title="Supprimer"
                        >
                          <X className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    ))
                  ) : (
                    <div className="py-8 text-center">
                      <Bell className="w-8 h-8 text-slate-200 mx-auto mb-2" />
                      <p className="text-sm text-gray-400">Aucune notification</p>
                    </div>
                  )}
                </div>
                {notifications.length > 5 && (
                  <div className="border-t p-2">
                    <button className="w-full text-center text-xs text-indigo-600 hover:text-indigo-700 font-medium py-1">
                      Voir toutes les notifications ({notifications.length})
                    </button>
                  </div>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Menu utilisateur */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-1.5 h-8">
                  <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-md flex items-center justify-center text-white text-xs font-medium">
                    {getInitials(user.name)}
                  </div>
                  <div className="hidden md:block text-left">
                    <p className="text-[13px] font-medium text-slate-800 leading-tight">{user.name}</p>
                    <p className="text-[11px] text-slate-500 leading-tight">{roleLabels[user.role]}</p>
                  </div>
                  <ChevronDown className="h-3.5 w-3.5 text-slate-400 hidden md:block" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col">
                    <span className="font-medium">{user.name}</span>
                    <span className="text-xs font-normal text-gray-500">{user.email}</span>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  Mon profil
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  Paramètres
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setLogoutConfirm(true)}
                  className="text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Déconnexion
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Confirmation déconnexion */}
      <ConfirmDialog
        open={logoutConfirm}
        onOpenChange={setLogoutConfirm}
        title="Se déconnecter ?"
        description="Vous allez être redirigé vers la page de connexion. Les données non sauvegardées seront perdues."
        confirmLabel="Déconnexion"
        cancelLabel="Annuler"
        variant="destructive"
        onConfirm={onLogout}
      />

      {/* Recherche globale */}
      <GlobalSearch open={searchOpen} onOpenChange={setSearchOpen} />
    </>
  );
}
