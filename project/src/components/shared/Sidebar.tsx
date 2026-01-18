import { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { ChevronRight, ChevronLeft, X, PanelLeftClose, PanelLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { NavigationConfig, NavItem } from '@/config/navigation';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface SidebarProps {
  navigation: NavigationConfig;
  isOpen?: boolean;
  onClose?: () => void;
  className?: string;
}

function getBadgeStyle(variant?: string) {
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
}

function NavItemComponent({ 
  item, 
  isActive, 
  isCollapsed 
}: { 
  item: NavItem; 
  isActive: boolean;
  isCollapsed: boolean;
}) {
  const content = (
    <NavLink
      to={item.path}
      className={({ isActive: linkActive }) =>
        cn(
          'w-full text-left rounded-lg text-[13px] font-medium flex items-center transition-all duration-150',
          isCollapsed ? 'px-2 py-2 justify-center' : 'px-3 py-2 gap-2.5',
          linkActive || isActive
            ? 'bg-indigo-100/80 text-indigo-700 border border-indigo-200/60'
            : 'hover:bg-slate-100 text-slate-600 hover:text-slate-900'
        )
      }
    >
      <item.icon className="h-4 w-4 flex-shrink-0" />
      {!isCollapsed && (
        <>
          <span className="flex-1 truncate">{item.label}</span>
          {item.badge !== undefined && (
            <span
              className={cn(
                'text-[10px] px-1.5 py-0.5 rounded-full font-semibold',
                getBadgeStyle(item.badgeVariant)
              )}
            >
              {item.badge}
            </span>
          )}
        </>
      )}
      {isCollapsed && item.badge !== undefined && (
        <span className="absolute -top-1 -right-1 text-[9px] min-w-[16px] h-4 flex items-center justify-center px-1 rounded-full bg-red-500 text-white font-semibold">
          {item.badge}
        </span>
      )}
    </NavLink>
  );

  if (isCollapsed) {
    return (
      <Tooltip delayDuration={0}>
        <TooltipTrigger asChild>
          <div className="relative">
            {content}
          </div>
        </TooltipTrigger>
        <TooltipContent side="right" className="flex items-center gap-2">
          {item.label}
          {item.badge !== undefined && (
            <span className={cn('text-[10px] px-1.5 py-0.5 rounded-full font-semibold', getBadgeStyle(item.badgeVariant))}>
              {item.badge}
            </span>
          )}
        </TooltipContent>
      </Tooltip>
    );
  }

  return content;
}

export function Sidebar({ navigation, isOpen = true, onClose, className }: SidebarProps) {
  const location = useLocation();
  
  // État de collapse (rétracté) avec persistance
  const [isCollapsed, setIsCollapsed] = useState(() => {
    const saved = localStorage.getItem('sidebar-collapsed');
    return saved === 'true';
  });

  // Sauvegarder l'état dans localStorage
  useEffect(() => {
    localStorage.setItem('sidebar-collapsed', String(isCollapsed));
  }, [isCollapsed]);

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <TooltipProvider>
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
          'fixed lg:static inset-y-0 left-0 z-50 bg-slate-50/80 border-r border-border/40 transform transition-all duration-300 ease-in-out lg:transform-none flex flex-col',
          isCollapsed ? 'w-[60px]' : 'w-60',
          isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0',
          className
        )}
      >
        {/* Header avec bouton toggle */}
        <div className={cn(
          "flex items-center border-b border-border/40 h-12",
          isCollapsed ? "justify-center px-2" : "justify-between px-3"
        )}>
          {!isCollapsed && (
            <span className="font-semibold text-sm text-gray-700 lg:block hidden">Menu</span>
          )}
          
          {/* Bouton fermer mobile */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onClose}
            className="lg:hidden h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>

          {/* Bouton toggle desktop */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleCollapse}
            className="hidden lg:flex h-8 w-8 text-gray-500 hover:text-gray-700"
            title={isCollapsed ? "Étendre le menu" : "Réduire le menu"}
          >
            {isCollapsed ? (
              <PanelLeft className="h-4 w-4" />
            ) : (
              <PanelLeftClose className="h-4 w-4" />
            )}
          </Button>
        </div>

        {/* Navigation principale */}
        <nav className={cn(
          "flex-1 overflow-y-auto",
          isCollapsed ? "p-2 space-y-1" : "p-3 space-y-0.5"
        )}>
          {navigation.main.map((item) => (
            <NavItemComponent
              key={item.path}
              item={item}
              isActive={location.pathname === item.path}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>

        {/* Navigation secondaire */}
        {navigation.secondary && navigation.secondary.length > 0 && (
          <div className={cn(
            "border-t border-border/40",
            isCollapsed ? "p-2" : "p-3"
          )}>
            {!isCollapsed && (
              <div className="flex items-center gap-2 mb-2 px-1 text-[10px] font-semibold text-slate-400 uppercase tracking-widest">
                <span>Autres</span>
              </div>
            )}
            <div className={cn(isCollapsed ? "space-y-1" : "space-y-0.5")}>
              {navigation.secondary.map((item) => (
                <NavItemComponent
                  key={item.path}
                  item={item}
                  isActive={location.pathname === item.path}
                  isCollapsed={isCollapsed}
                />
              ))}
            </div>
          </div>
        )}

        {/* Footer sidebar */}
        <div className={cn(
          "border-t border-border/40 bg-white/30",
          isCollapsed ? "p-2" : "p-3"
        )}>
          {isCollapsed ? (
            <Tooltip delayDuration={0}>
              <TooltipTrigger asChild>
                <div className="text-[10px] text-slate-400 text-center cursor-default">
                  <span className="font-medium">v1.0</span>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                Xpress-ECG v1.0 - © 2025
              </TooltipContent>
            </Tooltip>
          ) : (
            <div className="text-[10px] text-slate-400 text-center">
              <p className="font-medium text-slate-500">Xpress-ECG v1.0</p>
              <p className="mt-0.5">© 2025</p>
            </div>
          )}
        </div>
      </aside>
    </TooltipProvider>
  );
}
