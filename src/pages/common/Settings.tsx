import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Moon,
  Sun,
  Globe,
  Keyboard,
  ArrowLeft,
  Save
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

interface SettingsData {
  notifications: {
    email: boolean;
    push: boolean;
    newECG: boolean;
    reportReady: boolean;
    secondOpinion: boolean;
  };
  appearance: {
    theme: 'light' | 'dark' | 'system';
    language: string;
  };
  shortcuts: {
    enabled: boolean;
  };
}

export function SettingsPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSaving, setIsSaving] = useState(false);
  
  const [settings, setSettings] = useState<SettingsData>({
    notifications: {
      email: true,
      push: true,
      newECG: true,
      reportReady: true,
      secondOpinion: true
    },
    appearance: {
      theme: 'light',
      language: 'fr'
    },
    shortcuts: {
      enabled: true
    }
  });

  const handleSave = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    setIsSaving(false);
    toast({
      title: "Paramètres enregistrés",
      description: "Vos préférences ont été mises à jour."
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Paramètres</h1>
        <p className="text-gray-500">Personnalisez votre expérience</p>
      </div>

      <div className="space-y-6">
        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-indigo-600" />
              Notifications
            </CardTitle>
            <CardDescription>
              Gérez vos préférences de notification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Notifications par email</Label>
                <p className="text-sm text-gray-500">Recevoir les notifications par email</p>
              </div>
              <Switch
                checked={settings.notifications.email}
                onCheckedChange={(checked) => 
                  setSettings(s => ({ ...s, notifications: { ...s.notifications, email: checked } }))
                }
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Notifications push</Label>
                <p className="text-sm text-gray-500">Notifications dans le navigateur</p>
              </div>
              <Switch
                checked={settings.notifications.push}
                onCheckedChange={(checked) => 
                  setSettings(s => ({ ...s, notifications: { ...s.notifications, push: checked } }))
                }
              />
            </div>

            <div className="border-t pt-4 space-y-4">
              <Label className="text-sm font-medium text-gray-700">Types de notifications</Label>
              
              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-normal">Nouvel ECG reçu</Label>
                </div>
                <Switch
                  checked={settings.notifications.newECG}
                  onCheckedChange={(checked) => 
                    setSettings(s => ({ ...s, notifications: { ...s.notifications, newECG: checked } }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-normal">Rapport prêt</Label>
                </div>
                <Switch
                  checked={settings.notifications.reportReady}
                  onCheckedChange={(checked) => 
                    setSettings(s => ({ ...s, notifications: { ...s.notifications, reportReady: checked } }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label className="font-normal">Demande de second avis</Label>
                </div>
                <Switch
                  checked={settings.notifications.secondOpinion}
                  onCheckedChange={(checked) => 
                    setSettings(s => ({ ...s, notifications: { ...s.notifications, secondOpinion: checked } }))
                  }
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Apparence */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sun className="h-5 w-5 text-indigo-600" />
              Apparence
            </CardTitle>
            <CardDescription>
              Personnalisez l'interface
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center justify-between">
              <div>
                <Label>Thème</Label>
                <p className="text-sm text-gray-500">Choisissez le thème de l'interface</p>
              </div>
              <Select
                value={settings.appearance.theme}
                onValueChange={(value: 'light' | 'dark' | 'system') => 
                  setSettings(s => ({ ...s, appearance: { ...s.appearance, theme: value } }))
                }
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="light">
                    <div className="flex items-center gap-2">
                      <Sun className="h-4 w-4" />
                      Clair
                    </div>
                  </SelectItem>
                  <SelectItem value="dark">
                    <div className="flex items-center gap-2">
                      <Moon className="h-4 w-4" />
                      Sombre
                    </div>
                  </SelectItem>
                  <SelectItem value="system">Système</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label>Langue</Label>
                <p className="text-sm text-gray-500">Langue de l'interface</p>
              </div>
              <Select
                value={settings.appearance.language}
                onValueChange={(value) => 
                  setSettings(s => ({ ...s, appearance: { ...s.appearance, language: value } }))
                }
              >
                <SelectTrigger className="w-[180px]">
                  <Globe className="h-4 w-4 mr-2" />
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fr">Français</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Raccourcis clavier */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Keyboard className="h-5 w-5 text-indigo-600" />
              Raccourcis clavier
            </CardTitle>
            <CardDescription>
              Activez les raccourcis pour une navigation plus rapide
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <Label>Activer les raccourcis</Label>
                <p className="text-sm text-gray-500">Ctrl+F pour rechercher, etc.</p>
              </div>
              <Switch
                checked={settings.shortcuts.enabled}
                onCheckedChange={(checked) => 
                  setSettings(s => ({ ...s, shortcuts: { enabled: checked } }))
                }
              />
            </div>
          </CardContent>
        </Card>

        {/* Bouton de sauvegarde */}
        <div className="flex justify-end">
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Enregistrement...
              </>
            ) : (
              <>
                <Save className="h-4 w-4 mr-2" />
                Enregistrer les paramètres
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
