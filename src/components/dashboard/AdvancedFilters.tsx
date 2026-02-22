import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Filter, CalendarIcon, X } from 'lucide-react';

interface AdvancedFiltersProps {
  onFilter: (filters: {
    search: string;
    status: string[];
    dateFrom: Date | null;
    dateTo: Date | null;
    doctor: string;
    center: string;
    priority: string;
  }) => void;
}

export function AdvancedFilters({ onFilter }: AdvancedFiltersProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState<string[]>([]);
  const [dateFrom, setDateFrom] = useState<Date | null>(null);
  const [dateTo, setDateTo] = useState<Date | null>(null);
  const [doctor, setDoctor] = useState('all');
  const [center, setCenter] = useState('all');
  const [priority, setPriority] = useState('all');

  const handleApplyFilters = () => {
    onFilter({
      search,
      status,
      dateFrom,
      dateTo,
      doctor,
      center,
      priority
    });
  };

  const handleReset = () => {
    setSearch('');
    setStatus([]);
    setDateFrom(null);
    setDateTo(null);
    setDoctor('all');
    setCenter('all');
    setPriority('all');
    onFilter({
      search: '',
      status: [],
      dateFrom: null,
      dateTo: null,
      doctor: 'all',
      center: 'all',
      priority: 'all'
    });
  };

  const getActiveFiltersCount = () => {
    let count = 0;
    if (search) count++;
    if (status.length > 0) count++;
    if (dateFrom || dateTo) count++;
    if (doctor !== 'all') count++;
    if (center !== 'all') count++;
    if (priority !== 'all') count++;
    return count;
  };

  const activeFiltersCount = getActiveFiltersCount();

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-4">
        <div className="flex-1">
          <Input
            placeholder="Rechercher par nom, ID ou centre médical..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9"
          />
        </div>

        <Button
          variant={isExpanded ? "secondary" : "outline"}
          onClick={() => setIsExpanded(!isExpanded)}
          className="h-9"
        >
          <Filter className="h-4 w-4 mr-2" />
          Filtres avancés
          {activeFiltersCount > 0 && (
            <Badge variant="secondary" className="ml-2">
              {activeFiltersCount}
            </Badge>
          )}
        </Button>

        {activeFiltersCount > 0 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleReset}
            className="h-9 text-red-600 hover:text-red-700"
          >
            <X className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
        )}
      </div>

      {isExpanded && (
        <div className="p-4 bg-gray-50 rounded-lg border space-y-4">
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Statut</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { id: 'pending', label: 'En attente' },
                  { id: 'analyzing', label: 'En analyse' },
                  { id: 'completed', label: 'Terminé' }
                ].map((s) => (
                  <Button
                    key={s.id}
                    variant={status.includes(s.id) ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => {
                      if (status.includes(s.id)) {
                        setStatus(status.filter((st) => st !== s.id));
                      } else {
                        setStatus([...status, s.id]);
                      }
                    }}
                    className="h-8"
                  >
                    {s.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Période</label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal h-8"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {dateFrom && dateTo ? (
                      `${format(dateFrom, 'dd/MM/yyyy')} - ${format(dateTo, 'dd/MM/yyyy')}`
                    ) : (
                      "Sélectionner les dates"
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="range"
                    selected={{
                      from: dateFrom || undefined,
                      to: dateTo || undefined
                    }}
                    onSelect={(range) => {
                      setDateFrom(range?.from || null);
                      setDateTo(range?.to || null);
                    }}
                    locale={fr}
                    className="rounded-md border"
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Priorité</label>
              <Select value={priority} onValueChange={setPriority}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Toutes les priorités" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="high">Haute</SelectItem>
                  <SelectItem value="medium">Moyenne</SelectItem>
                  <SelectItem value="low">Basse</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Médecin référent</label>
              <Select value={doctor} onValueChange={setDoctor}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Tous les médecins" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="1">Dr. Martin</SelectItem>
                  <SelectItem value="2">Dr. Bernard</SelectItem>
                  <SelectItem value="3">Dr. Dubois</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Centre médical</label>
              <Select value={center} onValueChange={setCenter}>
                <SelectTrigger className="h-8">
                  <SelectValue placeholder="Tous les centres" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous</SelectItem>
                  <SelectItem value="1">Cardiobox Web</SelectItem>
                  <SelectItem value="2">Facility Demo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
            >
              Réinitialiser
            </Button>
            <Button
              size="sm"
              onClick={handleApplyFilters}
            >
              Appliquer les filtres
            </Button>
          </div>
        </div>
      )}

      {activeFiltersCount > 0 && (
        <div className="flex flex-wrap gap-2">
          {search && (
            <Badge variant="secondary" className="h-6">
              Recherche: {search}
              <button
                onClick={() => {
                  setSearch('');
                  handleApplyFilters();
                }}
                className="ml-2 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {status.map((s) => (
            <Badge key={s} variant="secondary" className="h-6 capitalize">
              {s}
              <button
                onClick={() => {
                  setStatus(status.filter(st => st !== s));
                  handleApplyFilters();
                }}
                className="ml-2 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          ))}
          {(dateFrom || dateTo) && (
            <Badge variant="secondary" className="h-6">
              {dateFrom && dateTo
                ? `${format(dateFrom, 'dd/MM/yyyy')} - ${format(dateTo, 'dd/MM/yyyy')}`
                : dateFrom
                ? `Depuis le ${format(dateFrom, 'dd/MM/yyyy')}`
                : `Jusqu'au ${format(dateTo!, 'dd/MM/yyyy')}`}
              <button
                onClick={() => {
                  setDateFrom(null);
                  setDateTo(null);
                  handleApplyFilters();
                }}
                className="ml-2 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {doctor !== 'all' && (
            <Badge variant="secondary" className="h-6">
              Médecin: {doctor}
              <button
                onClick={() => {
                  setDoctor('all');
                  handleApplyFilters();
                }}
                className="ml-2 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {center !== 'all' && (
            <Badge variant="secondary" className="h-6">
              Centre: {center}
              <button
                onClick={() => {
                  setCenter('all');
                  handleApplyFilters();
                }}
                className="ml-2 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
          {priority !== 'all' && (
            <Badge variant="secondary" className="h-6">
              Priorité: {priority}
              <button
                onClick={() => {
                  setPriority('all');
                  handleApplyFilters();
                }}
                className="ml-2 hover:text-red-600"
              >
                <X className="h-3 w-3" />
              </button>
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}