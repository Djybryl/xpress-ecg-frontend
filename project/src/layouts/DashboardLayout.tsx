import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Header } from '@/components/shared/Header';
import { Sidebar } from '@/components/shared/Sidebar';
import { getNavigationForRole } from '@/config/navigation';
import type { UserRole } from '@/config/roles';

interface UserSession {
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

interface DashboardLayoutProps {
  user: UserSession;
  onLogout: () => void;
}

export function DashboardLayout({ user, onLogout }: DashboardLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const navigation = getNavigationForRole(user.role);

  const handleLogout = () => {
    onLogout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
        user={user}
        onLogout={handleLogout}
        onMenuToggle={() => setSidebarOpen(!sidebarOpen)}
        showMenuButton={true}
      />

      <div className="flex h-[calc(100vh-52px)]">
        <Sidebar
          navigation={navigation}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 overflow-auto bg-slate-50/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
