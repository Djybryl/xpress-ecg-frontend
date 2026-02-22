import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload,
  FileImage,
  User,
  Calendar,
  AlertCircle,
  X,
  Check,
  ArrowLeft,
  ArrowRight,
  Search,
  Plus,
  UserPlus,
  ZoomIn,
  ZoomOut,
  RotateCw,
  Trash2
} from 'lucide-react';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { usePatientStore, type Patient } from "@/stores/usePatientStore";
import { cn } from "@/lib/utils";

// Formats ECG acceptés (specs métier)
const ACCEPTED_FORMATS = {
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'application/pdf': ['.pdf'],
  'application/dicom': ['.dcm'],
  'application/octet-stream': ['.dcm', '.scp', '.wfdb'],
};
const ACCEPTED_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.pdf', '.dcm', '.scp', '.wfdb'];
const MAX_FILE_SIZE_MB = 20;
const ACCEPTED_MIME_ACCEPT = 'image/jpeg,image/png,application/pdf,.dcm,.scp,.wfdb';

function validateFile(file: File): string | null {
  const ext = '.' + file.name.split('.').pop()?.toLowerCase();
  if (!ACCEPTED_EXTENSIONS.includes(ext)) {
    return `Format non supporté : ${ext}. Formats acceptés : ${ACCEPTED_EXTENSIONS.join(', ')}`;
  }
  if (file.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
    return `Fichier trop volumineux (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum : ${MAX_FILE_SIZE_MB} MB`;
  }
  return null;
}

// Templates de contexte clinique
const clinicalTemplates = [
  { id: 'chest_pain', label: 'Douleur thoracique', text: 'Patient présentant une douleur thoracique. ' },
  { id: 'palpitations', label: 'Palpitations', text: 'Patient se plaignant de palpitations. ' },
  { id: 'dyspnea', label: 'Dyspnée', text: 'Patient présentant une dyspnée. ' },
  { id: 'syncope', label: 'Syncope/Malaise', text: 'Patient ayant présenté un malaise/syncope. ' },
  { id: 'checkup', label: 'Bilan systématique', text: 'ECG réalisé dans le cadre d\'un bilan systématique. ' },
  { id: 'preop', label: 'Bilan pré-opératoire', text: 'ECG pré-opératoire. ' },
  { id: 'followup', label: 'Suivi', text: 'ECG de contrôle/suivi. ' },
];

interface FormData {
  // Étape 1 : Patient
  patient: Patient | null;
  isNewPatient: boolean;
  newPatient: {
    name: string;
    dateOfBirth: string;
    gender: 'M' | 'F' | '';
    phone: string;
    email: string;
  };
  // Étape 2 : ECG
  ecgDate: string;
  files: File[];
  filesPreviews: string[];
  // Étape 3 : Contexte
  urgency: 'normal' | 'urgent';
  clinicalContext: string;
}

type Step = 1 | 2 | 3;

export function NewECGPage() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { patients, searchPatients, addPatient } = usePatientStore();
  
  const [currentStep, setCurrentStep] = useState<Step>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewPatientDialog, setShowNewPatientDialog] = useState(false);
  const [previewZoom, setPreviewZoom] = useState(1);
  const [isDragging, setIsDragging] = useState(false);
  const [fileErrors, setFileErrors] = useState<string[]>([]);
  
  const [formData, setFormData] = useState<FormData>({
    patient: null,
    isNewPatient: false,
    newPatient: {
      name: '',
      dateOfBirth: '',
      gender: '',
      phone: '',
      email: '',
    },
    ecgDate: new Date().toISOString().split('T')[0],
    files: [],
    filesPreviews: [],
    urgency: 'normal',
    clinicalContext: '',
  });

  const filteredPatients = searchQuery ? searchPatients(searchQuery) : patients.slice(0, 5);

  // Validation des étapes
  const isStep1Valid = formData.patient !== null;
  const isStep2Valid = formData.files.length > 0;
  const isStep3Valid = true; // Le contexte est optionnel

  const canProceed = (step: Step): boolean => {
    switch (step) {
      case 1: return isStep1Valid;
      case 2: return isStep2Valid;
      case 3: return isStep3Valid;
      default: return false;
    }
  };

  // Validation et ajout de fichiers
  const processFiles = useCallback((files: File[]) => {
    const errors: string[] = [];
    const validFiles: File[] = [];

    files.forEach(file => {
      const error = validateFile(file);
      if (error) {
        errors.push(`${file.name} : ${error}`);
      } else {
        validFiles.push(file);
      }
    });

    setFileErrors(errors);

    if (errors.length > 0 && validFiles.length === 0) return;

    validFiles.forEach(file => {
      if (file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          setFormData(prev => ({
            ...prev,
            filesPreviews: [...prev.filesPreviews, e.target?.result as string]
          }));
        };
        reader.readAsDataURL(file);
      } else {
        setFormData(prev => ({
          ...prev,
          filesPreviews: [...prev.filesPreviews, '']
        }));
      }
    });

    setFormData(prev => ({
      ...prev,
      files: [...prev.files, ...validFiles],
    }));
  }, []);

  const handleFileChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    processFiles(Array.from(e.target.files || []));
    e.target.value = '';
  }, [processFiles]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => setIsDragging(false), []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(Array.from(e.dataTransfer.files));
  }, [processFiles]);

  const removeFile = (index: number) => {
    setFormData(prev => ({
      ...prev,
      files: prev.files.filter((_, i) => i !== index),
      filesPreviews: prev.filesPreviews.filter((_, i) => i !== index),
    }));
  };

  // Sélection d'un patient existant
  const selectPatient = (patient: Patient) => {
    setFormData(prev => ({
      ...prev,
      patient,
      isNewPatient: false,
    }));
    setSearchQuery('');
  };

  // Création d'un nouveau patient
  const handleCreatePatient = () => {
    if (!formData.newPatient.name || !formData.newPatient.gender || !formData.newPatient.dateOfBirth) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive"
      });
      return;
    }

    const newPatient = addPatient({
      name: formData.newPatient.name,
      dateOfBirth: formData.newPatient.dateOfBirth,
      gender: formData.newPatient.gender as 'M' | 'F',
      phone: formData.newPatient.phone || undefined,
      email: formData.newPatient.email || undefined,
    });

    setFormData(prev => ({
      ...prev,
      patient: newPatient,
      isNewPatient: true,
    }));

    setShowNewPatientDialog(false);
    toast({
      title: "Patient créé",
      description: `${newPatient.name} a été ajouté à votre liste de patients.`
    });
  };

  // Ajout d'un template de contexte
  const addTemplate = (templateId: string) => {
    const template = clinicalTemplates.find(t => t.id === templateId);
    if (template) {
      setFormData(prev => ({
        ...prev,
        clinicalContext: prev.clinicalContext + template.text
      }));
    }
  };

  // Navigation entre étapes
  const nextStep = () => {
    if (currentStep < 3 && canProceed(currentStep)) {
      setCurrentStep((currentStep + 1) as Step);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep((currentStep - 1) as Step);
    }
  };

  // Soumission
  const handleSubmit = async () => {
    if (!formData.patient || formData.files.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner un patient et ajouter au moins un fichier ECG.",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulation d'envoi
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    toast({
      title: "ECG envoyé avec succès ! 🎉",
      description: `Demande d'interprétation pour ${formData.patient.name} transmise.`,
    });
    
    setIsSubmitting(false);
    navigate('/medecin/requests');
  };

  // Calcul de l'âge
  const calculateAge = (dateOfBirth: string) => {
    const today = new Date();
    const birth = new Date(dateOfBirth);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    return age;
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="mb-6">
        <Button 
          variant="ghost" 
          className="mb-4"
          onClick={() => navigate('/medecin')}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Retour au tableau de bord
        </Button>
        <h1 className="text-2xl font-bold text-gray-900">Nouvelle demande d'interprétation ECG</h1>
        <p className="text-gray-500">Suivez les étapes pour envoyer votre ECG</p>
      </div>

      {/* Indicateur d'étapes */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          {[
            { step: 1, label: 'Patient', icon: User },
            { step: 2, label: 'ECG', icon: FileImage },
            { step: 3, label: 'Confirmation', icon: Check },
          ].map(({ step, label, icon: Icon }, index) => (
            <div key={step} className="flex items-center">
              <div className="flex flex-col items-center">
                <div
                  className={cn(
                    'w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-colors',
                    currentStep === step
                      ? 'bg-indigo-600 text-white'
                      : currentStep > step
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 text-gray-500'
                  )}
                >
                  {currentStep > step ? (
                    <Check className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span className={cn(
                  'text-sm mt-2 font-medium',
                  currentStep === step ? 'text-indigo-600' : 'text-gray-500'
                )}>
                  {label}
                </span>
              </div>
              {index < 2 && (
                <div className={cn(
                  'w-24 h-1 mx-4 rounded',
                  currentStep > step ? 'bg-green-500' : 'bg-gray-200'
                )} />
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Étape 1 : Sélection du patient */}
      {currentStep === 1 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5 text-indigo-600" />
              Sélectionner un patient
            </CardTitle>
            <CardDescription>
              Recherchez un patient existant ou créez-en un nouveau
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Patient sélectionné */}
            {formData.patient && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-green-900">{formData.patient.name}</p>
                      <p className="text-sm text-green-700">
                        {formData.patient.gender === 'M' ? 'Homme' : 'Femme'} • {calculateAge(formData.patient.dateOfBirth)} ans • {formData.patient.id}
                      </p>
                      {formData.patient.ecgCount > 0 && (
                        <p className="text-xs text-green-600 mt-1">
                          {formData.patient.ecgCount} ECG précédent{formData.patient.ecgCount > 1 ? 's' : ''}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setFormData(prev => ({ ...prev, patient: null }))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            )}

            {/* Recherche */}
            {!formData.patient && (
              <>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher par nom, ID ou date de naissance..."
                    className="pl-10"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>

                {/* Liste des patients */}
                <div className="border rounded-lg divide-y max-h-[300px] overflow-auto">
                  {filteredPatients.length > 0 ? (
                    filteredPatients.map(patient => (
                      <div
                        key={patient.id}
                        className="p-3 hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => selectPatient(patient)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className={cn(
                              'w-10 h-10 rounded-full flex items-center justify-center',
                              patient.gender === 'M' ? 'bg-blue-100' : 'bg-pink-100'
                            )}>
                              <User className={cn(
                                'h-5 w-5',
                                patient.gender === 'M' ? 'text-blue-600' : 'text-pink-600'
                              )} />
                            </div>
                            <div>
                              <p className="font-medium">{patient.name}</p>
                              <p className="text-sm text-gray-500">
                                {patient.gender === 'M' ? 'H' : 'F'} • {calculateAge(patient.dateOfBirth)} ans • {patient.id}
                              </p>
                            </div>
                          </div>
                          {patient.ecgCount > 0 && (
                            <Badge variant="secondary" className="text-xs">
                              {patient.ecgCount} ECG
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-6 text-center text-gray-500">
                      <p>Aucun patient trouvé</p>
                    </div>
                  )}
                </div>

                {/* Bouton nouveau patient */}
                <Button
                  variant="outline"
                  className="w-full"
                  onClick={() => setShowNewPatientDialog(true)}
                >
                  <UserPlus className="h-4 w-4 mr-2" />
                  Créer un nouveau patient
                </Button>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* Étape 2 : Upload ECG */}
      {currentStep === 2 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileImage className="h-5 w-5 text-indigo-600" />
              Télécharger l'ECG
            </CardTitle>
            <CardDescription>
              Ajoutez l'image ou le fichier de l'électrocardiogramme
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Date de l'ECG */}
            <div className="space-y-2">
              <Label htmlFor="ecgDate">Date de l'ECG</Label>
              <Input
                id="ecgDate"
                type="date"
                value={formData.ecgDate}
                onChange={(e) => setFormData(prev => ({ ...prev, ecgDate: e.target.value }))}
              />
            </div>

            {/* Zone d'upload drag-and-drop */}
            <div
              className={cn(
                'border-2 border-dashed rounded-lg p-8 text-center transition-colors',
                isDragging
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-300 hover:border-indigo-400'
              )}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
            >
              <input
                type="file"
                id="ecgFile"
                className="hidden"
                accept={ACCEPTED_MIME_ACCEPT}
                multiple
                onChange={handleFileChange}
              />
              <label htmlFor="ecgFile" className="cursor-pointer">
                <Upload className={cn(
                  'h-12 w-12 mx-auto mb-4 transition-colors',
                  isDragging ? 'text-indigo-500' : 'text-gray-400'
                )} />
                <p className="text-lg font-medium text-gray-700">
                  {isDragging ? 'Déposez les fichiers ici' : 'Cliquez ou glissez-déposez'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  JPG, PNG, PDF, DICOM (.dcm), SCP-ECG (.scp), WFDB (.wfdb)
                </p>
                <p className="text-xs text-gray-400 mt-0.5">
                  Taille maximale : {MAX_FILE_SIZE_MB} MB par fichier
                </p>
              </label>
            </div>

            {/* Erreurs de validation */}
            {fileErrors.length > 0 && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-3 space-y-1">
                {fileErrors.map((err, i) => (
                  <p key={i} className="text-sm text-red-600 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 flex-shrink-0 mt-0.5" />
                    {err}
                  </p>
                ))}
              </div>
            )}

            {/* Prévisualisation des fichiers */}
            {formData.files.length > 0 && (
              <div className="space-y-4">
                <Label>Fichiers sélectionnés ({formData.files.length})</Label>
                
                {formData.filesPreviews.map((preview, index) => (
                  <div key={index} className="border rounded-lg overflow-hidden">
                    {/* Barre d'outils */}
                    <div className="flex items-center justify-between p-2 bg-gray-50 border-b">
                      <div className="flex items-center gap-2">
                        <FileImage className="h-4 w-4 text-indigo-600" />
                        <span className="text-sm font-medium">{formData.files[index]?.name}</span>
                        <span className="text-xs text-gray-500">
                          ({(formData.files[index]?.size / 1024 / 1024).toFixed(2)} MB)
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setPreviewZoom(z => Math.max(0.5, z - 0.25))}
                        >
                          <ZoomOut className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setPreviewZoom(z => Math.min(2, z + 0.25))}
                        >
                          <ZoomIn className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setPreviewZoom(1)}
                        >
                          <RotateCw className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-red-600 hover:text-red-700"
                          onClick={() => removeFile(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    {/* Image preview */}
                    {preview && (
                      <div className="p-4 bg-gray-100 overflow-auto max-h-[400px]">
                        <img
                          src={preview}
                          alt={`ECG preview ${index + 1}`}
                          className="max-w-full mx-auto transition-transform"
                          style={{ transform: `scale(${previewZoom})` }}
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Étape 3 : Contexte et confirmation */}
      {currentStep === 3 && (
        <div className="space-y-6">
          {/* Alerte urgence */}
          <Card className={cn(
            'border-2',
            formData.urgency === 'urgent' ? 'border-red-300 bg-red-50' : ''
          )}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <AlertCircle className={cn(
                    'h-6 w-6',
                    formData.urgency === 'urgent' ? 'text-red-600' : 'text-amber-600'
                  )} />
                  <div>
                    <p className={cn(
                      'font-semibold',
                      formData.urgency === 'urgent' ? 'text-red-800' : 'text-amber-800'
                    )}>
                      Demande urgente
                    </p>
                    <p className={cn(
                      'text-sm',
                      formData.urgency === 'urgent' ? 'text-red-600' : 'text-amber-600'
                    )}>
                      Cochez si l'interprétation est urgente (priorité haute)
                    </p>
                  </div>
                </div>
                <Switch
                  checked={formData.urgency === 'urgent'}
                  onCheckedChange={(checked) => 
                    setFormData(prev => ({ ...prev, urgency: checked ? 'urgent' : 'normal' }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Contexte clinique */}
          <Card>
            <CardHeader>
              <CardTitle>Contexte clinique</CardTitle>
              <CardDescription>
                Ajoutez des informations utiles pour l'interprétation (optionnel)
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Templates rapides */}
              <div>
                <Label className="text-sm text-gray-600">Motifs fréquents :</Label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {clinicalTemplates.map(template => (
                    <Button
                      key={template.id}
                      variant="outline"
                      size="sm"
                      onClick={() => addTemplate(template.id)}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {template.label}
                    </Button>
                  ))}
                </div>
              </div>

              <Textarea
                placeholder="Symptômes, antécédents, contexte de réalisation de l'ECG..."
                className="min-h-[150px]"
                value={formData.clinicalContext}
                onChange={(e) => setFormData(prev => ({ ...prev, clinicalContext: e.target.value }))}
              />
            </CardContent>
          </Card>

          {/* Récapitulatif */}
          <Card className="border-indigo-200 bg-indigo-50/50">
            <CardHeader>
              <CardTitle className="text-indigo-900">Récapitulatif de la demande</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Patient</p>
                  <p className="font-semibold">{formData.patient?.name}</p>
                  <p className="text-gray-600">
                    {formData.patient?.gender === 'M' ? 'Homme' : 'Femme'} • {formData.patient && calculateAge(formData.patient.dateOfBirth)} ans
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Date de l'ECG</p>
                  <p className="font-semibold">
                    {new Date(formData.ecgDate).toLocaleDateString('fr-FR', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric'
                    })}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Fichiers</p>
                  <p className="font-semibold">{formData.files.length} fichier(s)</p>
                </div>
                <div>
                  <p className="text-gray-500">Priorité</p>
                  {formData.urgency === 'urgent' ? (
                    <Badge variant="destructive">🚨 URGENT</Badge>
                  ) : (
                    <Badge variant="secondary">Normal</Badge>
                  )}
                </div>
                {formData.clinicalContext && (
                  <div className="col-span-2">
                    <p className="text-gray-500">Contexte clinique</p>
                    <p className="text-gray-700">{formData.clinicalContext}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Navigation */}
      <div className="flex items-center justify-between mt-8">
        <Button
          variant="outline"
          onClick={currentStep === 1 ? () => navigate('/medecin') : prevStep}
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          {currentStep === 1 ? 'Annuler' : 'Précédent'}
        </Button>

        {currentStep < 3 ? (
          <Button
            onClick={nextStep}
            disabled={!canProceed(currentStep)}
            className="bg-indigo-600 hover:bg-indigo-700"
          >
            Suivant
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        ) : (
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className={cn(
              'min-w-[200px]',
              formData.urgency === 'urgent' 
                ? 'bg-red-600 hover:bg-red-700' 
                : 'bg-indigo-600 hover:bg-indigo-700'
            )}
          >
            {isSubmitting ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                Envoi en cours...
              </>
            ) : (
              <>
                <Check className="h-4 w-4 mr-2" />
                {formData.urgency === 'urgent' ? 'Envoyer en URGENT' : 'Envoyer la demande'}
              </>
            )}
          </Button>
        )}
      </div>

      {/* Dialog nouveau patient */}
      <Dialog open={showNewPatientDialog} onOpenChange={setShowNewPatientDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Créer un nouveau patient</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="newPatientName">Nom complet *</Label>
              <Input
                id="newPatientName"
                placeholder="Nom et prénom"
                value={formData.newPatient.name}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  newPatient: { ...prev.newPatient, name: e.target.value }
                }))}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="newPatientDob">Date de naissance *</Label>
                <Input
                  id="newPatientDob"
                  type="date"
                  value={formData.newPatient.dateOfBirth}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    newPatient: { ...prev.newPatient, dateOfBirth: e.target.value }
                  }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="newPatientGender">Sexe *</Label>
                <Select
                  value={formData.newPatient.gender}
                  onValueChange={(value) => setFormData(prev => ({
                    ...prev,
                    newPatient: { ...prev.newPatient, gender: value as 'M' | 'F' }
                  }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="M">Masculin</SelectItem>
                    <SelectItem value="F">Féminin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPatientPhone">Téléphone</Label>
              <Input
                id="newPatientPhone"
                type="tel"
                placeholder="+33 6 12 34 56 78"
                value={formData.newPatient.phone}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  newPatient: { ...prev.newPatient, phone: e.target.value }
                }))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPatientEmail">Email</Label>
              <Input
                id="newPatientEmail"
                type="email"
                placeholder="patient@email.fr"
                value={formData.newPatient.email}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  newPatient: { ...prev.newPatient, email: e.target.value }
                }))}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowNewPatientDialog(false)}>
              Annuler
            </Button>
            <Button onClick={handleCreatePatient}>
              <UserPlus className="h-4 w-4 mr-2" />
              Créer le patient
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
