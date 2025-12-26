import { useState } from 'react';
import { ArrowLeft, Mail, Send, CheckCircle, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

interface ForgotPasswordPageProps {
  onBack: () => void;
}

export function ForgotPasswordPage({ onBack }: ForgotPasswordPageProps) {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    if (!email.includes('@')) {
      setError('Veuillez entrer une adresse email valide');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/50 rounded-full flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Email envoyé !
            </h2>
            <p className="text-gray-600 dark:text-gray-400 mb-6">
              Si un compte existe avec l'adresse <strong>{email}</strong>, vous recevrez un email avec les instructions pour réinitialiser votre mot de passe.
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
              N'oubliez pas de vérifier votre dossier spam.
            </p>
            <Button onClick={onBack} className="w-full bg-indigo-600 hover:bg-indigo-700">
              Retour à la connexion
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-white dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-2xl shadow-lg shadow-indigo-200 dark:shadow-none mb-4">
            <Heart className="w-8 h-8 text-white" fill="currentColor" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Xpress-ECG</h1>
        </div>

        <Card>
          <CardHeader>
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour à la connexion
            </button>
            <CardTitle>Mot de passe oublié ?</CardTitle>
            <CardDescription>
              Entrez votre adresse email et nous vous enverrons un lien pour réinitialiser votre mot de passe.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-600 dark:text-red-400">
                  {error}
                </div>
              )}

              <div>
                <Label htmlFor="email">Adresse email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="docteur@hopital.fr"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    Envoyer le lien
                  </>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-500 dark:text-gray-400 mt-6">
          Vous vous souvenez de votre mot de passe ?{' '}
          <button
            onClick={onBack}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Se connecter
          </button>
        </p>
      </div>
    </div>
  );
}
