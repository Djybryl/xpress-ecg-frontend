import React, { useState } from 'react';
import {
  GitBranch, Plus, Trash2, Edit2, ToggleLeft, ToggleRight,
  Calendar, Building2, Users, CheckCircle2, XCircle, Info,
  ChevronDown, ChevronUp, HelpCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
  const [expandedRule, setExpandedRule] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const activeRulesCount = rules.filter(isRuleCurrentlyActive).length;
  const PAGE_SIZE = 8;
  const totalPages = Math.max(1, Math.ceil(rules.length / PAGE_SIZE));
  const paginatedRules = rules.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

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
    <div className="space-y-3 max-w-5xl">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 flex-wrap">
          <h1 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <GitBranch className="h-5 w-5 text-indigo-600" />
            Règles de routage
          </h1>
          {activeRulesCount > 0 ? (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-green-100 border border-green-200 text-xs font-medium text-green-700">
              <CheckCircle2 className="h-3 w-3" />
              {activeRulesCount} active{activeRulesCount > 1 ? 's' : ''}
            </span>
          ) : (
            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-100 border border-blue-200 text-xs font-medium text-blue-700">
              <Info className="h-3 w-3" />
              Aucune règle active
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="h-8 w-8 text-slate-500">
                  <HelpCircle className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="bottom" className="max-w-xs p-3 text-xs">
                <p className="font-medium mb-1">Comment fonctionne le routage ?</p>
                <p>Par défaut, tous les ECG sont visibles par tous les cardiologues. Les règles permettent de rediriger les ECG d’établissements ciblés vers des cardiologues sur une période. Plusieurs règles actives : la plus récente prévaut. Règles désactivées : conservées, sans effet.</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <Button onClick={openCreate} size="sm" className="h-8 text-xs">
            <Plus className="h-3.5 w-3.5 mr-1.5" />
            Nouvelle règle
          </Button>
        </div>
      </div>

      {/* Liste des règles */}
      {rules.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GitBranch className="w-10 h-10 text-slate-300 mb-3" />
            <p className="text-gray-500 text-sm">Aucune règle de routage définie.</p>
            <Button variant="outline" className="mt-4" size="sm" onClick={openCreate}>
              <Plus className="w-4 h-4 mr-2" />
              Créer la première règle
            </Button>
          </CardContent>
        </Card>
      ) : (
        <Card>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-9" />
                <TableHead>Statut</TableHead>
                <TableHead>Période</TableHead>
                <TableHead>Établissements</TableHead>
                <TableHead>Cardiologues</TableHead>
                <TableHead className="text-right w-24">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedRules.map((rule) => {
                const currentlyActive = isRuleCurrentlyActive(rule);
                const isExpanded = expandedRule === rule.id;
                return (
                  <>
                    <TableRow
                      key={rule.id}
                      className={cn(
                        'cursor-pointer',
                        currentlyActive && 'bg-green-50/50',
                        isExpanded && 'bg-slate-50'
                      )}
                      onClick={() => setExpandedRule(isExpanded ? null : rule.id)}
                    >
                      <TableCell className="w-9 py-2" onClick={(e) => e.stopPropagation()}>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => setExpandedRule(isExpanded ? null : rule.id)}
                        >
                          {isExpanded ? (
                            <ChevronUp className="h-3.5 w-3.5" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5" />
                          )}
                        </Button>
                      </TableCell>
                      <TableCell className="py-2">
                        {currentlyActive ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200 text-xs">
                            <CheckCircle2 className="h-3 w-3 mr-0.5" />
                            Active
                          </Badge>
                        ) : rule.active ? (
                          <Badge variant="outline" className="text-slate-500 text-xs">
                            Programmée
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-slate-400 text-xs">
                            <XCircle className="h-3 w-3 mr-0.5" />
                            Désactivée
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="py-2 text-sm">
                        {format(parseISO(rule.dateFrom), 'd MMM yyyy', { locale: fr })} → {format(parseISO(rule.dateTo), 'd MMM yyyy', { locale: fr })}
                      </TableCell>
                      <TableCell className="py-2 text-sm max-w-[180px] truncate" title={getHospitalNames(rule.hospitals)}>
                        {getHospitalNames(rule.hospitals)}
                      </TableCell>
                      <TableCell className="py-2 text-sm max-w-[180px] truncate" title={getCardiologistNames(rule.cardiologistEmails)}>
                        {getCardiologistNames(rule.cardiologistEmails)}
                      </TableCell>
                      <TableCell className="py-2 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-0.5">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => toggleActive(rule.id)}
                            title={rule.active ? 'Désactiver' : 'Activer'}
                          >
                            {rule.active ? <ToggleRight className="h-4 w-4 text-green-600" /> : <ToggleLeft className="h-4 w-4 text-slate-400" />}
                          </Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => openEdit(rule)} title="Modifier">
                            <Edit2 className="h-3.5 w-3.5 text-slate-500" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-red-500 hover:bg-red-50"
                            onClick={() => setDeleteConfirm(rule.id)}
                            title="Supprimer"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                    {isExpanded && (
                      <TableRow className="bg-slate-50/80">
                        <TableCell colSpan={6} className="py-3 px-4">
                          <div className="flex items-start gap-4 text-sm">
                            <div className="flex items-center gap-2 text-slate-500">
                              <Calendar className="h-4 w-4 text-indigo-400" />
                              <span>{format(parseISO(rule.dateFrom), 'd MMM yyyy', { locale: fr })} → {format(parseISO(rule.dateTo), 'd MMM yyyy', { locale: fr })}</span>
                            </div>
                            <div className="flex items-start gap-2 text-slate-600 max-w-xs">
                              <Building2 className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                              <span>{getHospitalNames(rule.hospitals)}</span>
                            </div>
                            <div className="flex items-start gap-2 text-slate-600 max-w-xs">
                              <Users className="h-4 w-4 text-indigo-400 flex-shrink-0 mt-0.5" />
                              <span>{getCardiologistNames(rule.cardiologistEmails)}</span>
                            </div>
                            {rule.notes && (
                              <p className="text-slate-500 italic flex-1">{rule.notes}</p>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </>
                );
              })}
            </TableBody>
          </Table>
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-1 py-2 border-t">
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage(1)} title="Première page">«</Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page <= 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>‹</Button>
              <span className="text-xs text-slate-500 px-2">{page} / {totalPages}</span>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>›</Button>
              <Button variant="ghost" size="icon" className="h-8 w-8" disabled={page >= totalPages} onClick={() => setPage(totalPages)} title="Dernière page">»</Button>
            </div>
          )}
        </Card>
      )}

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
