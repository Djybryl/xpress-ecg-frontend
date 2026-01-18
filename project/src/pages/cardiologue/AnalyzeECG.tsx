import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  User,
  Building2,
  Clock,
  AlertCircle,
  Save,
  Send,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Ruler,
  Heart,
  Activity,
  FileText,
  CheckCircle2,
  Plus,
  X,
  ChevronDown,
  ChevronUp,
  Lightbulb
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
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
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { 
  useCardiologueStore, 
  conclusionTemplates, 
  findingsTemplates,
  type ECGMeasurements,
  type ECGInterpretation 
} from '@/stores/useCardiologueStore';
import { useToast } from "@/hooks/use-toast";
import { format, parseISO, formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';

export function AnalyzeECG() {
  const { ecgId } = useParams<{ ecgId: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const { getById, saveMeasurements, completeAnalysis, startAnalysis } = useCardiologueStore();

  const [ecg, setEcg] = useState(ecgId ? getById(ecgId) : null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [activeTab, setActiveTab] = useState('measurements');
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [findingsOpen, setFindingsOpen] = useState(true);
  
  // Mesures
  const [measurements, setMeasurements] = useState<ECGMeasurements>({
    heartRate: ecg?.measurements?.heartRate || undefined,
    prInterval: ecg?.measurements?.prInterval || undefined,
    qrsDuration: ecg?.measurements?.qrsDuration || undefined,
    qtInterval: ecg?.measurements?.qtInterval || undefined,
    qtcInterval: ecg?.measurements?.qtcInterval || undefined,
    axis: ecg?.measurements?.axis || '',
    rhythm: ecg?.measurements?.rhythm || 'Sinusal',
  });

  // Interprétation
  const [selectedFindings, setSelectedFindings] = useState<string[]>(
    ecg?.interpretation?.findings || []
  );
  const [customFinding, setCustomFinding] = useState('');
  const [conclusion, setConclusion] = useState(ecg?.interpretation?.conclusion || '');
  const [recommendations, setRecommendations] = useState(ecg?.interpretation?.recommendations || '');
  const [isNormal, setIsNormal] = useState(ecg?.interpretation?.isNormal ?? true);

  useEffect(() => {
    if (ecgId) {
      const foundEcg = getById(ecgId);
      if (foundEcg) {
        setEcg(foundEcg);
        if (foundEcg.status === 'pending') {
          startAnalysis(ecgId);
        }
      } else {
        toast({
          title: "ECG non trouvé",
          description: "L'ECG demandé n'existe pas.",
          variant: "destructive"
        });
        navigate('/cardiologue/pending');
      }
    }
  }, [ecgId]);

  // Calcul automatique du QTc (formule de Bazett)
  useEffect(() => {
    if (measurements.qtInterval && measurements.heartRate) {
      const rr = 60 / measurements.heartRate;
      const qtc = Math.round(measurements.qtInterval / Math.sqrt(rr));
      setMeasurements(prev => ({ ...prev, qtcInterval: qtc }));
    }
  }, [measurements.qtInterval, measurements.heartRate]);

  const handleAddFinding = (finding: string) => {
    if (!selectedFindings.includes(finding)) {
      setSelectedFindings([...selectedFindings, finding]);
    }
  };

  const handleRemoveFinding = (finding: string) => {
    setSelectedFindings(selectedFindings.filter(f => f !== finding));
  };

  const handleAddCustomFinding = () => {
    if (customFinding.trim() && !selectedFindings.includes(customFinding.trim())) {
      setSelectedFindings([...selectedFindings, customFinding.trim()]);
      setCustomFinding('');
    }
  };

  const handleApplyTemplate = (templateId: string) => {
    const template = conclusionTemplates.find(t => t.id === templateId);
    if (template) {
      setConclusion(template.text);
      setIsNormal(template.isNormal);
    }
  };

  const handleSave = () => {
    if (ecgId) {
      saveMeasurements(ecgId, measurements);
      toast({
        title: "Sauvegardé",
        description: "Les mesures ont été enregistrées."
      });
    }
  };

  const handleComplete = () => {
    if (!conclusion.trim()) {
      toast({
        title: "Conclusion requise",
        description: "Veuillez rédiger une conclusion avant de finaliser.",
        variant: "destructive"
      });
      return;
    }

    if (selectedFindings.length === 0) {
      toast({
        title: "Constatations requises",
        description: "Veuillez sélectionner au moins une constatation.",
        variant: "destructive"
      });
      return;
    }

    setConfirmDialogOpen(true);
  };

  const confirmComplete = () => {
    if (ecgId) {
      const interpretation: ECGInterpretation = {
        findings: selectedFindings,
        conclusion: conclusion,
        recommendations: recommendations || undefined,
        isNormal: isNormal,
      };

      completeAnalysis(ecgId, interpretation);
      
      toast({
        title: "Analyse terminée",
        description: "Le rapport a été envoyé pour distribution."
      });

      navigate('/cardiologue/pending');
    }
    setConfirmDialogOpen(false);
  };

  if (!ecg) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Activity className="h-12 w-12 mx-auto mb-4 text-gray-300 animate-pulse" />
          <p className="text-gray-500">Chargement de l'ECG...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between sticky top-0 bg-background z-10 py-2 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate('/cardiologue/pending')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold">{ecg.id}</h1>
              {ecg.urgency === 'urgent' && (
                <Badge className="bg-red-100 text-red-700 animate-pulse">URGENT</Badge>
              )}
            </div>
            <p className="text-sm text-gray-500">{ecg.patientName} • {ecg.patientAge} ans</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handleSave}>
            <Save className="h-4 w-4 mr-2" />
            Sauvegarder
          </Button>
          <Button onClick={handleComplete} className="bg-green-600 hover:bg-green-700">
            <Send className="h-4 w-4 mr-2" />
            Finaliser
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Colonne gauche: ECG + Informations */}
        <div className="lg:col-span-2 space-y-4">
          {/* Informations patient et contexte */}
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className={cn(
                    "h-12 w-12 rounded-full flex items-center justify-center",
                    ecg.urgency === 'urgent' ? "bg-red-100" : "bg-indigo-100"
                  )}>
                    <User className={cn(
                      "h-6 w-6",
                      ecg.urgency === 'urgent' ? "text-red-600" : "text-indigo-600"
                    )} />
                  </div>
                  <div>
                    <p className="font-semibold">{ecg.patientName}</p>
                    <p className="text-sm text-gray-500">
                      {ecg.patientGender === 'M' ? 'Homme' : 'Femme'}, {ecg.patientAge} ans
                    </p>
                    <p className="text-xs text-gray-400">ID: {ecg.patientId}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full flex items-center justify-center bg-gray-100">
                    <Building2 className="h-6 w-6 text-gray-600" />
                  </div>
                  <div>
                    <p className="font-semibold">{ecg.referringDoctor}</p>
                    <p className="text-sm text-gray-500">{ecg.hospital}</p>
                    <p className="text-xs text-gray-400">{ecg.referringDoctorEmail}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Contexte clinique */}
          <Card className={cn(
            ecg.urgency === 'urgent' && "border-red-200 bg-red-50/50"
          )}>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Contexte clinique
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className={cn(
                "text-sm",
                ecg.urgency === 'urgent' && "text-red-800 font-medium"
              )}>
                {ecg.clinicalContext}
              </p>
            </CardContent>
          </Card>

          {/* Visualisation ECG */}
          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Activity className="h-4 w-4" />
                  Tracé ECG
                </CardTitle>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoomLevel(Math.max(0.5, zoomLevel - 0.1))}>
                    <ZoomOut className="h-4 w-4" />
                  </Button>
                  <span className="text-xs w-12 text-center">{Math.round(zoomLevel * 100)}%</span>
                  <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setZoomLevel(Math.min(2, zoomLevel + 0.1))}>
                    <ZoomIn className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <RotateCw className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-8 w-8">
                    <Ruler className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div 
                className="bg-gray-50 rounded-lg border-2 border-dashed border-gray-200 min-h-[400px] flex items-center justify-center overflow-auto"
                style={{ transform: `scale(${zoomLevel})`, transformOrigin: 'top left' }}
              >
                {/* Placeholder pour le tracé ECG */}
                <div className="text-center text-gray-400">
                  <Activity className="h-16 w-16 mx-auto mb-4" />
                  <p className="font-medium">Tracé ECG 12 dérivations</p>
                  <p className="text-sm">Date: {format(parseISO(ecg.ecgDate), 'dd/MM/yyyy')}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Colonne droite: Analyse */}
        <div className="space-y-4">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="measurements">
                <Ruler className="h-4 w-4 mr-2" />
                Mesures
              </TabsTrigger>
              <TabsTrigger value="interpretation">
                <FileText className="h-4 w-4 mr-2" />
                Interprétation
              </TabsTrigger>
            </TabsList>

            {/* Onglet Mesures */}
            <TabsContent value="measurements" className="space-y-4">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Heart className="h-4 w-4 text-red-500" />
                    Mesures ECG
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Rythme */}
                  <div className="space-y-2">
                    <Label>Rythme</Label>
                    <Select 
                      value={measurements.rhythm} 
                      onValueChange={(value) => setMeasurements({...measurements, rhythm: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Sinusal">Sinusal</SelectItem>
                        <SelectItem value="FA">Fibrillation auriculaire</SelectItem>
                        <SelectItem value="Flutter">Flutter auriculaire</SelectItem>
                        <SelectItem value="Jonctionnel">Jonctionnel</SelectItem>
                        <SelectItem value="Ventriculaire">Ventriculaire</SelectItem>
                        <SelectItem value="Pacemaker">Rythme électro-entraîné</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Fréquence cardiaque */}
                  <div className="space-y-2">
                    <Label>Fréquence cardiaque (bpm)</Label>
                    <Input
                      type="number"
                      value={measurements.heartRate || ''}
                      onChange={(e) => setMeasurements({...measurements, heartRate: parseInt(e.target.value) || undefined})}
                      placeholder="60-100"
                    />
                  </div>

                  {/* Axe */}
                  <div className="space-y-2">
                    <Label>Axe électrique</Label>
                    <Select 
                      value={measurements.axis || ''} 
                      onValueChange={(value) => setMeasurements({...measurements, axis: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Normal (0° à +90°)">Normal (0° à +90°)</SelectItem>
                        <SelectItem value="Déviation gauche">Déviation gauche (&lt; 0°)</SelectItem>
                        <SelectItem value="Déviation droite">Déviation droite (&gt; +90°)</SelectItem>
                        <SelectItem value="Indéterminé">Indéterminé</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Intervalles */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-2">
                      <Label>PR (ms)</Label>
                      <Input
                        type="number"
                        value={measurements.prInterval || ''}
                        onChange={(e) => setMeasurements({...measurements, prInterval: parseInt(e.target.value) || undefined})}
                        placeholder="120-200"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>QRS (ms)</Label>
                      <Input
                        type="number"
                        value={measurements.qrsDuration || ''}
                        onChange={(e) => setMeasurements({...measurements, qrsDuration: parseInt(e.target.value) || undefined})}
                        placeholder="80-120"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>QT (ms)</Label>
                      <Input
                        type="number"
                        value={measurements.qtInterval || ''}
                        onChange={(e) => setMeasurements({...measurements, qtInterval: parseInt(e.target.value) || undefined})}
                        placeholder="350-440"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>QTc (ms)</Label>
                      <Input
                        type="number"
                        value={measurements.qtcInterval || ''}
                        readOnly
                        className="bg-gray-50"
                        placeholder="Auto"
                      />
                    </div>
                  </div>

                  {/* Indicateurs de normalité */}
                  <div className="p-3 bg-gray-50 rounded-lg text-xs space-y-1">
                    <p className="font-medium mb-2">Valeurs normales :</p>
                    <p>• FC: 60-100 bpm</p>
                    <p>• PR: 120-200 ms</p>
                    <p>• QRS: 80-120 ms</p>
                    <p>• QTc: &lt; 450 ms (H) / &lt; 460 ms (F)</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Onglet Interprétation */}
            <TabsContent value="interpretation" className="space-y-4">
              {/* Constatations */}
              <Card>
                <Collapsible open={findingsOpen} onOpenChange={setFindingsOpen}>
                  <CardHeader className="pb-2">
                    <CollapsibleTrigger className="flex items-center justify-between w-full">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <CheckCircle2 className="h-4 w-4 text-green-500" />
                        Constatations ({selectedFindings.length})
                      </CardTitle>
                      {findingsOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                    </CollapsibleTrigger>
                  </CardHeader>
                  <CollapsibleContent>
                    <CardContent className="space-y-3">
                      {/* Findings sélectionnés */}
                      {selectedFindings.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {selectedFindings.map(finding => (
                            <Badge 
                              key={finding} 
                              variant="secondary"
                              className="pl-2 pr-1 py-1 flex items-center gap-1"
                            >
                              {finding}
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-4 w-4 hover:bg-red-100"
                                onClick={() => handleRemoveFinding(finding)}
                              >
                                <X className="h-3 w-3" />
                              </Button>
                            </Badge>
                          ))}
                        </div>
                      )}

                      {/* Ajouter finding */}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Ajouter une constatation..."
                          value={customFinding}
                          onChange={(e) => setCustomFinding(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && handleAddCustomFinding()}
                        />
                        <Button size="icon" onClick={handleAddCustomFinding}>
                          <Plus className="h-4 w-4" />
                        </Button>
                      </div>

                      {/* Templates rapides */}
                      <div className="space-y-2">
                        <p className="text-xs font-medium text-gray-500">Suggestions :</p>
                        <div className="flex flex-wrap gap-1">
                          {findingsTemplates.slice(0, 10).map(finding => (
                            <Button
                              key={finding}
                              variant="outline"
                              size="sm"
                              className="h-7 text-xs"
                              onClick={() => handleAddFinding(finding)}
                              disabled={selectedFindings.includes(finding)}
                            >
                              {finding}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Collapsible>
              </Card>

              {/* Conclusion */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <FileText className="h-4 w-4" />
                    Conclusion
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {/* Templates de conclusion */}
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 flex items-center gap-1">
                      <Lightbulb className="h-3 w-3" />
                      Modèles rapides :
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {conclusionTemplates.map(template => (
                        <Button
                          key={template.id}
                          variant="outline"
                          size="sm"
                          className={cn(
                            "h-7 text-xs",
                            template.isNormal ? "border-green-200 hover:bg-green-50" : "border-amber-200 hover:bg-amber-50"
                          )}
                          onClick={() => handleApplyTemplate(template.id)}
                        >
                          {template.label}
                        </Button>
                      ))}
                    </div>
                  </div>

                  <Textarea
                    placeholder="Rédigez votre conclusion..."
                    value={conclusion}
                    onChange={(e) => setConclusion(e.target.value)}
                    className="min-h-[120px]"
                  />

                  {/* Normal / Anormal */}
                  <div className="flex items-center gap-4">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="normal"
                        checked={isNormal}
                        onCheckedChange={(checked) => setIsNormal(checked as boolean)}
                      />
                      <label
                        htmlFor="normal"
                        className={cn(
                          "text-sm font-medium",
                          isNormal ? "text-green-600" : "text-gray-500"
                        )}
                      >
                        ECG Normal
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="abnormal"
                        checked={!isNormal}
                        onCheckedChange={(checked) => setIsNormal(!(checked as boolean))}
                      />
                      <label
                        htmlFor="abnormal"
                        className={cn(
                          "text-sm font-medium",
                          !isNormal ? "text-amber-600" : "text-gray-500"
                        )}
                      >
                        ECG Anormal
                      </label>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Recommandations */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    Recommandations (optionnel)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Examens complémentaires, surveillance, etc."
                    value={recommendations}
                    onChange={(e) => setRecommendations(e.target.value)}
                    className="min-h-[80px]"
                  />
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>

          {/* Actions */}
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={handleSave}>
              <Save className="h-4 w-4 mr-2" />
              Sauvegarder
            </Button>
            <Button className="flex-1 bg-green-600 hover:bg-green-700" onClick={handleComplete}>
              <Send className="h-4 w-4 mr-2" />
              Finaliser
            </Button>
          </div>
        </div>
      </div>

      {/* Dialog de confirmation */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Confirmer la finalisation
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-gray-600">
              Vous êtes sur le point de finaliser l'interprétation de cet ECG. 
              Le rapport sera envoyé au médecin référent.
            </p>

            <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm">
              <p><strong>Patient:</strong> {ecg.patientName}</p>
              <p><strong>ECG:</strong> {ecg.id}</p>
              <p><strong>Résultat:</strong> 
                <Badge className={cn(
                  "ml-2",
                  isNormal ? "bg-green-100 text-green-700" : "bg-amber-100 text-amber-700"
                )}>
                  {isNormal ? 'Normal' : 'Anormal'}
                </Badge>
              </p>
              <p><strong>Constatations:</strong> {selectedFindings.length}</p>
            </div>

            <div className="bg-blue-50 border border-blue-200 p-3 rounded-lg text-sm text-blue-800">
              <p className="font-medium">Conclusion :</p>
              <p className="mt-1">{conclusion}</p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setConfirmDialogOpen(false)}>
              Annuler
            </Button>
            <Button onClick={confirmComplete} className="bg-green-600 hover:bg-green-700">
              <Send className="h-4 w-4 mr-2" />
              Confirmer et envoyer
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
