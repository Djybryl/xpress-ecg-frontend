import { useState } from 'react';
import { Settings, DollarSign, Building2, TrendingUp, Save, RotateCcw, Eye, History } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useEconomyStore } from '@/stores/useEconomyStore';
import { useAdminStore } from '@/stores/useAdminStore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function TarifSettings() {
  const { tarifConfig, bonusConfig, hospitalTarifs, configHistory, updateTarifConfig, updateBonusConfig, setHospitalTarif, removeHospitalTarif, resetToDefaults } = useEconomyStore();
  const { hospitals } = useAdminStore();
  const { toast } = useToast();

  // État local pour le formulaire
  const [localConfig, setLocalConfig] = useState(tarifConfig);
  const [localBonus, setLocalBonus] = useState(bonusConfig);
  const [hasChanges, setHasChanges] = useState(false);

  // Mise à jour config locale
  const updateLocal = (field: keyof typeof localConfig, value: number) => {
    let newConfig = { ...localConfig, [field]: value };
    
    // Auto-calcul platformPercent
    if (field === 'cardiologuePercent' || field === 'medecinPercent') {
      newConfig.platformPercent = 100 - newConfig.cardiologuePercent - newConfig.medecinPercent;
    }
    
    setLocalConfig(newConfig);
    setHasChanges(true);
  };

  // Sauvegarde
  const handleSave = () => {
    // Validation
    const total = localConfig.cardiologuePercent + localConfig.medecinPercent + localConfig.platformPercent;
    if (total !== 100) {
      toast({
        variant: "destructive",
        title: "Erreur de configuration",
        description: `Le total doit faire 100% (actuellement ${total}%)`,
      });
      return;
    }

    if (localConfig.platformPercent < 10) {
      toast({
        variant: "destructive",
        title: "⚠️ Attention",
        description: "La marge plateforme est très faible (< 10%). Cela peut affecter la viabilité.",
      });
    }

    updateTarifConfig(localConfig, 'USR-004', 'Admin Principal');
    updateBonusConfig(localBonus);
    setHasChanges(false);
    
    toast({
      title: "✅ Configuration sauvegardée",
      description: "Les nouveaux paramètres tarifaires sont actifs.",
    });
  };

  // Presets rapides
  const applyPreset = (preset: 'standard' | 'generous' | 'balanced') => {
    const presets = {
      standard: { cardiologuePercent: 60, medecinPercent: 15, platformPercent: 25 },
      generous: { cardiologuePercent: 70, medecinPercent: 20, platformPercent: 10 },
      balanced: { cardiologuePercent: 50, medecinPercent: 25, platformPercent: 25 },
    };
    setLocalConfig({ ...localConfig, ...presets[preset] });
    setHasChanges(true);
  };

  // Format FCFA
  const formatFCFA = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(amount) + ' FCFA';
  };

  // Calculs simulateur
  const cardioPerEcg = (localConfig.ecgCostPatient * localConfig.cardiologuePercent) / 100;
  const medecinPerEcg = (localConfig.ecgCostPatient * localConfig.medecinPercent) / 100;
  const platformPerEcg = (localConfig.ecgCostPatient * localConfig.platformPercent) / 100;

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Settings className="h-6 w-6 text-indigo-600" />
            Paramètres Tarifaires & Répartition
          </h1>
          <p className="text-gray-500 mt-1">Configuration des coûts ECG et émoluments</p>
          {configHistory.length > 0 && (
            <p className="text-xs text-gray-400 mt-1">
              Dernière modification : {format(new Date(configHistory[0].timestamp), 'dd MMM yyyy à HH:mm', { locale: fr })} par {configHistory[0].userName}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2">
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <History className="h-4 w-4 mr-2" />
                Historique
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[600px] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Historique des modifications</DialogTitle>
                <DialogDescription>
                  Toutes les modifications de configuration tarifaire
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-3">
                {configHistory.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">Aucune modification enregistrée</p>
                ) : (
                  configHistory.map((item) => (
                    <div key={item.id} className="p-3 border rounded-lg bg-gray-50">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium">{item.userName}</span>
                        <span className="text-xs text-gray-500">
                          {format(new Date(item.timestamp), 'dd MMM yyyy HH:mm', { locale: fr })}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600">{item.changes}</p>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>
          {hasChanges && (
            <Badge variant="secondary" className="animate-pulse">
              Modifications non sauvegardées
            </Badge>
          )}
        </div>
      </div>

      {/* Tarification Patient */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <DollarSign className="h-5 w-5 text-green-600" />
            Tarification Patient
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ecg-cost" className="text-base font-semibold">
              💳 Coût de l'ECG pour le patient
            </Label>
            <div className="flex items-center gap-4">
              <Input
                id="ecg-cost"
                type="number"
                value={localConfig.ecgCostPatient}
                onChange={(e) => updateLocal('ecgCostPatient', Number(e.target.value))}
                className="w-64 text-lg font-mono"
              />
              <span className="text-lg font-semibold text-gray-700">FCFA</span>
            </div>
            <p className="text-sm text-gray-500">ℹ️ Tarif standard appliqué à tous les ECG</p>
          </div>

          {/* Tarifs spéciaux établissements */}
          <div className="pt-4 border-t">
            <Label className="text-base font-semibold mb-3 block">
              🏥 Tarifs spéciaux par établissement (optionnel)
            </Label>
            <div className="space-y-2">
              {hospitals.map((hospital) => {
                const customTarif = hospitalTarifs.find(h => h.hospitalId === hospital.id);
                const isEnabled = customTarif?.enabled || false;
                const customCost = customTarif?.customCost || localConfig.ecgCostPatient;
                
                return (
                  <div key={hospital.id} className="flex items-center gap-4 p-3 bg-gray-50 rounded-lg">
                    <Switch
                      checked={isEnabled}
                      onCheckedChange={(checked) => {
                        setHospitalTarif(hospital.id, hospital.name, customCost, checked);
                        setHasChanges(true);
                      }}
                    />
                    <span className="text-sm font-medium flex-1">{hospital.name}</span>
                    {isEnabled ? (
                      <>
                        <Input
                          type="number"
                          value={customCost}
                          onChange={(e) => {
                            setHospitalTarif(hospital.id, hospital.name, Number(e.target.value), true);
                            setHasChanges(true);
                          }}
                          className="w-32 text-sm"
                        />
                        <span className="text-sm text-gray-600">FCFA</span>
                        {customCost < localConfig.ecgCostPatient && (
                          <Badge variant="secondary" className="bg-blue-100 text-blue-700">💡 Réduit</Badge>
                        )}
                        {customCost > localConfig.ecgCostPatient && (
                          <Badge variant="secondary" className="bg-amber-100 text-amber-700">💰 Premium</Badge>
                        )}
                      </>
                    ) : (
                      <span className="text-sm text-gray-400">Tarif standard ({formatFCFA(localConfig.ecgCostPatient)})</span>
                    )}
                  </div>
                );
              })}
            </div>
            <p className="text-xs text-gray-500 mt-2">
              💡 Coché = tarif spécifique, décoché = tarif standard
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Répartition des émoluments */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-indigo-600" />
            Répartition des Émoluments
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Presets rapides */}
          <div>
            <Label className="text-sm font-medium mb-2 block">💡 Presets rapides :</Label>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => applyPreset('standard')}>
                Standard 60/15/25
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyPreset('generous')}>
                Généreux 70/20/10
              </Button>
              <Button variant="outline" size="sm" onClick={() => applyPreset('balanced')}>
                Équilibré 50/25/25
              </Button>
            </div>
          </div>

          {/* Simulateur temps réel */}
          <div className="p-4 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border">
            <p className="text-sm font-semibold text-gray-700 mb-4">
              📊 Simulateur en temps réel
            </p>
            <p className="text-xs text-gray-500 mb-4">
              Pour un ECG à {formatFCFA(localConfig.ecgCostPatient)} :
            </p>

            {/* Cardiologue */}
            <div className="space-y-4">
              <div className="p-4 bg-white rounded-lg border border-indigo-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-indigo-700">👨‍⚕️ CARDIOLOGUE</span>
                  {localConfig.platformPercent < 15 && (
                    <Badge variant="secondary" className="bg-amber-100 text-amber-700 text-xs">
                      ⚠️ Marge faible
                    </Badge>
                  )}
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Label htmlFor="cardio-percent" className="text-sm w-24">Pourcentage:</Label>
                    <Input
                      id="cardio-percent"
                      type="number"
                      min="0"
                      max="100"
                      value={localConfig.cardiologuePercent}
                      onChange={(e) => updateLocal('cardiologuePercent', Number(e.target.value))}
                      className="w-20"
                    />
                    <span className="text-sm">%</span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500">Émolument par ECG :</p>
                    <p className="text-lg font-bold text-indigo-600">{formatFCFA(cardioPerEcg)}</p>
                  </div>
                </div>
              </div>

              {/* Second Avis */}
              <div className="p-4 bg-white rounded-lg border border-purple-200">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-semibold text-purple-700">👥 SECOND AVIS (Senior)</span>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Label htmlFor="second-opinion" className="text-sm w-24">Émolument fixe:</Label>
                    <Input
                      id="second-opinion"
                      type="number"
                      value={localConfig.secondOpinionCost}
                      onChange={(e) => updateLocal('secondOpinionCost', Number(e.target.value))}
                      className="w-32"
                    />
                    <span className="text-sm">FCFA</span>
                  </div>
                  <p className="text-xs text-gray-500 pt-2 border-t">
                    Émolument distinct pour chaque second avis donné
                  </p>
                </div>
              </div>

              {/* Médecin référent */}
              <div className="p-4 bg-white rounded-lg border border-emerald-200">
                <span className="text-sm font-semibold text-emerald-700 block mb-3">🩺 MÉDECIN RÉFÉRENT</span>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Label htmlFor="medecin-percent" className="text-sm w-24">Pourcentage:</Label>
                    <Input
                      id="medecin-percent"
                      type="number"
                      min="0"
                      max="100"
                      value={localConfig.medecinPercent}
                      onChange={(e) => updateLocal('medecinPercent', Number(e.target.value))}
                      className="w-20"
                    />
                    <span className="text-sm">%</span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500">Émolument par ECG :</p>
                    <p className="text-lg font-bold text-emerald-600">{formatFCFA(medecinPerEcg)}</p>
                  </div>
                </div>
              </div>

              {/* Plateforme */}
              <div className="p-4 bg-white rounded-lg border border-slate-200">
                <span className="text-sm font-semibold text-slate-700 block mb-3">🏢 PLATEFORME XPRESS ECG</span>
                <div className="space-y-2">
                  <div className="flex items-center gap-3">
                    <Label className="text-sm w-24">Pourcentage:</Label>
                    <Input
                      type="number"
                      value={localConfig.platformPercent}
                      disabled
                      className="w-20 bg-gray-100"
                    />
                    <span className="text-sm text-gray-500">(auto-calculé)</span>
                  </div>
                  <div className="pt-2 border-t">
                    <p className="text-xs text-gray-500">Revenus par ECG :</p>
                    <p className="text-lg font-bold text-slate-600">{formatFCFA(platformPerEcg)}</p>
                  </div>
                </div>
              </div>

              {/* Total */}
              <div className={cn(
                "p-4 rounded-lg border-2",
                localConfig.platformPercent === 25 ? "bg-green-50 border-green-300" : "bg-amber-50 border-amber-300"
              )}>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-semibold">
                    {localConfig.platformPercent === 25 ? "✅" : "⚠️"} TOTAL
                  </span>
                  <span className={cn(
                    "text-2xl font-bold",
                    localConfig.platformPercent === 25 ? "text-green-700" : "text-amber-700"
                  )}>
                    {localConfig.cardiologuePercent + localConfig.medecinPercent + localConfig.platformPercent}%
                  </span>
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  {formatFCFA(localConfig.ecgCostPatient)} = {formatFCFA(cardioPerEcg)} + {formatFCFA(medecinPerEcg)} + {formatFCFA(platformPerEcg)}
                </p>
              </div>
            </div>
          </div>

          {localConfig.platformPercent < 15 && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <p className="text-sm text-amber-800">
                ⚠️ Attention : La marge plateforme est très faible ({localConfig.platformPercent}%). Cela peut affecter la viabilité économique.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Système de Bonus */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-amber-600" />
            Système de Bonus
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <Label htmlFor="bonus-enabled" className="text-base font-semibold">
              Activer les bonus de performance
            </Label>
            <Switch
              id="bonus-enabled"
              checked={localBonus.enabled}
              onCheckedChange={(checked) => {
                setLocalBonus({ ...localBonus, enabled: checked });
                setHasChanges(true);
              }}
            />
          </div>

          {localBonus.enabled && (
            <div className="space-y-4 pl-4 border-l-2 border-indigo-200">
              {/* Bonus Cardiologues */}
              <div className="space-y-3">
                <p className="text-sm font-semibold text-indigo-700">BONUS CARDIOLOGUES</p>
                
                {/* Volume */}
                <div className="flex items-center gap-4 p-3 bg-indigo-50 rounded-lg">
                  <Switch
                    checked={localBonus.volumeEnabled}
                    onCheckedChange={(checked) => {
                      setLocalBonus({ ...localBonus, volumeEnabled: checked });
                      setHasChanges(true);
                    }}
                  />
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Bonus volume</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-600">Si &gt;</span>
                      <Input
                        type="number"
                        value={localBonus.volumeThreshold}
                        onChange={(e) => {
                          setLocalBonus({ ...localBonus, volumeThreshold: Number(e.target.value) });
                          setHasChanges(true);
                        }}
                        className="w-20 h-7 text-xs"
                        disabled={!localBonus.volumeEnabled}
                      />
                      <span className="text-xs text-gray-600">ECG/mois → +</span>
                      <Input
                        type="number"
                        value={localBonus.volumeBonus}
                        onChange={(e) => {
                          setLocalBonus({ ...localBonus, volumeBonus: Number(e.target.value) });
                          setHasChanges(true);
                        }}
                        className="w-16 h-7 text-xs"
                        disabled={!localBonus.volumeEnabled}
                      />
                      <span className="text-xs text-gray-600">% sur total</span>
                    </div>
                  </div>
                </div>

                {/* Qualité */}
                <div className="flex items-center gap-4 p-3 bg-green-50 rounded-lg">
                  <Switch
                    checked={localBonus.qualityEnabled}
                    onCheckedChange={(checked) => {
                      setLocalBonus({ ...localBonus, qualityEnabled: checked });
                      setHasChanges(true);
                    }}
                  />
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Bonus qualité</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-600">Si qualité &gt;</span>
                      <Input
                        type="number"
                        value={localBonus.qualityThreshold}
                        onChange={(e) => {
                          setLocalBonus({ ...localBonus, qualityThreshold: Number(e.target.value) });
                          setHasChanges(true);
                        }}
                        className="w-16 h-7 text-xs"
                        disabled={!localBonus.qualityEnabled}
                      />
                      <span className="text-xs text-gray-600">% → +</span>
                      <Input
                        type="number"
                        value={localBonus.qualityBonus}
                        onChange={(e) => {
                          setLocalBonus({ ...localBonus, qualityBonus: Number(e.target.value) });
                          setHasChanges(true);
                        }}
                        className="w-16 h-7 text-xs"
                        disabled={!localBonus.qualityEnabled}
                      />
                      <span className="text-xs text-gray-600">% sur total</span>
                    </div>
                  </div>
                </div>

                {/* Rapidité */}
                <div className="flex items-center gap-4 p-3 bg-orange-50 rounded-lg">
                  <Switch
                    checked={localBonus.urgentEnabled}
                    onCheckedChange={(checked) => {
                      setLocalBonus({ ...localBonus, urgentEnabled: checked });
                      setHasChanges(true);
                    }}
                  />
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Bonus rapidité (urgents)</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-600">Si &lt; 1h pour urgents → +</span>
                      <Input
                        type="number"
                        value={localBonus.urgentBonus}
                        onChange={(e) => {
                          setLocalBonus({ ...localBonus, urgentBonus: Number(e.target.value) });
                          setHasChanges(true);
                        }}
                        className="w-24 h-7 text-xs"
                        disabled={!localBonus.urgentEnabled}
                      />
                      <span className="text-xs text-gray-600">FCFA/ECG</span>
                    </div>
                  </div>
                </div>

                {/* Astreinte */}
                <div className="flex items-center gap-4 p-3 bg-purple-50 rounded-lg">
                  <Switch
                    checked={localBonus.onCallEnabled}
                    onCheckedChange={(checked) => {
                      setLocalBonus({ ...localBonus, onCallEnabled: checked });
                      setHasChanges(true);
                    }}
                  />
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Prime astreinte</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-600">Par garde nuit/week-end → +</span>
                      <Input
                        type="number"
                        value={localBonus.onCallAmount}
                        onChange={(e) => {
                          setLocalBonus({ ...localBonus, onCallAmount: Number(e.target.value) });
                          setHasChanges(true);
                        }}
                        className="w-24 h-7 text-xs"
                        disabled={!localBonus.onCallEnabled}
                      />
                      <span className="text-xs text-gray-600">FCFA/garde</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bonus Médecins référents */}
              <div className="space-y-3 pt-4 border-t">
                <p className="text-sm font-semibold text-emerald-700">BONUS MÉDECINS RÉFÉRENTS</p>
                
                <div className="flex items-center gap-4 p-3 bg-emerald-50 rounded-lg">
                  <Switch
                    checked={localBonus.loyaltyEnabled}
                    onCheckedChange={(checked) => {
                      setLocalBonus({ ...localBonus, loyaltyEnabled: checked });
                      setHasChanges(true);
                    }}
                  />
                  <div className="flex-1">
                    <Label className="text-sm font-medium">Bonus fidélité</Label>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-gray-600">Si &gt;</span>
                      <Input
                        type="number"
                        value={localBonus.loyaltyThreshold}
                        onChange={(e) => {
                          setLocalBonus({ ...localBonus, loyaltyThreshold: Number(e.target.value) });
                          setHasChanges(true);
                        }}
                        className="w-20 h-7 text-xs"
                        disabled={!localBonus.loyaltyEnabled}
                      />
                      <span className="text-xs text-gray-600">ECG envoyés/mois → +</span>
                      <Input
                        type="number"
                        value={localBonus.loyaltyBonus}
                        onChange={(e) => {
                          setLocalBonus({ ...localBonus, loyaltyBonus: Number(e.target.value) });
                          setHasChanges(true);
                        }}
                        className="w-16 h-7 text-xs"
                        disabled={!localBonus.loyaltyEnabled}
                      />
                      <span className="text-xs text-gray-600">% sur total</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex items-center justify-between sticky bottom-0 bg-white border-t p-4 shadow-lg">
        <Button
          variant="outline"
          onClick={() => {
            setLocalConfig(tarifConfig);
            setLocalBonus(bonusConfig);
            setHasChanges(false);
          }}
          disabled={!hasChanges}
        >
          <RotateCcw className="h-4 w-4 mr-2" />
          Annuler
        </Button>
        
        <div className="flex gap-2">
          <Button
            variant="secondary"
            onClick={() => {
              if (window.confirm('Êtes-vous sûr de vouloir réinitialiser aux valeurs par défaut ?')) {
                resetToDefaults();
                setLocalConfig(tarifConfig);
                setLocalBonus(bonusConfig);
                setHasChanges(false);
                toast({
                  title: "Configuration réinitialisée",
                  description: "Les valeurs par défaut ont été restaurées.",
                });
              }
            }}
          >
            <RotateCcw className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
          
          <Button
            onClick={handleSave}
            disabled={!hasChanges}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            <Save className="h-4 w-4 mr-2" />
            Enregistrer les modifications
          </Button>
        </div>
      </div>
    </div>
  );
}
