import { useState } from 'react';
import { Eye, EyeOff, Heart, Activity, LogIn, Mail, Lock, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';

interface LoginPageProps {
  onLogin: (email: string, password: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    if (email && password) {
      onLogin(email, password);
    } else {
      setError('Veuillez remplir tous les champs');
    }
    
    setIsLoading(false);
  };

  return (
    <div className="min-h-screen flex">
      {/* Partie gauche - Illustration et branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-indigo-400 via-indigo-500 to-indigo-600 relative overflow-hidden">
        {/* Motif de fond */}
        <div className="absolute inset-0 bg-ecg-pattern opacity-10"></div>
        
        {/* Cercles décoratifs */}
        <div className="absolute -top-20 -left-20 w-96 h-96 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-indigo-300/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/4 w-64 h-64 bg-white/5 rounded-full blur-2xl"></div>
        
        {/* Contenu */}
        <div className="relative z-10 flex flex-col justify-center items-center w-full p-12 text-white">
          {/* Logo animé */}
          <div className="mb-8 relative">
            <div className="w-32 h-32 bg-white/20 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/30 shadow-2xl">
              <div className="relative">
                <Heart className="w-16 h-16 text-white animate-pulse-soft" fill="currentColor" />
                <Activity className="w-10 h-10 text-indigo-200 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
              </div>
            </div>
            <div className="absolute inset-0 w-32 h-32 bg-white/10 rounded-full animate-ping opacity-20"></div>
          </div>
          
          <h1 className="text-5xl font-bold mb-4 tracking-tight">
            Xpress-ECG
          </h1>
          
          <p className="text-xl text-indigo-100 text-center max-w-md mb-8 leading-relaxed">
            Plateforme de télé-interprétation d'électrocardiogrammes
          </p>
          
          {/* Ligne ECG animée */}
          <svg className="w-80 h-16 text-white/60" viewBox="0 0 400 60">
            <path
              d="M0 30 L50 30 L70 30 L90 10 L110 50 L130 20 L150 40 L170 30 L220 30 L240 30 L260 10 L280 50 L300 20 L320 40 L340 30 L400 30"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="animate-ecg-line"
              style={{ strokeDasharray: 200 }}
            />
          </svg>
          
          {/* Features */}
          <div className="mt-12 grid grid-cols-1 gap-4 text-sm">
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Activity className="w-4 h-4" />
              </div>
              <span>Analyse rapide et précise des ECG</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <Heart className="w-4 h-4" />
              </div>
              <span>Interprétation par des cardiologues experts</span>
            </div>
            <div className="flex items-center gap-3 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-3 border border-white/20">
              <div className="w-8 h-8 bg-white/20 rounded-full flex items-center justify-center">
                <ArrowRight className="w-4 h-4" />
              </div>
              <span>Rapports sécurisés et conformes</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Partie droite - Formulaire de connexion */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 bg-gradient-to-br from-slate-50 to-indigo-50/30">
        <div className="w-full max-w-md">
          {/* Logo mobile */}
          <div className="lg:hidden flex flex-col items-center mb-8">
            <div className="w-20 h-20 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-200 mb-4">
              <Heart className="w-10 h-10 text-white" fill="currentColor" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Xpress-ECG</h1>
          </div>
          
          <Card className="border-0 shadow-xl shadow-indigo-100/50 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 pb-4">
              <CardTitle className="text-2xl font-bold text-center text-gray-900">
                Connexion
              </CardTitle>
              <CardDescription className="text-center text-gray-500">
                Accédez à votre espace de travail sécurisé
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-5">
                {error && (
                  <div className="bg-red-50 text-red-600 text-sm p-3 rounded-lg border border-red-100 animate-fade-in">
                    {error}
                  </div>
                )}
                
                {/* Email */}
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-gray-700 font-medium">
                    Adresse email
                  </Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="docteur@hopital.fr"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 bg-gray-50/50 border-gray-200 focus:bg-white focus:border-indigo-400 transition-colors"
                      required
                    />
                  </div>
                </div>
                
                {/* Mot de passe */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label htmlFor="password" className="text-gray-700 font-medium">
                      Mot de passe
                    </Label>
                    <button
                      type="button"
                      className="text-sm text-indigo-600 hover:text-indigo-700 font-medium transition-colors"
                    >
                      Mot de passe oublié ?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-10 h-12 bg-gray-50/50 border-gray-200 focus:bg-white focus:border-indigo-400 transition-colors"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                    >
                      {showPassword ? (
                        <EyeOff className="h-5 w-5" />
                      ) : (
                        <Eye className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
                
                {/* Se souvenir de moi */}
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="remember"
                    checked={rememberMe}
                    onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                    className="border-gray-300 data-[state=checked]:bg-indigo-500 data-[state=checked]:border-indigo-500"
                  />
                  <Label
                    htmlFor="remember"
                    className="text-sm text-gray-600 cursor-pointer select-none"
                  >
                    Se souvenir de moi sur cet appareil
                  </Label>
                </div>
                
                {/* Bouton de connexion */}
                <Button
                  type="submit"
                  className="w-full h-12 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:from-indigo-600 hover:to-indigo-700 text-white font-semibold shadow-lg shadow-indigo-200 transition-all duration-200 hover:shadow-xl hover:shadow-indigo-300"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Connexion...</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <LogIn className="w-5 h-5" />
                      <span>Se connecter</span>
                    </div>
                  )}
                </Button>
              </form>
              
              {/* Comptes de démo */}
              <div className="mt-6 pt-6 border-t border-gray-100">
                <p className="text-xs text-center text-gray-500 mb-3">
                  Comptes de démonstration
                </p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('cardiologue@demo.fr');
                      setPassword('demo123');
                    }}
                    className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors text-center"
                  >
                    👨‍⚕️ Cardiologue
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('medecin@demo.fr');
                      setPassword('demo123');
                    }}
                    className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors text-center"
                  >
                    🩺 Médecin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('secretaire@demo.fr');
                      setPassword('demo123');
                    }}
                    className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors text-center"
                  >
                    👩‍💼 Secrétaire
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setEmail('admin@demo.fr');
                      setPassword('demo123');
                    }}
                    className="px-3 py-2 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 rounded-lg transition-colors text-center"
                  >
                    ⚙️ Admin
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Footer */}
          <p className="mt-8 text-center text-sm text-gray-500">
            © 2025 Xpress-ECG. Tous droits réservés.
            <br />
            <span className="text-xs text-gray-400">
              Plateforme sécurisée conforme aux normes de santé
            </span>
          </p>
        </div>
      </div>
    </div>
  );
}

