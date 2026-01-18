import { useState } from 'react';
import { Lock, Eye, EyeOff, LogOut, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAppStore } from '@/stores/appStore';

interface LockScreenProps {
  userName: string;
  userEmail: string;
  onUnlock: () => void;
  onLogout: () => void;
}

export function LockScreen({ userName, userEmail, onUnlock, onLogout }: LockScreenProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [isUnlocking, setIsUnlocking] = useState(false);
  const { unlockSession } = useAppStore();

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsUnlocking(true);

    // Simulate verification
    await new Promise(resolve => setTimeout(resolve, 1000));

    // For demo, accept any password
    if (password.length >= 1) {
      unlockSession();
      onUnlock();
    } else {
      setError('Mot de passe incorrect');
    }

    setIsUnlocking(false);
    setPassword('');
  };

  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute inset-0" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }} />
      </div>

      {/* Decorative circles */}
      <div className="absolute -top-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-purple-400/20 rounded-full blur-3xl" />

      <div className="relative w-full max-w-md mx-4">
        {/* Lock card */}
        <div className="bg-white/95 dark:bg-gray-900/95 backdrop-blur-xl rounded-2xl shadow-2xl overflow-hidden">
          {/* Header */}
          <div className="p-8 text-center">
            {/* Logo */}
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 mb-4">
              <Heart className="w-8 h-8 text-white" fill="currentColor" />
            </div>

            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              Session verrouillée
            </h1>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Xpress-ECG • Votre session a été verrouillée pour des raisons de sécurité
            </p>
          </div>

          {/* User info */}
          <div className="px-8 pb-4">
            <div className="flex items-center gap-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-xl">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-lg font-semibold">
                {userName.charAt(0)}
              </div>
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{userName}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">{userEmail}</p>
              </div>
              <Lock className="h-5 w-5 text-gray-400 ml-auto" />
            </div>
          </div>

          {/* Unlock form */}
          <form onSubmit={handleUnlock} className="p-8 pt-4">
            {error && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                {error}
              </div>
            )}

            <div className="relative mb-4">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
              <Input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez votre mot de passe"
                className="pl-10 pr-10 h-12 bg-gray-50 dark:bg-gray-800 border-gray-200 dark:border-gray-700"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>

            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700"
              disabled={isUnlocking}
            >
              {isUnlocking ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                  Déverrouillage...
                </>
              ) : (
                'Déverrouiller'
              )}
            </Button>

            <div className="mt-4 text-center">
              <button
                type="button"
                onClick={onLogout}
                className="text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 inline-flex items-center gap-1"
              >
                <LogOut className="h-4 w-4" />
                Se déconnecter
              </button>
            </div>
          </form>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-white/60 mt-6">
          Pour des raisons de sécurité, entrez votre mot de passe pour continuer
        </p>
      </div>
    </div>
  );
}

