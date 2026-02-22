import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Activity,
  Search,
  Bell,
  User,
  Settings,
  LogOut,
  Menu,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { roleLabels, roleColors } from '@/config/navigation';
import type { UserRole } from '@/config/roles';

interface UserSession {
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

interface HeaderProps {
  user: UserSession;
  onLogout: () => void;
  onMenuToggle?: () => void;
  showMenuButton?: boolean;
}

export function Header({ user, onLogout, onMenuToggle, showMenuButton = false }: HeaderProps) {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implémenter la recherche globale
    console.log('Recherche:', searchTerm);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="border-b border-border/50 bg-white/90 backdrop-blur-md sticky top-0 z-50 h-[52px]">
      <div className="w-full px-4 h-full flex items-center justify-between">
        {/* Partie gauche */}
        <div className="flex items-center gap-4">
          {/* Bouton menu mobile */}
          {showMenuButton && (
            <Button
              variant="ghost"
              size="icon"
              className="lg:hidden"
              onClick={onMenuToggle}
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

          {/* Badge du rôle */}
          <span className={`hidden md:inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium ${roleColors[user.role]}`}>
            {roleLabels[user.role]}
          </span>

          {/* Recherche */}
          <form onSubmit={handleSearch} className="relative hidden md:block">
            <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
            <Input
              type="search"
              placeholder="Rechercher..."
              className="pl-8 h-8 w-[220px] text-sm bg-slate-50/80 border-slate-200/80 focus:bg-white rounded-md"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </form>
        </div>

        {/* Partie droite */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative h-8 w-8">
                <Bell className="h-4 w-4 text-slate-500" />
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] rounded-full flex items-center justify-center font-medium">
                  3
                </span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel className="flex items-center justify-between">
                <span>Notifications</span>
                <Button variant="ghost" size="sm" className="text-xs h-auto py-1">
                  Tout marquer comme lu
                </Button>
              </DropdownMenuLabel>
              <DropdownMenuSeparator />
              <div className="max-h-[300px] overflow-auto">
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                  <p className="text-sm font-medium">Nouvel ECG reçu</p>
                  <p className="text-xs text-gray-500">Patient: Pierre Dupont - Il y a 5 min</p>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                  <p className="text-sm font-medium">Rapport validé</p>
                  <p className="text-xs text-gray-500">ECG-2024-0407 - Il y a 15 min</p>
                </DropdownMenuItem>
                <DropdownMenuItem className="flex flex-col items-start gap-1 p-3 cursor-pointer">
                  <p className="text-sm font-medium">Demande de second avis</p>
                  <p className="text-xs text-gray-500">Dr. Martin - Il y a 1h</p>
                </DropdownMenuItem>
              </div>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="justify-center text-indigo-600 font-medium">
                Voir toutes les notifications
              </DropdownMenuItem>
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
                  <span>{user.name}</span>
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
              <DropdownMenuItem onClick={onLogout} className="text-red-600 focus:text-red-600">
                <LogOut className="mr-2 h-4 w-4" />
                Déconnexion
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
