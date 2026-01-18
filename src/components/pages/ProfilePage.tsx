import { useState } from 'react';
import { 
  User, 
  Mail, 
  Phone, 
  Building2, 
  Key, 
  Camera, 
  Save, 
  ArrowLeft,
  Shield,
  FileSignature,
  Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ProfilePageProps {
  user: {
    name: string;
    email: string;
    role: string;
  };
  onBack: () => void;
}

export function ProfilePage({ user, onBack }: ProfilePageProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  
  const [profile, setProfile] = useState({
    firstName: user.name.split(' ')[1] || '',
    lastName: user.name.split(' ')[0] || '',
    email: user.email,
    phone: '+33 6 12 34 56 78',
    rpps: '10101010101',
    specialty: 'Cardiologie',
    hospital: 'Hôpital Saint-Louis',
    signature: '',
  });

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1500));
    setIsSaving(false);
    setIsEditing(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={onBack}>
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Mon Profil</h1>
          </div>
          <div className="flex items-center gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Annuler
                </Button>
                <Button onClick={handleSave} disabled={isSaving} className="bg-indigo-600 hover:bg-indigo-700">
                  {isSaving ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </>
            ) : (
              <Button onClick={() => setIsEditing(true)} variant="outline">
                Modifier
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Profile Header */}
        <div className="bg-white dark:bg-gray-800 rounded-xl p-6 border dark:border-gray-700">
          <div className="flex items-center gap-6">
            <div className="relative">
              <div className="w-24 h-24 bg-gradient-to-br from-indigo-400 to-indigo-600 rounded-full flex items-center justify-center text-white text-3xl font-bold">
                {profile.lastName.charAt(0)}{profile.firstName.charAt(0)}
              </div>
              {isEditing && (
                <button className="absolute bottom-0 right-0 w-8 h-8 bg-indigo-600 hover:bg-indigo-700 rounded-full flex items-center justify-center text-white shadow-lg transition-colors">
                  <Camera className="h-4 w-4" />
                </button>
              )}
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {profile.lastName} {profile.firstName}
              </h2>
              <p className="text-gray-500 dark:text-gray-400 capitalize">{user.role}</p>
              <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">
                RPPS: {profile.rpps}
              </p>
            </div>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Personal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <User className="h-5 w-5 text-indigo-600" />
                Informations personnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nom</Label>
                  <Input
                    value={profile.lastName}
                    onChange={(e) => setProfile({ ...profile, lastName: e.target.value })}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Prénom</Label>
                  <Input
                    value={profile.firstName}
                    onChange={(e) => setProfile({ ...profile, firstName: e.target.value })}
                    disabled={!isEditing}
                    className="mt-1"
                  />
                </div>
              </div>
              
              <div>
                <Label>Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>

              <div>
                <Label>Téléphone</Label>
                <div className="relative mt-1">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    value={profile.phone}
                    onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                    disabled={!isEditing}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Professional Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Building2 className="h-5 w-5 text-indigo-600" />
                Informations professionnelles
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label>Numéro RPPS</Label>
                <Input
                  value={profile.rpps}
                  onChange={(e) => setProfile({ ...profile, rpps: e.target.value })}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Spécialité</Label>
                <Input
                  value={profile.specialty}
                  onChange={(e) => setProfile({ ...profile, specialty: e.target.value })}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>Établissement principal</Label>
                <Input
                  value={profile.hospital}
                  onChange={(e) => setProfile({ ...profile, hospital: e.target.value })}
                  disabled={!isEditing}
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Electronic Signature */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <FileSignature className="h-5 w-5 text-indigo-600" />
                Signature électronique
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed dark:border-gray-700 rounded-lg p-8 text-center">
                <FileSignature className="h-12 w-12 mx-auto text-gray-300 dark:text-gray-600 mb-3" />
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                  Votre signature apparaîtra sur les rapports validés
                </p>
                {isEditing && (
                  <Button variant="outline" size="sm">
                    <Camera className="h-4 w-4 mr-2" />
                    Télécharger une signature
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Security */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-lg">
                <Shield className="h-5 w-5 text-indigo-600" />
                Sécurité
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button variant="outline" className="w-full justify-start">
                <Key className="h-4 w-4 mr-2" />
                Changer le mot de passe
              </Button>
              
              <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Authentification à deux facteurs
                  </span>
                  <span className="px-2 py-1 bg-amber-100 text-amber-700 text-xs font-semibold rounded-full">
                    Désactivée
                  </span>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-3">
                  Ajoutez une couche de sécurité supplémentaire à votre compte
                </p>
                <Button variant="outline" size="sm">
                  Activer la 2FA
                </Button>
              </div>

              <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div className="flex items-center gap-3">
                  <Clock className="h-5 w-5 text-gray-400" />
                  <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Dernière connexion
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Aujourd'hui à 09:30 - Paris, France
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
