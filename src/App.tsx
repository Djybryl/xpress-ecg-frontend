import { useState, useEffect } from 'react';
import { LoginPage } from '@/components/auth/LoginPage';
import { Dashboard } from '@/components/dashboard/Dashboard';

// Types pour l'utilisateur
export interface UserSession {
  email: string;
  name: string;
  role: 'cardiologue' | 'medecin' | 'secretaire' | 'admin';
}

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

  // Vérifier si l'utilisateur est déjà connecté
  useEffect(() => {
    const savedUser = localStorage.getItem('xpress-ecg-user');
    if (savedUser) {
      const parsedUser = JSON.parse(savedUser);
      setUser(parsedUser);
      setIsAuthenticated(true);
    }
  }, []);

  const handleLogin = (email: string, _password: string) => {
    const userSession = getUserFromEmail(email);
    setUser(userSession);
    setIsAuthenticated(true);
    localStorage.setItem('xpress-ecg-user', JSON.stringify(userSession));
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem('xpress-ecg-user');
  };

  // Si non authentifié, afficher la page de connexion
  if (!isAuthenticated || !user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  // Afficher le dashboard
  return <Dashboard user={user} onLogout={handleLogout} />;
}

export default App;

