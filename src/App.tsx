import { useState, useEffect } from 'react';
import { AppRouter } from '@/router';
import { Toaster } from '@/components/ui/toaster';
import type { UserRole } from '@/config/roles';

// Types pour l'utilisateur
interface UserSession {
  email: string;
  name: string;
  role: UserRole;
  avatar?: string;
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
  // Par défaut, médecin référent
  return { email, name: 'Utilisateur', role: 'medecin' };
}

function App() {
  const [user, setUser] = useState<UserSession | null>(null);

  // Vérifier si l'utilisateur est déjà connecté (localStorage)
  useEffect(() => {
    const savedUser = localStorage.getItem('xpress-ecg-user');
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        setUser(parsedUser);
      } catch (e) {
        localStorage.removeItem('xpress-ecg-user');
      }
    }
  }, []);

  // Gestionnaire de connexion
  const handleLogin = (email: string, _password: string) => {
    const userSession = getUserFromEmail(email);
    setUser(userSession);
    localStorage.setItem('xpress-ecg-user', JSON.stringify(userSession));
  };

  // Gestionnaire de déconnexion
  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('xpress-ecg-user');
  };

  return (
    <>
      <AppRouter 
        user={user} 
        onLogin={handleLogin} 
        onLogout={handleLogout} 
      />
      <Toaster />
    </>
  );
}

export default App;
