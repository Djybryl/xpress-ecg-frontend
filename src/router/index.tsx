import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { LoginPage } from '@/components/auth/LoginPage';
import { useAuthContext } from '@/providers/AuthProvider';
import { UnderConstruction } from '@/components/shared/UnderConstruction';
import { NotFoundPage } from '@/components/shared/NotFoundPage';
import type { UserRole } from '@/config/roles';

// Cardiologue pages
import { CardiologueDashboard, PendingECG, AnalyzeECG, CompletedECG, SecondOpinionRequests, CardiologueStatistics } from '@/pages/cardiologue';

// Médecin pages
import { MedecinDashboard } from '@/pages/medecin/Dashboard';
import { NewECGPage } from '@/pages/medecin/NewECG';
import { RequestsPage } from '@/pages/medecin/Requests';
import { ReportsPage } from '@/pages/medecin/Reports';
import { ReportViewPage } from '@/pages/medecin/ReportView';
import { PatientsPage } from '@/pages/medecin/Patients';
import { HistoryPage } from '@/pages/medecin/History';

// Secrétaire pages
import { SecretaireDashboard, ECGInbox, ECGAssignment, ReportSending, RoutingRules } from '@/pages/secretaire';

// Admin pages
import { AdminDashboard, UserManagement, HospitalManagement, Statistics, TarifSettings, Emoluments, FinancialReports, SpecialEmoluments, ActivityLogs } from '@/pages/admin';

// Common pages
import { ProfilePage } from '@/pages/common/Profile';
import { SettingsPage } from '@/pages/common/Settings';

function ProtectedRoute({
  children,
  allowedRoles,
}: {
  children: React.ReactNode;
  allowedRoles?: UserRole[];
}) {
  const { user } = useAuthContext();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return <>{children}</>;
}

function LoginRoute() {
  const { user } = useAuthContext();

  if (user) {
    return <Navigate to={`/${user.role}`} replace />;
  }

  return <LoginPage />;
}

function RootRedirect() {
  const { user } = useAuthContext();
  return <Navigate to={user ? `/${user.role}` : '/login'} replace />;
}


export function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Login */}
        <Route path="/login" element={<LoginRoute />} />

        {/* Cardiologue */}
        <Route
          path="/cardiologue"
          element={
            <ProtectedRoute allowedRoles={['cardiologue']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<CardiologueDashboard />} />
          <Route path="pending" element={<PendingECG />} />
          <Route path="urgent" element={<PendingECG />} />
          <Route path="second-opinion" element={<SecondOpinionRequests />} />
          <Route path="completed" element={<CompletedECG />} />
          <Route path="reports" element={<CompletedECG />} />
          <Route path="statistics" element={<CardiologueStatistics />} />
        </Route>

        {/* Cardiologue — Analyse plein écran (sans layout) */}
        <Route
          path="/cardiologue/analyze/:ecgId"
          element={
            <ProtectedRoute allowedRoles={['cardiologue']}>
              <AnalyzeECG />
            </ProtectedRoute>
          }
        />

        {/* Médecin */}
        <Route
          path="/medecin"
          element={
            <ProtectedRoute allowedRoles={['medecin']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<MedecinDashboard />} />
          <Route path="new-ecg" element={<NewECGPage />} />
          <Route path="requests" element={<RequestsPage />} />
          <Route path="patients" element={<PatientsPage />} />
          <Route path="reports" element={<ReportsPage />} />
          <Route path="reports/:reportId" element={<ReportViewPage />} />
          <Route path="history" element={<HistoryPage />} />
        </Route>

        {/* Secrétaire */}
        <Route
          path="/secretaire"
          element={
            <ProtectedRoute allowedRoles={['secretaire']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<SecretaireDashboard />} />
          <Route path="inbox" element={<ECGInbox />} />
          <Route path="assign" element={<ECGAssignment />} />
          <Route path="send-reports" element={<ReportSending />} />
          <Route path="routing" element={<RoutingRules />} />
          <Route path="patients" element={<UnderConstruction title="Patients" />} />
          <Route path="archives" element={<UnderConstruction title="Archives" />} />
        </Route>

        {/* Admin */}
        <Route
          path="/admin"
          element={
            <ProtectedRoute allowedRoles={['admin']}>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="users" element={<UserManagement />} />
          <Route path="hospitals" element={<HospitalManagement />} />
          <Route path="statistics" element={<Statistics />} />
          <Route path="tarifs" element={<TarifSettings />} />
          <Route path="emoluments" element={<Emoluments />} />
          <Route path="special-emoluments" element={<SpecialEmoluments />} />
          <Route path="financial" element={<FinancialReports />} />
          <Route path="settings" element={<UnderConstruction title="Paramètres système" />} />
          <Route path="logs" element={<ActivityLogs />} />
        </Route>

        {/* Routes communes */}
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<ProfilePage />} />
        </Route>

        <Route
          path="/settings"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<SettingsPage />} />
        </Route>

        {/* Redirections */}
        <Route path="/" element={<RootRedirect />} />
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </BrowserRouter>
  );
}
