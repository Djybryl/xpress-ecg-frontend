import { useState } from 'react';
import { 
  Star, 
  Plus, 
  Edit, 
  Trash2, 
  Eye, 
  ToggleLeft,
  ToggleRight,
  Search,
  Users,
  DollarSign,
  TrendingUp,
  AlertCircle,
  CheckCircle2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
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
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useEconomyStore, SpecialEmolument } from '@/stores/useEconomyStore';
import { useAdminStore } from '@/stores/useAdminStore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function SpecialEmoluments() {
  const { 
    specialEmoluments, 
    tarifConfig, 
    addSpecialEmolument, 
    updateSpecialEmolument, 
    deleteSpecialEmolument 
  } = useEconomyStore();
  const { users, hospitals } = useAdminStore();
  const { toast } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<'all' | 'cardiologue' | 'medecin'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedEmolument, setSelectedEmolument] = useState<SpecialEmolument | null>(null);
  const [isNew, setIsNew] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    userId: '',
    userName: '',
    userRole: 'cardiologue' as 'cardiologue' | 'medecin',
    isActive: true,
    type: 'percentage' as 'percentage' | 'fixed_per_ecg' | 'hybrid',
    percentageOverride: 70,
    fixedAmountPerEcg: 12000,
    basePercentage: 50,
    bonusPerEcg: 2000,
    minEcgPerMonth: 0,
    specificHospitals: [] as string[],
    validUntil: '',
    reason: '',
  });

  // Format FCFA
  const formatFCFA = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(Math.round(amount)) + ' FCFA';
  };

  // Filtrage
  const filteredEmoluments = specialEmoluments.filter(se => {
    const matchesSearch = se.userName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          se.userId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesRole = roleFilter === 'all' || se.userRole === roleFilter;
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' && se.isActive) ||
                          (statusFilter === 'inactive' && !se.isActive);
    return matchesSearch && matchesRole && matchesStatus;
  });

  // Stats
  const stats = {
    total: specialEmoluments.length,
    active: specialEmoluments.filter(se => se.isActive).length,
    cardiologues: specialEmoluments.filter(se => se.userRole === 'cardiologue').length,
    medecins: specialEmoluments.filter(se => se.userRole === 'medecin').length,
  };

  // Handlers
  const handleOpenNew = () => {
    setIsNew(true);
    setFormData({
      userId: '',
      userName: '',
      userRole: 'cardiologue',
      isActive: true,
      type: 'percentage',
      percentageOverride: 70,
      fixedAmountPerEcg: 12000,
      basePercentage: 50,
      bonusPerEcg: 2000,
      minEcgPerMonth: 0,
      specificHospitals: [],
      validUntil: '',
      reason: '',
    });
    setEditDialogOpen(true);
  };

  const handleOpenEdit = (emolument: SpecialEmolument) => {
    setIsNew(false);
    setSelectedEmolument(emolument);
    setFormData({
      userId: emolument.userId,
      userName: emolument.userName,
      userRole: emolument.userRole,
      isActive: emolument.isActive,
      type: emolument.customRate.type,
      percentageOverride: emolument.customRate.percentageOverride || 70,
      fixedAmountPerEcg: emolument.customRate.fixedAmountPerEcg || 12000,
      basePercentage: emolument.customRate.basePercentage || 50,
      bonusPerEcg: emolument.customRate.bonusPerEcg || 2000,
      minEcgPerMonth: emolument.conditions?.minEcgPerMonth || 0,
      specificHospitals: emolument.conditions?.specificHospitals || [],
      validUntil: emolument.conditions?.validUntil || '',
      reason: emolument.reason,
    });
    setEditDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.userId || !formData.reason) {
      toast({
        variant: "destructive",
        title: "Champs requis",
        description: "Veuillez sélectionner un utilisateur et fournir une raison.",
      });
      return;
    }

    const emolumentData: Omit<SpecialEmolument, 'id' | 'createdAt'> = {
      userId: formData.userId,
      userName: formData.userName,
      userRole: formData.userRole,
      isActive: formData.isActive,
      customRate: {
        type: formData.type,
        percentageOverride: formData.type === 'percentage' ? formData.percentageOverride : undefined,
        fixedAmountPerEcg: formData.type === 'fixed_per_ecg' ? formData.fixedAmountPerEcg : undefined,
        basePercentage: formData.type === 'hybrid' ? formData.basePercentage : undefined,
        bonusPerEcg: formData.type === 'hybrid' ? formData.bonusPerEcg : undefined,
      },
      conditions: {
        minEcgPerMonth: formData.minEcgPerMonth > 0 ? formData.minEcgPerMonth : undefined,
        specificHospitals: formData.specificHospitals.length > 0 ? formData.specificHospitals : undefined,
        validUntil: formData.validUntil || undefined,
      },
      reason: formData.reason,
      createdBy: 'USR-004',
      createdByName: 'Admin Principal',
      updatedAt: isNew ? undefined : new Date().toISOString(),
    };

    if (isNew) {
      addSpecialEmolument(emolumentData);
      toast({
        title: "✅ Émolument spécial créé",
        description: `Tarif personnalisé activé pour ${formData.userName}`,
      });
    } else if (selectedEmolument) {
      updateSpecialEmolument(selectedEmolument.id, emolumentData);
      toast({
        title: "✅ Émolument spécial modifié",
        description: `Les paramètres ont été mis à jour.`,
      });
    }

    setEditDialogOpen(false);
  };

  const handleDelete = () => {
    if (selectedEmolument) {
      deleteSpecialEmolument(selectedEmolument.id);
      toast({
        title: "Émolument spécial supprimé",
        description: `Le tarif personnalisé a été retiré.`,
        variant: "destructive",
      });
    }
    setDeleteDialogOpen(false);
    setSelectedEmolument(null);
  };

  const handleToggleStatus = (emolument: SpecialEmolument) => {
    updateSpecialEmolument(emolument.id, { isActive: !emolument.isActive });
    toast({
      title: emolument.isActive ? "Émolument désactivé" : "Émolument activé",
      description: `Le tarif de ${emolument.userName} est ${emolument.isActive ? 'inactif' : 'actif'}.`,
    });
  };

  // Sélection utilisateur
  const handleUserChange = (userId: string) => {
    const user = users.find(u => u.id === userId);
    if (user) {
      setFormData(prev => ({
        ...prev,
        userId: user.id,
        userName: user.name,
        userRole: user.role === 'cardiologue' ? 'cardiologue' : 'medecin',
      }));
    }
  };

  // Simulateur
  const getSimulation = () => {
    const baseEcgCost = tarifConfig.ecgCostPatient;
    const standardPercent = formData.userRole === 'cardiologue' ? tarifConfig.cardiologuePercent : tarifConfig.medecinPercent;
    const standardAmount = (baseEcgCost * standardPercent) / 100;
    
    let specialAmount = 0;
    
    if (formData.type === 'percentage') {
      specialAmount = (baseEcgCost * formData.percentageOverride) / 100;
    } else if (formData.type === 'fixed_per_ecg') {
      specialAmount = formData.fixedAmountPerEcg;
    } else if (formData.type === 'hybrid') {
      specialAmount = (baseEcgCost * formData.basePercentage) / 100 + formData.bonusPerEcg;
    }
    
    const difference = specialAmount - standardAmount;
    const percentDiff = ((difference / standardAmount) * 100).toFixed(1);
    
    return { standardAmount, specialAmount, difference, percentDiff };
  };

  const simulation = getSimulation();

  return (
    <div className="space-y-3">
      {/* En-tête compact */}
      <div className="flex items-center justify-between h-12">
        <div className="flex items-center gap-2">
          <Star className="h-5 w-5 text-amber-600" />
          <h1 className="text-lg font-semibold text-slate-800">Émoluments Spéciaux</h1>
          <span className="text-xs text-slate-400">({stats.total} paramétrés, {stats.active} actifs)</span>
        </div>
        <Button onClick={handleOpenNew} size="sm" className="bg-amber-600 hover:bg-amber-700 h-8">
          <Plus className="h-3.5 w-3.5 mr-1.5" />
          Nouveau tarif spécial
        </Button>
      </div>

      {/* Filtres inline */}
      <div className="flex items-center gap-2 bg-white p-2.5 rounded-lg border border-slate-200">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-400" />
          <Input
            placeholder="Rechercher praticien..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8 h-8 text-xs"
          />
        </div>
        <Select value={roleFilter} onValueChange={(v: any) => setRoleFilter(v)}>
          <SelectTrigger className="w-[140px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous rôles</SelectItem>
            <SelectItem value="cardiologue">Cardiologues</SelectItem>
            <SelectItem value="medecin">Médecins</SelectItem>
          </SelectContent>
        </Select>
        <Select value={statusFilter} onValueChange={(v: any) => setStatusFilter(v)}>
          <SelectTrigger className="w-[120px] h-8 text-xs">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Tous</SelectItem>
            <SelectItem value="active">Actifs</SelectItem>
            <SelectItem value="inactive">Inactifs</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Stats inline */}
      <div className="flex items-center gap-3 text-xs bg-slate-50 px-3 py-2 rounded border border-slate-200">
        <span className="flex items-center gap-1.5">
          <Star className="h-3.5 w-3.5 text-amber-500" />
          <strong>{stats.active}</strong> actifs
        </span>
        <span className="text-slate-300">|</span>
        <span className="flex items-center gap-1.5">
          👨‍⚕️ <strong>{stats.cardiologues}</strong> cardiologues
        </span>
        <span className="text-slate-300">|</span>
        <span className="flex items-center gap-1.5">
          🩺 <strong>{stats.medecins}</strong> médecins référents
        </span>
      </div>

      {/* Table */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base">Liste des tarifs spéciaux ({filteredEmoluments.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {filteredEmoluments.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <Star className="h-12 w-12 mx-auto text-gray-300 mb-3" />
              <p className="text-sm">Aucun émolument spécial paramétré</p>
              <p className="text-xs mt-1">Créez un tarif personnalisé pour un praticien VIP</p>
            </div>
          ) : (
            <Table>
              <TableHeader className="bg-slate-50 h-9">
                <TableRow>
                  <TableHead className="text-xs">Praticien</TableHead>
                  <TableHead className="text-xs">Rôle</TableHead>
                  <TableHead className="text-xs">Type de tarif</TableHead>
                  <TableHead className="text-xs">Valeur</TableHead>
                  <TableHead className="text-xs">vs Standard</TableHead>
                  <TableHead className="text-xs">Raison</TableHead>
                  <TableHead className="text-xs">Statut</TableHead>
                  <TableHead className="text-xs w-[100px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEmoluments.map((emolument) => {
                  const standardPercent = emolument.userRole === 'cardiologue' 
                    ? tarifConfig.cardiologuePercent 
                    : tarifConfig.medecinPercent;
                  
                  let customValue = '';
                  let vsStandard = '';
                  
                  if (emolument.customRate.type === 'percentage') {
                    customValue = `${emolument.customRate.percentageOverride}%`;
                    const diff = (emolument.customRate.percentageOverride || 0) - standardPercent;
                    vsStandard = diff > 0 ? `+${diff}%` : `${diff}%`;
                  } else if (emolument.customRate.type === 'fixed_per_ecg') {
                    customValue = formatFCFA(emolument.customRate.fixedAmountPerEcg || 0);
                    const standardAmount = (tarifConfig.ecgCostPatient * standardPercent) / 100;
                    const diff = (emolument.customRate.fixedAmountPerEcg || 0) - standardAmount;
                    vsStandard = diff > 0 ? `+${formatFCFA(diff)}` : formatFCFA(diff);
                  } else {
                    customValue = `${emolument.customRate.basePercentage}% + ${formatFCFA(emolument.customRate.bonusPerEcg || 0)}`;
                    vsStandard = '🔀 Hybride';
                  }

                  return (
                    <TableRow key={emolument.id} className="h-11 hover:bg-slate-50">
                      <TableCell className="py-2">
                        <div className="flex items-center gap-2">
                          <Star className={cn(
                            "h-3.5 w-3.5",
                            emolument.isActive ? "text-amber-500 fill-amber-500" : "text-gray-300"
                          )} />
                          <div>
                            <p className="text-xs font-medium">{emolument.userName}</p>
                            <p className="text-[10px] text-gray-500">{emolument.userId}</p>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge variant={emolument.userRole === 'cardiologue' ? 'default' : 'secondary'} className="text-[10px]">
                          {emolument.userRole === 'cardiologue' ? '👨‍⚕️ Cardio' : '🩺 Médecin'}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2">
                        <span className="text-xs">
                          {emolument.customRate.type === 'percentage' && '% Personnalisé'}
                          {emolument.customRate.type === 'fixed_per_ecg' && 'Montant fixe'}
                          {emolument.customRate.type === 'hybrid' && 'Hybride'}
                        </span>
                      </TableCell>
                      <TableCell className="py-2 font-mono text-xs font-semibold">
                        {customValue}
                      </TableCell>
                      <TableCell className="py-2">
                        <span className={cn(
                          "text-xs font-medium",
                          vsStandard.startsWith('+') ? "text-green-600" : vsStandard.startsWith('-') ? "text-red-600" : "text-slate-600"
                        )}>
                          {vsStandard}
                        </span>
                      </TableCell>
                      <TableCell className="py-2">
                        <p className="text-xs text-gray-600 truncate max-w-[200px]">{emolument.reason}</p>
                      </TableCell>
                      <TableCell className="py-2">
                        <Badge 
                          variant={emolument.isActive ? "default" : "secondary"}
                          className="text-[10px]"
                        >
                          {emolument.isActive ? '✓ Actif' : '○ Inactif'}
                        </Badge>
                      </TableCell>
                      <TableCell className="py-2">
                        <div className="flex items-center gap-1">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleToggleStatus(emolument)}
                          >
                            {emolument.isActive ? (
                              <ToggleRight className="h-3.5 w-3.5 text-green-600" />
                            ) : (
                              <ToggleLeft className="h-3.5 w-3.5 text-gray-400" />
                            )}
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => handleOpenEdit(emolument)}
                          >
                            <Edit className="h-3.5 w-3.5 text-blue-600" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 w-7 p-0"
                            onClick={() => {
                              setSelectedEmolument(emolument);
                              setDeleteDialogOpen(true);
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5 text-red-600" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Dialog Création/Édition */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Star className="h-5 w-5 text-amber-600" />
              {isNew ? 'Créer un tarif spécial' : 'Modifier le tarif spécial'}
            </DialogTitle>
            <DialogDescription>
              Paramétrez un émolument personnalisé pour un praticien spécifique
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            {/* Sélection praticien */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Praticien</Label>
                <Select 
                  value={formData.userId} 
                  onValueChange={handleUserChange}
                  disabled={!isNew}
                >
                  <SelectTrigger className="h-8 mt-1">
                    <SelectValue placeholder="Sélectionner..." />
                  </SelectTrigger>
                  <SelectContent>
                    {users
                      .filter(u => u.role === 'cardiologue' || u.role === 'medecin')
                      .map(u => (
                        <SelectItem key={u.id} value={u.id}>
                          {u.name} - {u.role === 'cardiologue' ? 'Cardiologue' : 'Médecin'}
                        </SelectItem>
                      ))
                    }
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-xs">Statut</Label>
                <Select 
                  value={formData.isActive ? 'active' : 'inactive'} 
                  onValueChange={(v) => setFormData(prev => ({ ...prev, isActive: v === 'active' }))}
                >
                  <SelectTrigger className="h-8 mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">✓ Actif</SelectItem>
                    <SelectItem value="inactive">○ Inactif</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Type de tarif */}
            <div>
              <Label className="text-xs">Type de tarif spécial</Label>
              <Select 
                value={formData.type} 
                onValueChange={(v: any) => setFormData(prev => ({ ...prev, type: v }))}
              >
                <SelectTrigger className="h-8 mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="percentage">📊 Pourcentage personnalisé</SelectItem>
                  <SelectItem value="fixed_per_ecg">💰 Montant fixe par ECG</SelectItem>
                  <SelectItem value="hybrid">🔀 Hybride (% + bonus fixe)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Paramètres selon type */}
            <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
              {formData.type === 'percentage' && (
                <div>
                  <Label className="text-xs">Pourcentage personnalisé (%)</Label>
                  <Input
                    type="number"
                    value={formData.percentageOverride}
                    onChange={(e) => setFormData(prev => ({ ...prev, percentageOverride: Number(e.target.value) }))}
                    className="h-8 mt-1"
                    min={0}
                    max={100}
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Standard : {formData.userRole === 'cardiologue' ? tarifConfig.cardiologuePercent : tarifConfig.medecinPercent}%
                  </p>
                </div>
              )}

              {formData.type === 'fixed_per_ecg' && (
                <div>
                  <Label className="text-xs">Montant fixe par ECG (FCFA)</Label>
                  <Input
                    type="number"
                    value={formData.fixedAmountPerEcg}
                    onChange={(e) => setFormData(prev => ({ ...prev, fixedAmountPerEcg: Number(e.target.value) }))}
                    className="h-8 mt-1"
                    step={500}
                  />
                  <p className="text-[10px] text-slate-500 mt-1">
                    Indépendant du coût patient (actuellement {formatFCFA(tarifConfig.ecgCostPatient)})
                  </p>
                </div>
              )}

              {formData.type === 'hybrid' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Base pourcentage (%)</Label>
                    <Input
                      type="number"
                      value={formData.basePercentage}
                      onChange={(e) => setFormData(prev => ({ ...prev, basePercentage: Number(e.target.value) }))}
                      className="h-8 mt-1"
                      min={0}
                      max={100}
                    />
                  </div>
                  <div>
                    <Label className="text-xs">+ Bonus par ECG (FCFA)</Label>
                    <Input
                      type="number"
                      value={formData.bonusPerEcg}
                      onChange={(e) => setFormData(prev => ({ ...prev, bonusPerEcg: Number(e.target.value) }))}
                      className="h-8 mt-1"
                      step={500}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Simulateur en temps réel */}
            <div className="p-3 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
              <div className="flex items-start gap-2 mb-2">
                <TrendingUp className="h-4 w-4 text-blue-600 mt-0.5" />
                <div className="flex-1">
                  <p className="text-xs font-semibold text-blue-800">Simulateur - Impact par ECG</p>
                  <div className="mt-2 space-y-1.5 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700">Tarif standard :</span>
                      <span className="font-mono font-bold">{formatFCFA(simulation.standardAmount)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-blue-700">Tarif spécial :</span>
                      <span className="font-mono font-bold text-green-700">{formatFCFA(simulation.specialAmount)}</span>
                    </div>
                    <div className="h-px bg-blue-300 my-1"></div>
                    <div className="flex items-center justify-between font-semibold">
                      <span>Différence :</span>
                      <span className={cn(
                        "font-mono",
                        simulation.difference > 0 ? "text-green-700" : "text-red-700"
                      )}>
                        {simulation.difference > 0 ? '+' : ''}{formatFCFA(simulation.difference)} ({simulation.percentDiff}%)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Conditions (optionnel) */}
            <details className="group">
              <summary className="cursor-pointer text-xs font-medium text-slate-700 hover:text-slate-900 list-none flex items-center gap-2">
                <span className="text-slate-400 group-open:rotate-90 transition-transform">▶</span>
                Conditions d'application (optionnel)
              </summary>
              <div className="mt-3 p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Minimum ECG/mois</Label>
                    <Input
                      type="number"
                      value={formData.minEcgPerMonth}
                      onChange={(e) => setFormData(prev => ({ ...prev, minEcgPerMonth: Number(e.target.value) }))}
                      className="h-8 mt-1"
                      placeholder="0 = toujours actif"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Date d'expiration</Label>
                    <Input
                      type="date"
                      value={formData.validUntil}
                      onChange={(e) => setFormData(prev => ({ ...prev, validUntil: e.target.value }))}
                      className="h-8 mt-1"
                    />
                  </div>
                </div>
                {/* TODO: Multi-select pour hôpitaux spécifiques */}
              </div>
            </details>

            {/* Raison (obligatoire) */}
            <div>
              <Label className="text-xs">
                Raison / Justification <span className="text-red-500">*</span>
              </Label>
              <Textarea
                value={formData.reason}
                onChange={(e) => setFormData(prev => ({ ...prev, reason: e.target.value }))}
                placeholder="Ex: Expert senior en électrophysiologie, Partenariat stratégique CHU..."
                className="mt-1 text-xs h-16 resize-none"
                maxLength={200}
              />
              <p className="text-[10px] text-slate-500 mt-1">{formData.reason.length}/200 caractères</p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" size="sm" onClick={() => setEditDialogOpen(false)}>
              Annuler
            </Button>
            <Button size="sm" onClick={handleSave} className="bg-amber-600 hover:bg-amber-700">
              <CheckCircle2 className="h-3.5 w-3.5 mr-1.5" />
              {isNew ? 'Créer' : 'Enregistrer'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Suppression */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Supprimer le tarif spécial ?</AlertDialogTitle>
            <AlertDialogDescription>
              Le tarif personnalisé pour <strong>{selectedEmolument?.userName}</strong> sera supprimé.
              Le praticien reviendra aux tarifs standards.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Supprimer
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
