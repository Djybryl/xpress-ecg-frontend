import { NavLink, useLocation } from 'react-router-dom';
import { ChevronRight, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { NavigationConfig, NavItem } from '@/config/navigation';

interface SidebarProps {
  navigation: NavigationConfig;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

function NavItemComponent({ item, isActive }: { item: NavItem; isActive: boolean }) {
  const getBadgeStyle = (variant?: string) => {
    switch (variant) {
      case 'danger':
        return 'bg-red-100 text-red-700';
      case 'warning':
        return 'bg-amber-100 text-amber-800';
      case 'success':
        return 'bg-green-100 text-green-700';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <NavLink
      to={item.path}
      className={({ isActive: linkActive }) =>
        cn(
          'w-full text-left px-3 py-2 rounded-md text-[13px] font-medium flex items-center gap-2.5 transition-all duration-150',
          linkActive || isActive
            ? 'bg-indigo-100/80 text-indigo-700 border border-indigo-200/60'
            : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
        )
      }
    >
      <item.icon className="h-4 w-4 flex-shrink-0" />
      <span className="flex-1 truncate">{item.label}</span>
      {item.badge !== undefined && (
        <span
          className={cn(
            'text-xs px-2 py-0.5 rounded-full font-semibold',
            getBadgeStyle(item.badgeVariant)
          )}
        >
          {item.badge}
        </span>
      )}
      {!item.badge && <ChevronRight className="h-3.5 w-3.5 text-gray-400 opacity-0 group-hover:opacity-100" />}
    </NavLink>
  );
}

export function Sidebar({ navigation, isOpen = true, onClose, className }: SidebarProps) {
  const location = useLocation();

  return (
    <>
      {/* Overlay mobile */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed lg:static inset-y-0 left-0 z-50 w-60 bg-slate-50/80 border-r border-border/40 transform transition-transform duration-300 ease-in-out lg:transform-none',
          isOpen ? 'translate-x-0' : '-translate-x-full',
          className
        )}
      >
        <div className="h-full flex flex-col overflow-y-auto">
          {/* Header mobile avec bouton fermer */}
          <div className="lg:hidden flex items-center justify-between p-4 border-b">
            <span className="font-semibold text-gray-900">Menu</span>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Navigation principale */}
          <nav className="flex-1 p-3 space-y-0.5">
            {navigation.main.map((item) => (
              <NavItemComponent
                key={item.path}
                item={item}
                isActive={location.pathname === item.path}
              />
            ))}
          </nav>

          {/* Navigation secondaire */}
          {navigation.secondary && navigation.secondary.length > 0 && (
            <div className="p-3 border-t border-border/40">
              <div className="flex items-center gap-2 mb-2 px-1 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                <span>Autres</span>
              </div>
              <div className="space-y-0.5">
                {navigation.secondary.map((item) => (
                  <NavItemComponent
                    key={item.path}
                    item={item}
                    isActive={location.pathname === item.path}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Footer sidebar */}
          <div className="p-3 border-t border-border/40 bg-white/30">
            <div className="text-[10px] text-slate-400 text-center">
              <p className="font-medium text-slate-500">Xpress-ECG v1.0</p>
              <p className="mt-0.5">© 2025</p>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
}
