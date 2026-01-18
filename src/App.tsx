import { useState, useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import { LoginPage } from '@/components/auth/LoginPage';
import { Dashboard } from '@/components/dashboard/Dashboard';
import { ProfilePage, SettingsPage, ReportsPage, StatisticsPage, ForgotPasswordPage } from '@/components/pages';
import { KeyboardShortcutsModal, OnboardingTour, LockScreen } from '@/components/shared';
import { useAppStore } from '@/stores/appStore';

// Types pour l'utilisateur
export interface UserSession {
  email: string;
  name: string;
  role: 'cardiologue' | 'medecin' | 'secretaire' | 'admin';
}

// Pages disponibles
type Page = 'dashboard' | 'profile' | 'settings' | 'reports' | 'statistics' | 'forgot-password';

// Fonction pour déterminer le rôle à partir de l'email
function getUserFromEmail(email: string): UserSession {
  if (email.includes('cardiologue')) {
    return { email, name: 'Dr. Sophie Bernard', role: 'cardiologue' };
  } else if (email.includes('medecin')) {
    return { email, name: 'Dr. Jean Martin', role: 'medecin' };
  } else if (email.includes('secretaire')) {
    return { email, name: 'Marie Dupont', role: 'secretaire' };
  } else if (email.includes('admin')) {
    return { email, name: 'Admin Système', role: 'admin' };
  }
  return { email, name: 'Utilisateur', role: 'medecin' };
}

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<UserSession | null>(null);
  const [currentPage, setCurrentPage] = useState<Page>('dashboard');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  
  const { 
    sessionLocked, 
    unlockSession,
    showOnboarding,
    setShowOnboarding,
    hasCompletedOnboarding,
    theme
  } = useAppStore();

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const savedUser = localStorage.getItem('xpress-ecg-user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
    }
  }, []);

  // Initialize theme on mount
  useEffect(() => {
    if (theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else if (theme === 'light') {
      document.documentElement.classList.remove('dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      if (prefersDark) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    }
  }, [theme]);

  // Show onboarding for new users
  useEffect(() => {
    if (isAuthenticated && !hasCompletedOnboarding) {
      setShowOnboarding(true);
    }
  }, [isAuthenticated, hasCompletedOnboarding, setShowOnboarding]);

  const handleLogin = (email: string, _password: string) => {
    const userSession = getUserFromEmail(email);
    setUser(userSession);
    setIsAuthenticated(true);
    setShowForgotPassword(false);
    localStorage.setItem('xpress-ecg-user', JSON.stringify(userSession));
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setCurrentPage('dashboard');
    localStorage.removeItem('xpress-ecg-user');
  };

  const handleUnlock = () => {
    unlockSession();
  };

  // Show forgot password page
  if (showForgotPassword && !isAuthenticated) {
    return <ForgotPasswordPage onBack={() => setShowForgotPassword(false)} />;
  }

  // Show login page if not authenticated
  if (!isAuthenticated || !user) {
    return (
      <LoginPage 
        onLogin={handleLogin} 
        onForgotPassword={() => setShowForgotPassword(true)}
      />
    );
  }

  // Show lock screen if session is locked
  if (sessionLocked) {
    return (
      <LockScreen
        userName={user.name}
        userEmail={user.email}
        onUnlock={handleUnlock}
        onLogout={handleLogout}
      />
    );
  }

  // Render current page
  const renderPage = () => {
    switch (currentPage) {
      case 'profile':
        return <ProfilePage user={user} onBack={() => setCurrentPage('dashboard')} />;
      case 'settings':
        return <SettingsPage onBack={() => setCurrentPage('dashboard')} />;
      case 'reports':
        return <ReportsPage onBack={() => setCurrentPage('dashboard')} />;
      case 'statistics':
        return <StatisticsPage onBack={() => setCurrentPage('dashboard')} />;
      default:
        return (
          <Dashboard 
            user={user} 
            onLogout={handleLogout}
            onNavigate={setCurrentPage}
          />
        );
    }
  };

  return (
    <>
      {/* Toast notifications */}
      <Toaster 
        position="top-right"
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-white',
          duration: 4000,
        }}
      />

      {/* Main content */}
      {renderPage()}

      {/* Keyboard shortcuts modal */}
      <KeyboardShortcutsModal />

      {/* Onboarding tour */}
      {showOnboarding && (
        <OnboardingTour onComplete={() => setShowOnboarding(false)} />
      )}
    </>
  );
}

export default App;
