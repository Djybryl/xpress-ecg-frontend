import { createBrowserRouter, Navigate, RouterProvider } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { LoginPage } from '@/components/auth/LoginPage';

// Cardiologue pages
import { CardiologueDashboard, PendingECG, AnalyzeECG, CompletedECG } from '@/pages/cardiologue';

// Médecin pages
import { MedecinDashboard } from '@/pages/medecin/Dashboard';
import { NewECGPage } from '@/pages/medecin/NewECG';
import { RequestsPage } from '@/pages/medecin/Requests';
import { ReportsPage } from '@/pages/medecin/Reports';
import { ReportViewPage } from '@/pages/medecin/ReportView';
import { PatientsPage } from '@/pages/medecin/Patients';

// Secrétaire pages
import { SecretaireDashboard, ECGInbox, ECGAssignment, ReportSending } from '@/pages/secretaire';

// Admin pages
import { AdminDashboard, UserManagement, HospitalManagement, Statistics } from '@/pages/admin';

// Common pages
import { ProfilePage } from '@/pages/common/Profile';
import { SettingsPage } from '@/pages/common/Settings';

import type { UserRole } from '@/config/roles';

interface UserSession {
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
}

interface AppRouterProps {
  user: UserSession | null;
  onLogin: (email: string, password: string) => void;
  onLogout: () => void;
}

// Composant pour les routes protégées
function ProtectedRoute({ 
  children, 
  user, 
  allowedRoles 
}: { 
  children: React.ReactNode; 
  user: UserSession | null;
  allowedRoles?: UserRole[];
}) {
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    // Rediriger vers le dashboard approprié si l'utilisateur n'a pas accès
    return <Navigate to={`/${user.role}`} replace />;
  }

  return <>{children}</>;
}

// Composant pour la page de login
function LoginRoute({ 
  user, 
  onLogin 
}: { 
  user: UserSession | null; 
  onLogin: (email: string, password: string) => void;
}) {
  if (user) {
    return <Navigate to={`/${user.role}`} replace />;
  }
  return <LoginPage onLogin={onLogin} />;
}

export function AppRouter({ user, onLogin, onLogout }: AppRouterProps) {
  const router = createBrowserRouter([
    // Route de login
    {
      path: '/login',
      element: <LoginRoute user={user} onLogin={onLogin} />,
    },

    // Routes Cardiologue
    {
      path: '/cardiologue',
      element: (
        <ProtectedRoute user={user} allowedRoles={['cardiologue']}>
          <DashboardLayout user={user!} onLogout={onLogout} />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <CardiologueDashboard /> },
        { path: 'pending', element: <PendingECG /> },
        { path: 'urgent', element: <PendingECG /> },
        { path: 'completed', element: <CompletedECG /> },
        { path: 'reports', element: <CompletedECG /> },
        { path: 'statistics', element: <div className="p-6"><h1 className="text-2xl font-bold">Statistiques</h1><p className="text-gray-500">Page en construction...</p></div> },
      ],
    },

    // Route AnalyzeECG en PLEIN ÉCRAN (sans sidebar)
    {
      path: '/cardiologue/analyze/:ecgId',
      element: (
        <ProtectedRoute user={user} allowedRoles={['cardiologue']}>
          <AnalyzeECG />
        </ProtectedRoute>
      ),
    },

    // Routes Médecin
    {
      path: '/medecin',
      element: (
        <ProtectedRoute user={user} allowedRoles={['medecin']}>
          <DashboardLayout user={user!} onLogout={onLogout} />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <MedecinDashboard /> },
        { path: 'new-ecg', element: <NewECGPage /> },
        { path: 'requests', element: <RequestsPage /> },
        { path: 'patients', element: <PatientsPage /> },
        { path: 'reports', element: <ReportsPage /> },
        { path: 'reports/:reportId', element: <ReportViewPage /> },
        { path: 'history', element: <div className="p-6"><h1 className="text-2xl font-bold">Historique</h1><p className="text-gray-500">Page en construction...</p></div> },
      ],
    },

    // Routes Secrétaire
    {
      path: '/secretaire',
      element: (
        <ProtectedRoute user={user} allowedRoles={['secretaire']}>
          <DashboardLayout user={user!} onLogout={onLogout} />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <SecretaireDashboard /> },
        { path: 'inbox', element: <ECGInbox /> },
        { path: 'assign', element: <ECGAssignment /> },
        { path: 'send-reports', element: <ReportSending /> },
        { path: 'patients', element: <div className="p-6"><h1 className="text-2xl font-bold">Patients</h1><p className="text-gray-500">Page en construction...</p></div> },
        { path: 'archives', element: <div className="p-6"><h1 className="text-2xl font-bold">Archives</h1><p className="text-gray-500">Page en construction...</p></div> },
      ],
    },

    // Routes Admin
    {
      path: '/admin',
      element: (
        <ProtectedRoute user={user} allowedRoles={['admin']}>
          <DashboardLayout user={user!} onLogout={onLogout} />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <AdminDashboard /> },
        { path: 'users', element: <UserManagement /> },
        { path: 'hospitals', element: <HospitalManagement /> },
        { path: 'statistics', element: <Statistics /> },
        { path: 'settings', element: <div className="p-6"><h1 className="text-2xl font-bold">Paramètres système</h1><p className="text-gray-500">Page en construction...</p></div> },
        { path: 'logs', element: <div className="p-6"><h1 className="text-2xl font-bold">Logs d'activité</h1><p className="text-gray-500">Page en construction...</p></div> },
      ],
    },

    // Routes communes (accessibles à tous les utilisateurs connectés)
    {
      path: '/profile',
      element: (
        <ProtectedRoute user={user}>
          <DashboardLayout user={user!} onLogout={onLogout} />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <ProfilePage /> },
      ],
    },
    {
      path: '/settings',
      element: (
        <ProtectedRoute user={user}>
          <DashboardLayout user={user!} onLogout={onLogout} />
        </ProtectedRoute>
      ),
      children: [
        { index: true, element: <SettingsPage /> },
      ],
    },

    // Redirection par défaut
    {
      path: '/',
      element: user ? <Navigate to={`/${user.role}`} replace /> : <Navigate to="/login" replace />,
    },

    // 404 - Page non trouvée
    {
      path: '*',
      element: (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
          <div className="text-center">
            <h1 className="text-6xl font-bold text-gray-300">404</h1>
            <p className="text-xl text-gray-600 mt-4">Page non trouvée</p>
            <button 
              onClick={() => window.history.back()}
              className="mt-6 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
            >
              Retour
            </button>
          </div>
        </div>
      ),
    },
  ]);

  return <RouterProvider router={router} />;
}
