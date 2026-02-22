import { useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Header } from '@/components/shared/Header';
import { Sidebar } from '@/components/shared/Sidebar';
import { getNavigationForRole } from '@/config/navigation';
import { useAuthContext } from '@/providers/AuthProvider';

export function DashboardLayout() {
  const { user, logout } = useAuthContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  if (!user) return null;

  const navigation = getNavigationForRole(user.role);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header
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
          <div className="p-5">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
