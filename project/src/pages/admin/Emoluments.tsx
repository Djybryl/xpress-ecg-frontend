import { useState, useMemo } from 'react';
import { 
  CreditCard, 
  Search, 
  Download, 
  Mail, 
  Check, 
  Clock, 
  DollarSign,
  TrendingUp,
  FileText,
  Eye,
  Lock,
  ArrowUpDown
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
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Checkbox } from "@/components/ui/checkbox";
import { useEconomyStore, UserEmolument } from '@/stores/useEconomyStore';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export function Emoluments() {
  const { emoluments, tarifConfig, updateEmolumentStatus, validateMonth, generateMonthlyReport, getMonthlyReport } = useEconomyStore();
  const { toast } = useToast();

  const [selectedPeriod, setSelectedPeriod] = useState('2024-12');
  const [selectedRole, setSelectedRole] = useState<'all' | 'cardiologue' | 'medecin'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'amount' | 'ecg' | 'name'>('amount');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());

  // Filtrage et tri
  const filteredEmoluments = useMemo(() => {
    let filtered = emoluments.filter(e => e.period === selectedPeriod);
    
    if (selectedRole !== 'all') {
      filtered = filtered.filter(e => e.userRole === selectedRole);
    }
    
    if (searchQuery) {
      filtered = filtered.filter(e => 
        e.userName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        e.userId.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Tri
    filtered.sort((a, b) => {
      if (sortBy === 'amount') return b.totalGross - a.totalGross;
      if (sortBy === 'ecg') return b.ecgCount - a.ecgCount;
      if (sortBy === 'name') return a.userName.localeCompare(b.userName);
      return 0;
    });

    return filtered;
  }, [emoluments, selectedPeriod, selectedRole, searchQuery, sortBy]);

  // Calcul récapitulatif
  const summary = useMemo(() => {
    const cardiologues = filteredEmoluments.filter(e => e.userRole === 'cardiologue');
    const medecins = filteredEmoluments.filter(e => e.userRole === 'medecin');
    
    return {
      cardiologueCount: cardiologues.length,
      cardiologueTotal: cardiologues.reduce((sum, e) => sum + e.totalGross, 0),
      medecinCount: medecins.length,
      medecinTotal: medecins.reduce((sum, e) => sum + e.totalGross, 0),
      totalEmoluments: filteredEmoluments.reduce((sum, e) => sum + e.totalGross, 0),
      totalEcg: filteredEmoluments.reduce((sum, e) => sum + e.ecgCount, 0),
      totalRevenue: filteredEmoluments.reduce((sum, e) => sum + (e.ecgCount * tarifConfig.ecgCostPatient), 0),
    };
  }, [filteredEmoluments, tarifConfig]);

  // Format FCFA
  const formatFCFA = (amount: number) => {
    return new Intl.NumberFormat('fr-FR').format(Math.round(amount)) + ' FCFA';
  };

  // Validation du mois
  const handleValidateMonth = () => {
    if (window.confirm(`Confirmer la validation du mois ${selectedPeriod} ?\n\nLes montants seront verrouillés et non modifiables.`)) {
      validateMonth(selectedPeriod, 'USR-004', 'Admin Principal');
      generateMonthlyReport(selectedPeriod);
      toast({
        title: "✅ Mois validé",
        description: `Le mois ${selectedPeriod} a été clôturé.`,
      });
    }
  };

  // Export CSV
  const exportCSV = () => {
    const headers = ['ID', 'Nom', 'Rôle', 'Établissement', 'ECG', 'Base', 'Bonus', 'Total', 'Statut'];
    const rows = filteredEmoluments.map(e => [
      e.userId,
      e.userName,
      e.userRole === 'cardiologue' ? 'Cardiologue' : 'Médecin',
      e.hospitalName,
      e.ecgCount,
      e.baseAmount,
      e.totalBonus,
      e.totalGross,
      e.status,
    ]);

    const csv = [headers, ...rows].map(row => row.join(';')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `emoluments-${selectedPeriod}.csv`;
    link.click();

    toast({
      title: "📥 Export réussi",
      description: "Le fichier CSV a été téléchargé.",
    });
  };

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <CreditCard className="h-6 w-6 text-emerald-600" />
            Émoluments & Paiements
          </h1>
          <p className="text-gray-500 mt-1">Gestion mensuelle des émoluments et paiements</p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024-12">Décembre 2024</SelectItem>
              <SelectItem value="2024-11">Novembre 2024</SelectItem>
              <SelectItem value="2024-10">Octobre 2024</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Récapitulatif */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-indigo-50 to-indigo-100 border-indigo-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-indigo-600 text-sm font-medium">💼 CARDIOLOGUES</p>
                <p className="text-2xl font-bold text-indigo-700 mt-1">{formatFCFA(summary.cardiologueTotal)}</p>
                <p className="text-xs text-indigo-600 mt-1">{summary.cardiologueCount} personnes</p>
              </div>
              <TrendingUp className="h-8 w-8 text-indigo-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-emerald-50 to-emerald-100 border-emerald-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-emerald-600 text-sm font-medium">🩺 MÉDECINS</p>
                <p className="text-2xl font-bold text-emerald-700 mt-1">{formatFCFA(summary.medecinTotal)}</p>
                <p className="text-xs text-emerald-600 mt-1">{summary.medecinCount} personnes</p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-300" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-slate-50 to-slate-100 border-slate-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-slate-600 text-sm font-medium">🏢 PLATEFORME</p>
                <p className="text-2xl font-bold text-slate-700 mt-1">
                  {formatFCFA(summary.totalRevenue - summary.totalEmoluments)}
                </p>
                <p className="text-xs text-slate-600 mt-1">
                  {tarifConfig.platformPercent}% des revenus
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-slate-300" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Détails */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">💰 Total ECG facturés : {summary.totalEcg} × {formatFCFA(tarifConfig.ecgCostPatient)} = {formatFCFA(summary.totalRevenue)}</CardTitle>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-gray-600">✅ Total distribué :</span>
              <span className="font-bold text-emerald-600">{formatFCFA(summary.totalEmoluments)}</span>
              <Badge variant="secondary">{Math.round((summary.totalEmoluments / summary.totalRevenue) * 100)}%</Badge>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Filtres et actions */}
      <div className="flex items-center justify-between gap-4 bg-white p-4 rounded-lg border">
        <div className="flex items-center gap-3 flex-1">
          <div className="relative flex-1 max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Rechercher utilisateur..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          
          <Select value={selectedRole} onValueChange={(v: any) => setSelectedRole(v)}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Rôle" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Tous les rôles</SelectItem>
              <SelectItem value="cardiologue">Cardiologues</SelectItem>
              <SelectItem value="medecin">Médecins</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sortBy} onValueChange={(v: any) => setSortBy(v)}>
            <SelectTrigger className="w-[180px]">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              <SelectValue placeholder="Tri" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="amount">Montant décroissant</SelectItem>
              <SelectItem value="ecg">Volume ECG</SelectItem>
              <SelectItem value="name">Nom (A-Z)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={exportCSV}>
            <Download className="h-4 w-4 mr-2" />
            CSV
          </Button>
          <Button variant="outline" size="sm">
            <FileText className="h-4 w-4 mr-2" />
            PDF
          </Button>
          <Button variant="outline" size="sm">
            <Mail className="h-4 w-4 mr-2" />
            Envoyer tous
          </Button>
        </div>
      </div>

      {/* Tableau des émoluments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">👥 Détail par utilisateur</CardTitle>
            <div className="text-sm text-gray-500">
              {filteredEmoluments.length} utilisateur(s)
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {filteredEmoluments.length === 0 ? (
              <p className="text-center text-gray-500 py-8">Aucun émolument pour cette période</p>
            ) : (
              filteredEmoluments.map((emolument) => (
                <EmolumentRow 
                  key={emolument.userId} 
                  emolument={emolument}
                  formatFCFA={formatFCFA}
                  onUpdate={(updates) => {
                    updateEmolumentStatus(emolument.userId, emolument.period, emolument.status, updates);
                  }}
                />
              ))
            )}
          </div>
        </CardContent>
      </Card>

      {/* Actions finales */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Statut du mois</p>
              <Badge variant="secondary" className="mt-1">
                {getMonthlyReport(selectedPeriod)?.validated ? (
                  <>
                    <Lock className="h-3 w-3 mr-1" />
                    Validé & Clôturé
                  </>
                ) : (
                  <>
                    <Clock className="h-3 w-3 mr-1" />
                    En révision
                  </>
                )}
              </Badge>
            </div>

            {!getMonthlyReport(selectedPeriod)?.validated && (
              <Button 
                onClick={handleValidateMonth}
                className="bg-indigo-600 hover:bg-indigo-700"
              >
                <Lock className="h-4 w-4 mr-2" />
                VALIDER & CLÔTURER LE MOIS
              </Button>
            )}
          </div>
          
          {!getMonthlyReport(selectedPeriod)?.validated && (
            <p className="text-xs text-gray-500 mt-3">
              ⚠️ Une fois validé, les montants seront archivés et non modifiables.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

// Composant ligne émolument
interface EmolumentRowProps {
  emolument: UserEmolument;
  formatFCFA: (amount: number) => string;
  onUpdate: (updates: Partial<UserEmolument>) => void;
}

function EmolumentRow({ emolument, formatFCFA, onUpdate }: EmolumentRowProps) {
  const { toast } = useToast();
  const [showDetails, setShowDetails] = useState(false);
  const [showPayment, setShowPayment] = useState(false);

  const statusConfig = {
    pending: { label: 'En attente', color: 'bg-amber-100 text-amber-700', icon: Clock },
    validated: { label: 'Validé', color: 'bg-blue-100 text-blue-700', icon: Check },
    paid: { label: 'Payé', color: 'bg-green-100 text-green-700', icon: Check },
  };

  const config = statusConfig[emolument.status];
  const Icon = config.icon;

  // Calcul évolution
  const evolution = emolument.ecgCount >= 100 ? '+12%' : emolument.ecgCount >= 50 ? '+5%' : '0%';

  return (
    <>
      <div className="p-4 border rounded-lg hover:bg-gray-50 transition-colors">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className={cn(
            "h-10 w-10 rounded-full flex items-center justify-center text-white font-bold",
            emolument.userRole === 'cardiologue' ? 'bg-indigo-500' : 'bg-emerald-500'
          )}>
            {emolument.userName.split(' ').map(n => n[0]).join('')}
          </div>

          {/* Info utilisateur */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold text-gray-900">{emolument.userName}</span>
              <Badge variant="secondary" className="text-xs">
                {emolument.userRole === 'cardiologue' ? '👨‍⚕️ CARD' : '🩺 MED'}
              </Badge>
            </div>
            <p className="text-xs text-gray-500">{emolument.hospitalName}</p>
          </div>

          {/* ECG */}
          <div className="text-right">
            <p className="text-sm font-medium">{emolument.ecgCount} ECG</p>
            {evolution !== '0%' && (
              <p className="text-xs text-green-600">🔥 {evolution}</p>
            )}
          </div>

          {/* Montants */}
          <div className="text-right min-w-[120px]">
            <p className="text-xs text-gray-500">Base</p>
            <p className="font-medium">{formatFCFA(emolument.baseAmount)}</p>
          </div>

          <div className="text-right min-w-[120px]">
            <p className="text-xs text-gray-500">Bonus</p>
            <p className="font-medium text-amber-600">+{formatFCFA(emolument.totalBonus)}</p>
          </div>

          <div className="text-right min-w-[140px]">
            <p className="text-xs text-gray-500">Total</p>
            <p className="text-lg font-bold text-indigo-600">{formatFCFA(emolument.totalGross)}</p>
          </div>

          {/* Statut */}
          <Badge className={cn("gap-1", config.color)}>
            <Icon className="h-3 w-3" />
            {config.label}
          </Badge>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowDetails(true)}
            >
              <Eye className="h-4 w-4" />
            </Button>
            {emolument.status !== 'paid' && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowPayment(true)}
              >
                <CreditCard className="h-4 w-4" />
              </Button>
            )}
            <Button
              variant="ghost"
              size="sm"
            >
              <FileText className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Dialog Détails */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>📊 Détails émoluments - {emolument.userName}</DialogTitle>
            <DialogDescription>
              {emolument.userRole === 'cardiologue' ? 'Cardiologue' : 'Médecin Référent'} • {emolument.hospitalName} • {emolument.period}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            {/* Calcul */}
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold mb-3">💰 CALCUL DES ÉMOLUMENTS</p>
              
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">📋 Base ({emolument.ecgCount} ECG)</span>
                  <span className="font-mono">{formatFCFA(emolument.baseAmount)}</span>
                </div>
                
                {emolument.totalBonus > 0 && (
                  <>
                    <div className="border-t pt-2">
                      <p className="text-xs font-medium text-gray-700 mb-2">🏆 BONUS</p>
                      {emolument.bonusVolume > 0 && (
                        <div className="flex justify-between text-xs pl-4">
                          <span className="text-gray-600">✅ Bonus volume</span>
                          <span className="font-mono text-amber-600">+{formatFCFA(emolument.bonusVolume)}</span>
                        </div>
                      )}
                      {emolument.bonusQuality > 0 && (
                        <div className="flex justify-between text-xs pl-4">
                          <span className="text-gray-600">✅ Bonus qualité ({emolument.qualityScore}%)</span>
                          <span className="font-mono text-amber-600">+{formatFCFA(emolument.bonusQuality)}</span>
                        </div>
                      )}
                      {emolument.bonusUrgent > 0 && (
                        <div className="flex justify-between text-xs pl-4">
                          <span className="text-gray-600">✅ Bonus urgents ({emolument.urgentCount} ECG)</span>
                          <span className="font-mono text-amber-600">+{formatFCFA(emolument.bonusUrgent)}</span>
                        </div>
                      )}
                      {emolument.bonusOnCall > 0 && (
                        <div className="flex justify-between text-xs pl-4">
                          <span className="text-gray-600">✅ Astreintes ({emolument.onCallCount})</span>
                          <span className="font-mono text-amber-600">+{formatFCFA(emolument.bonusOnCall)}</span>
                        </div>
                      )}
                      {emolument.bonusLoyalty > 0 && (
                        <div className="flex justify-between text-xs pl-4">
                          <span className="text-gray-600">✅ Bonus fidélité</span>
                          <span className="font-mono text-amber-600">+{formatFCFA(emolument.bonusLoyalty)}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-sm font-medium mt-1 pl-4 pt-1 border-t">
                        <span>Total bonus</span>
                        <span className="text-amber-600">+{formatFCFA(emolument.totalBonus)}</span>
                      </div>
                    </div>
                  </>
                )}

                <div className="border-t-2 pt-2 flex justify-between text-base font-bold">
                  <span>💰 TOTAL BRUT</span>
                  <span className="text-indigo-600">{formatFCFA(emolument.totalGross)}</span>
                </div>
              </div>
            </div>

            {/* Répartition par type */}
            <div>
              <p className="text-sm font-semibold mb-2">📊 RÉPARTITION PAR TYPE</p>
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 bg-blue-50 rounded">
                  <p className="text-gray-600">ECG Normaux</p>
                  <p className="font-semibold">{emolument.ecgNormal} ({Math.round((emolument.ecgNormal/emolument.ecgCount)*100)}%)</p>
                </div>
                <div className="p-2 bg-orange-50 rounded">
                  <p className="text-gray-600">ECG Complexes</p>
                  <p className="font-semibold">{emolument.ecgComplex} ({Math.round((emolument.ecgComplex/emolument.ecgCount)*100)}%)</p>
                </div>
                <div className="p-2 bg-red-50 rounded">
                  <p className="text-gray-600">ECG Critiques</p>
                  <p className="font-semibold">{emolument.ecgCritical} ({Math.round((emolument.ecgCritical/emolument.ecgCount)*100)}%)</p>
                </div>
              </div>
            </div>

            {/* Performance */}
            {emolument.userRole === 'cardiologue' && (
              <div>
                <p className="text-sm font-semibold mb-2">⚡ PERFORMANCE</p>
                <div className="grid grid-cols-3 gap-2 text-xs">
                  <div className="p-2 bg-green-50 rounded">
                    <p className="text-gray-600">Temps moyen</p>
                    <p className="font-semibold">{emolument.avgTime} min/ECG 🟢</p>
                  </div>
                  <div className="p-2 bg-green-50 rounded">
                    <p className="text-gray-600">Taux qualité</p>
                    <p className="font-semibold">{emolument.qualityScore}% 🟢</p>
                  </div>
                  <div className="p-2 bg-green-50 rounded">
                    <p className="text-gray-600">Urgents &lt; 1h</p>
                    <p className="font-semibold">{emolument.urgentCount} ECG</p>
                  </div>
                </div>
              </div>
            )}

            {/* Info paiement si payé */}
            {emolument.status === 'paid' && emolument.paidAt && (
              <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm font-semibold text-green-700 mb-2">✅ Paiement effectué</p>
                <div className="text-xs space-y-1">
                  <p><span className="text-gray-600">Date:</span> {format(new Date(emolument.paidAt), 'dd MMMM yyyy à HH:mm', { locale: fr })}</p>
                  <p><span className="text-gray-600">Méthode:</span> {emolument.paymentMethod}</p>
                  <p><span className="text-gray-600">Référence:</span> {emolument.paymentRef}</p>
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDetails(false)}>
              Fermer
            </Button>
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Télécharger fiche PDF
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog Paiement */}
      <PaymentDialog
        open={showPayment}
        onOpenChange={setShowPayment}
        emolument={emolument}
        formatFCFA={formatFCFA}
        onConfirm={(paymentData) => {
          onUpdate({
            status: 'paid',
            ...paymentData,
          });
          toast({
            title: "✅ Paiement enregistré",
            description: `Le paiement de ${formatFCFA(emolument.totalGross)} a été enregistré.`,
          });
          setShowPayment(false);
        }}
      />
    </>
  );
}

// Dialog paiement
interface PaymentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  emolument: UserEmolument;
  formatFCFA: (amount: number) => string;
  onConfirm: (data: { paidAt: string; paymentMethod: string; paymentRef: string; notes?: string }) => void;
}

function PaymentDialog({ open, onOpenChange, emolument, formatFCFA, onConfirm }: PaymentDialogProps) {
  const [method, setMethod] = useState<'momo' | 'bank'>('momo');
  const [operator, setOperator] = useState('MTN');
  const [phone, setPhone] = useState('');
  const [iban, setIban] = useState('');
  const [bank, setBank] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [reference, setReference] = useState(`PAY-${emolument.period}-${emolument.userId}-${Date.now()}`);
  const [notes, setNotes] = useState('');

  const handleConfirm = () => {
    const paymentData = {
      paidAt: new Date(date).toISOString(),
      paymentMethod: method === 'momo' ? `${operator} Mobile Money (${phone})` : `Virement ${bank} (${iban})`,
      paymentRef: reference,
      notes: notes || undefined,
    };
    onConfirm(paymentData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>💳 Enregistrer paiement - {emolument.userName}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="p-3 bg-indigo-50 rounded-lg">
            <p className="text-sm text-gray-600">Montant à payer</p>
            <p className="text-2xl font-bold text-indigo-600">{formatFCFA(emolument.totalGross)}</p>
          </div>

          <div className="space-y-2">
            <Label>Mode de paiement</Label>
            <div className="flex gap-2">
              <Button
                variant={method === 'momo' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMethod('momo')}
                className="flex-1"
              >
                📱 Mobile Money
              </Button>
              <Button
                variant={method === 'bank' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMethod('bank')}
                className="flex-1"
              >
                🏦 Virement bancaire
              </Button>
            </div>
          </div>

          {method === 'momo' ? (
            <>
              <div className="space-y-2">
                <Label>Opérateur</Label>
                <Select value={operator} onValueChange={setOperator}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="MTN">MTN Mobile Money</SelectItem>
                    <SelectItem value="Orange">Orange Money</SelectItem>
                    <SelectItem value="Moov">Moov Money</SelectItem>
                    <SelectItem value="Airtel">Airtel Money</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Numéro de téléphone</Label>
                <Input
                  type="tel"
                  placeholder="+237 690 123 456"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>
            </>
          ) : (
            <>
              <div className="space-y-2">
                <Label>Banque</Label>
                <Select value={bank} onValueChange={setBank}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner banque" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Afriland">Afriland First Bank</SelectItem>
                    <SelectItem value="SGBC">SGBC</SelectItem>
                    <SelectItem value="UBA">UBA</SelectItem>
                    <SelectItem value="Ecobank">Ecobank</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>IBAN</Label>
                <Input
                  type="text"
                  placeholder="CM21 1000 2000 3000 4000 5000"
                  value={iban}
                  onChange={(e) => setIban(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="space-y-2">
            <Label>Date de paiement</Label>
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Référence</Label>
            <Input
              type="text"
              value={reference}
              onChange={(e) => setReference(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Note (optionnel)</Label>
            <Textarea
              placeholder="Commentaire ou note..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Checkbox id="notif" defaultChecked />
              <Label htmlFor="notif" className="text-sm">Envoyer notification email</Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox id="pdf" defaultChecked />
              <Label htmlFor="pdf" className="text-sm">Générer reçu PDF</Label>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Annuler
          </Button>
          <Button onClick={handleConfirm} className="bg-green-600 hover:bg-green-700">
            <Check className="h-4 w-4 mr-2" />
            Confirmer le paiement
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
