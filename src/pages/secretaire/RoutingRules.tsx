import { useState } from 'react';
import {
  GitBranch, Plus, Trash2, Edit2, ToggleLeft, ToggleRight,
  Calendar, Building2, Users, CheckCircle2, XCircle, Info,
  AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog, DialogContent, DialogDescription,
  DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import {
  useRoutingStore, hospitals, cardiologists,
  type RoutingRule,
} from '@/stores/useRoutingStore';
import { cn } from '@/lib/utils';
import { format, parseISO, isWithinInterval, parseISO as parse } from 'date-fns';
import { fr } from 'date-fns/locale';

const emptyForm = {
  dateFrom: '',
  dateTo: '',
  hospitals: [] as string[],
  cardiologistEmails: [] as string[],
  notes: '',
  active: true,
};

function isRuleCurrentlyActive(rule: RoutingRule) {
  if (!rule.active) return false;
  const today = new Date();
  try {
    return isWithinInterval(today, {
      start: parse(rule.dateFrom),
      end: parse(rule.dateTo + 'T23:59:59'),
    });
  } catch {
    return false;
  }
}

export function RoutingRules() {
  const { toast } = useToast();
  const { rules, addRule, updateRule, deleteRule, toggleActive } = useRoutingStore();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const activeRulesCount = rules.filter(isRuleCurrentlyActive).length;

  const openCreate = () => {
    setForm(emptyForm);
    setEditingId(null);
    setDialogOpen(true);
  };

  const openEdit = (rule: RoutingRule) => {
    setForm({
      dateFrom: rule.dateFrom,
      dateTo: rule.dateTo,
      hospitals: rule.hospitals,
      cardiologistEmails: rule.cardiologistEmails,
      notes: rule.notes ?? '',
      active: rule.active,
    });
    setEditingId(rule.id);
    setDialogOpen(true);
  };

  const handleSave = () => {
    if (!form.dateFrom || !form.dateTo) {
      toast({ title: 'Erreur', description: 'Les dates de début et de fin sont obligatoires.', variant: 'destructive' });
      return;
    }
    if (form.cardiologistEmails.length === 0) {
      toast({ title: 'Erreur', description: 'Sélectionnez au moins un cardiologue.', variant: 'destructive' });
      return;
    }
    if (form.dateFrom > form.dateTo) {
      toast({ title: 'Erreur', description: 'La date de début doit être antérieure à la date de fin.', variant: 'destructive' });
      return;
    }

    if (editingId) {
      updateRule(editingId, form);
      toast({ title: 'Règle mise à jour', description: 'La règle de routage a été modifiée.' });
    } else {
      addRule(form);
      toast({ title: 'Règle créée', description: 'La règle de routage a été ajoutée.' });
    }
    setDialogOpen(false);
  };

  const handleDelete = (id: string) => {
    deleteRule(id);
    setDeleteConfirm(null);
    toast({ title: 'Règle supprimée', description: 'La règle de routage a été supprimée.' });
  };

  const toggleHospital = (id: string) => {
    setForm(prev => ({
      ...prev,
      hospitals: prev.hospitals.includes(id)
        ? prev.hospitals.filter(h => h !== id)
        : [...prev.hospitals, id],
    }));
  };

  const toggleCardiologist = (email: string) => {
    setForm(prev => ({
      ...prev,
      cardiologistEmails: prev.cardiologistEmails.includes(email)
        ? prev.cardiologistEmails.filter(e => e !== email)
        : [...prev.cardiologistEmails, email],
    }));
  };

  const getHospitalNames = (ids: string[]) => {
    if (ids.length === 0) return 'Tous les établissements';
    return ids.map(id => hospitals.find(h => h.id === id)?.name ?? id).join(', ');
  };

  const getCardiologistNames = (emails: string[]) =>
    emails.map(email => cardiologists.find(c => c.id === email || c.name.toLowerCase().includes(email.split('@')[0]))?.name ?? email).join(', ');

  return (
    <div className="p-6 max-w-5xl mx-auto space-y-6">
      {/* En-tête */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <GitBranch className="w-5 h-5 text-indigo-600" />
            <h1 className="text-2xl font-bold text-gray-900">Règles de routage</h1>
          </div>
          <p className="text-gray-500 text-sm">
            Programmez la redirection automatique des ECG vers des cardiologues spécifiques sur une période donnée.
          </p>
        </div>
        <Button onClick={openCreate}>
          <Plus className="w-4 h-4 mr-2" />
          Nouvelle règle
        </Button>
      </div>

      {/* Bannière règles actives */}
      {activeRulesCount > 0 ? (
        <div className="flex items-center gap-3 bg-green-50 border border-green-200 rounded-lg px-4 py-3">
          <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0" />
          <p className="text-sm text-green-800 font-medium">
            {activeRulesCount} règle{activeRulesCount > 1 ? 's' : ''} de routage active{activeRulesCount > 1 ? 's' : ''} en ce moment.
          </p>
        </div>
      ) : (
        <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 rounded-lg px-4 py-3">
          <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
          <p className="text-sm text-blue-700">
            Aucune règle active. Les ECG sont visibles par tous les cardiologues.
          </p>
        </div>
      )}

      {/* Liste des règles */}
      {rules.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GitBranch className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-gray-500 text-sm">Aucune règle de routage définie.</p>
            <Button variant="outline" className="mt-4" onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Créer la première règle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {rules.map((rule) => {
            const currentlyActive = isRuleCurrentlyActive(rule);
            return (
              <Card key={rule.id} className={cn(
                'border transition-colors',
                currentlyActive ? 'border-green-300 bg-green-50/30' : ''
              )}>
                <CardContent className="pt-4 pb-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        {currentlyActive ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200">
                            <CheckCircle2 className="w-3 h-3 mr-1" />
                            Active maintenant
                          </Badge>
                        ) : rule.active ? (
                          <Badge variant="outline" className="text-slate-500">
                            <Calendar className="w-3 h-3 mr-1" />
                            Programmée
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-slate-400">
                            <XCircle className="w-3 h-3 mr-1" />
                            Désactivée
                          </Badge>
                        )}
                        <span className="text-xs text-slate-400 font-mono">{rule.id}</span>
                      </div>

                      <div className="grid sm:grid-cols-3 gap-3 text-sm">
                        <div className="flex items-center gap-1.5 text-gray-600">
                          <Calendar className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                          <span>
                            {format(parseISO(rule.dateFrom), 'd MMM yyyy', { locale: fr })} →{' '}
                            {format(parseISO(rule.dateTo), 'd MMM yyyy', { locale: fr })}
                          </span>
                        </div>
                        <div className="flex items-start gap-1.5 text-gray-600">
                          <Building2 className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{getHospitalNames(rule.hospitals)}</span>
                        </div>
                        <div className="flex items-start gap-1.5 text-gray-600">
                          <Users className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0 mt-0.5" />
                          <span className="line-clamp-1">{rule.cardiologistEmails.join(', ')}</span>
                        </div>
                      </div>

                      {rule.notes && (
                        <p className="mt-2 text-xs text-gray-500 italic line-clamp-1">{rule.notes}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-1 flex-shrink-0">
                      <Button
                        variant="ghost" size="icon"
                        className="h-8 w-8"
                        onClick={() => toggleActive(rule.id)}
                        title={rule.active ? 'Désactiver' : 'Activer'}
                      >
                        {rule.active
                          ? <ToggleRight className="w-5 h-5 text-green-600" />
                          : <ToggleLeft className="w-5 h-5 text-slate-400" />
                        }
                      </Button>
                      <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEdit(rule)}>
                        <Edit2 className="w-4 h-4 text-slate-500" />
                      </Button>
                      <Button
                        variant="ghost" size="icon"
                        className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                        onClick={() => setDeleteConfirm(rule.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Aide */}
      <Card className="bg-slate-50 border-slate-200">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-semibold text-slate-600 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            Comment fonctionne le routage ?
          </CardTitle>
        </CardHeader>
        <CardContent className="text-xs text-slate-500 space-y-1.5">
          <p>• Par défaut, tous les ECG reçus sont visibles par l'ensemble des cardiologues disponibles.</p>
          <p>• Vous pouvez programmer une règle pour rediriger les ECG d'un ou plusieurs établissements vers un ou plusieurs cardiologues ciblés sur une période donnée.</p>
          <p>• Plusieurs règles peuvent être actives simultanément. En cas de conflit, la règle la plus récente s'applique.</p>
          <p>• Les règles désactivées sont conservées pour historique mais n'ont aucun effet.</p>
        </CardContent>
      </Card>

      {/* Dialog création / édition */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingId ? 'Modifier la règle de routage' : 'Nouvelle règle de routage'}
            </DialogTitle>
            <DialogDescription>
              Définissez la période, les établissements et les cardiologues destinataires.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-5 py-2">
            {/* Période */}
            <div>
              <Label className="font-medium mb-2 block">Période *</Label>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label htmlFor="dateFrom" className="text-xs text-gray-500">Du</Label>
                  <Input
                    id="dateFrom"
                    type="date"
                    value={form.dateFrom}
                    onChange={e => setForm(p => ({ ...p, dateFrom: e.target.value }))}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="dateTo" className="text-xs text-gray-500">Au</Label>
                  <Input
                    id="dateTo"
                    type="date"
                    value={form.dateTo}
                    min={form.dateFrom}
                    onChange={e => setForm(p => ({ ...p, dateTo: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Établissements */}
            <div>
              <Label className="font-medium mb-2 block">
                Établissements concernés
                <span className="font-normal text-gray-400 ml-2">(vide = tous)</span>
              </Label>
              <div className="space-y-2">
                {hospitals.filter(h => h.id !== 'ALL').map(h => (
                  <div key={h.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`hosp-${h.id}`}
                      checked={form.hospitals.includes(h.id)}
                      onCheckedChange={() => toggleHospital(h.id)}
                    />
                    <Label htmlFor={`hosp-${h.id}`} className="font-normal cursor-pointer">{h.name}</Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Cardiologues */}
            <div>
              <Label className="font-medium mb-2 block">Cardiologues destinataires *</Label>
              <div className="space-y-2">
                {cardiologists.map(c => (
                  <div key={c.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`card-${c.id}`}
                      checked={form.cardiologistEmails.includes(c.id)}
                      onCheckedChange={() => toggleCardiologist(c.id)}
                    />
                    <Label htmlFor={`card-${c.id}`} className="font-normal cursor-pointer">
                      {c.name}
                      <span className={cn(
                        'ml-2 text-xs',
                        c.available ? 'text-green-600' : 'text-red-500'
                      )}>
                        {c.available ? '(disponible)' : '(indisponible)'}
                      </span>
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div>
              <Label htmlFor="routeNotes" className="font-medium mb-2 block">
                Notes
                <span className="font-normal text-gray-400 ml-2">(optionnel)</span>
              </Label>
              <Textarea
                id="routeNotes"
                placeholder="Ex : Période de congés, renforcement sur un service..."
                value={form.notes}
                onChange={e => setForm(p => ({ ...p, notes: e.target.value }))}
                rows={2}
              />
            </div>

            {/* Activer immédiatement */}
            <div className="flex items-center gap-2">
              <Checkbox
                id="ruleActive"
                checked={form.active}
                onCheckedChange={checked => setForm(p => ({ ...p, active: !!checked }))}
              />
              <Label htmlFor="ruleActive" className="font-normal cursor-pointer">
                Activer cette règle immédiatement
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Annuler</Button>
            <Button onClick={handleSave}>
              {editingId ? 'Enregistrer' : 'Créer la règle'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation suppression */}
      {deleteConfirm && (
        <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
          <DialogContent className="sm:max-w-sm">
            <DialogHeader>
              <DialogTitle>Supprimer la règle ?</DialogTitle>
              <DialogDescription>
                Cette action est irréversible. La règle sera définitivement supprimée.
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button variant="outline" onClick={() => setDeleteConfirm(null)}>Annuler</Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => handleDelete(deleteConfirm!)}
              >
                Supprimer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
