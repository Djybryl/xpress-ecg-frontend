import { useState } from 'react';
import { 
  Settings, 
  ArrowLeft, 
  Sun,
  Bell,
  Volume2,
  VolumeX,
  Keyboard,
  Save,
  RotateCcw,
  Zap,
  Grid3X3,
  Activity
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAppStore } from '@/stores/appStore';
import { ThemeToggle } from '@/components/shared/ThemeToggle';

interface SettingsPageProps {
  onBack: () => void;
}

export function SettingsPage({ onBack }: SettingsPageProps) {
  const { preferences, updatePreferences, setShowKeyboardShortcuts, setShowOnboarding } = useAppStore();
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);

  const [localPrefs, setLocalPrefs] = useState(preferences);

  const updateLocalPref = <K extends keyof typeof localPrefs>(key: K, value: typeof localPrefs[K]) => {
    setLocalPrefs(prev => ({ ...prev, [key]: value }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    updatePreferences(localPrefs);
    setIsSaving(false);
    setHasChanges(false);
  };

  const handleReset = () => {
    setLocalPrefs(preferences);
    setHasChanges(false);
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
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Paramètres
            </h1>
          </div>
          {hasChanges && (
            <div className="flex items-center gap-2">
              <Button variant="outline" onClick={handleReset}>
                <RotateCcw className="h-4 w-4 mr-2" />
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
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Appearance */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Sun className="h-5 w-5 text-indigo-600" />
              Apparence
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Thème</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Choisissez le thème de l'interface
                </p>
              </div>
              <ThemeToggle variant="full" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Langue</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Langue de l'interface
                </p>
              </div>
              <select 
                value={localPrefs.language}
                onChange={(e) => updateLocalPref('language', e.target.value as 'fr' | 'en' | 'es')}
                className="px-3 py-2 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
              >
                <option value="fr">🇫🇷 Français</option>
                <option value="en">🇬🇧 English</option>
                <option value="es">🇪🇸 Español</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Bell className="h-5 w-5 text-indigo-600" />
              Notifications
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                {localPrefs.soundEnabled ? (
                  <Volume2 className="h-5 w-5 text-indigo-600" />
                ) : (
                  <VolumeX className="h-5 w-5 text-gray-400" />
                )}
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Sons d'alerte</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Jouer un son pour les ECG urgents
                  </p>
                </div>
              </div>
              <button
                onClick={() => updateLocalPref('soundEnabled', !localPrefs.soundEnabled)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  localPrefs.soundEnabled ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  localPrefs.soundEnabled ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* ECG Viewer Defaults */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Activity className="h-5 w-5 text-indigo-600" />
              Visualiseur ECG par défaut
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Vitesse de défilement</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Vitesse par défaut à l'ouverture
                </p>
              </div>
              <div className="flex rounded-lg border dark:border-gray-700 overflow-hidden">
                <button
                  onClick={() => updateLocalPref('defaultSpeed', 25)}
                  className={`px-4 py-2 text-sm font-medium transition-colors ${
                    localPrefs.defaultSpeed === 25 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  25 mm/s
                </button>
                <button
                  onClick={() => updateLocalPref('defaultSpeed', 50)}
                  className={`px-4 py-2 text-sm font-medium transition-colors border-l dark:border-gray-700 ${
                    localPrefs.defaultSpeed === 50 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                >
                  50 mm/s
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Amplitude</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Amplitude par défaut à l'ouverture
                </p>
              </div>
              <div className="flex rounded-lg border dark:border-gray-700 overflow-hidden">
                {[5, 10, 20].map((amp) => (
                  <button
                    key={amp}
                    onClick={() => updateLocalPref('defaultAmplitude', amp as 5 | 10 | 20)}
                    className={`px-4 py-2 text-sm font-medium transition-colors border-l first:border-l-0 dark:border-gray-700 ${
                      localPrefs.defaultAmplitude === amp 
                        ? 'bg-indigo-600 text-white' 
                        : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {amp}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <div className="flex items-center gap-3">
                <Grid3X3 className="h-5 w-5 text-indigo-600" />
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">Afficher la grille</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Afficher la grille ECG par défaut
                  </p>
                </div>
              </div>
              <button
                onClick={() => updateLocalPref('showGrid', !localPrefs.showGrid)}
                className={`relative w-12 h-6 rounded-full transition-colors ${
                  localPrefs.showGrid ? 'bg-indigo-600' : 'bg-gray-300 dark:bg-gray-600'
                }`}
              >
                <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  localPrefs.showGrid ? 'left-7' : 'left-1'
                }`} />
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Auto-save */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-indigo-600" />
              Sauvegarde automatique
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Intervalle de sauvegarde</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Fréquence de sauvegarde automatique des brouillons
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={localPrefs.autoSaveInterval}
                  onChange={(e) => updateLocalPref('autoSaveInterval', parseInt(e.target.value) || 30)}
                  className="w-20 text-center"
                  min={10}
                  max={120}
                />
                <span className="text-sm text-gray-500">secondes</span>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">Éléments par page</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Nombre d'ECG affichés par page dans le tableau
                </p>
              </div>
              <select
                value={localPrefs.itemsPerPage}
                onChange={(e) => updateLocalPref('itemsPerPage', parseInt(e.target.value))}
                className="px-3 py-2 border dark:border-gray-700 rounded-lg bg-white dark:bg-gray-800 text-sm"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          </CardContent>
        </Card>

        {/* Help & Support */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Keyboard className="h-5 w-5 text-indigo-600" />
              Aide
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setShowKeyboardShortcuts(true)}
            >
              <Keyboard className="h-4 w-4 mr-2" />
              Voir les raccourcis clavier
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => setShowOnboarding(true)}
            >
              <Activity className="h-4 w-4 mr-2" />
              Revoir le tutoriel d'introduction
            </Button>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
