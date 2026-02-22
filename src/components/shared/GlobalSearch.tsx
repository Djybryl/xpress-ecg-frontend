import { useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Activity, FileText, User } from 'lucide-react';
import {
  CommandDialog,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandSeparator,
} from '@/components/ui/command';
import { usePatientStore } from '@/stores/usePatientStore';
import { useReportStore } from '@/stores/useReportStore';
import { useAuthContext } from '@/providers/AuthProvider';
import { getNavigationForRole } from '@/config/navigation';

interface GlobalSearchProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function GlobalSearch({ open, onOpenChange }: GlobalSearchProps) {
  const navigate = useNavigate();
  const { user } = useAuthContext();
  const { patients } = usePatientStore();
  const { reports } = useReportStore();

  // Raccourci clavier Ctrl+K / Cmd+K
  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if ((e.key === 'k' && (e.metaKey || e.ctrlKey))) {
        e.preventDefault();
        onOpenChange(!open);
      }
    };
    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, [open, onOpenChange]);

  const handleSelect = useCallback((path: string) => {
    navigate(path);
    onOpenChange(false);
  }, [navigate, onOpenChange]);

  const navItems = user
    ? [
        ...getNavigationForRole(user.role).main,
        ...(getNavigationForRole(user.role).secondary ?? []),
      ]
    : [];

  return (
    <CommandDialog open={open} onOpenChange={onOpenChange}>
      <CommandInput placeholder="Rechercher un patient, ECG, page…" />
      <CommandList>
        <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>

        {/* Navigation */}
        <CommandGroup heading="Navigation">
          {navItems.map((item) => (
            <CommandItem
              key={item.path}
              value={item.label}
              onSelect={() => handleSelect(item.path)}
              className="cursor-pointer"
            >
              <item.icon className="mr-2 h-4 w-4 text-slate-400" />
              {item.label}
            </CommandItem>
          ))}
        </CommandGroup>

        <CommandSeparator />

        {/* Patients */}
        {patients.length > 0 && (
          <CommandGroup heading="Patients">
            {patients.slice(0, 5).map((patient) => (
              <CommandItem
                key={patient.id}
                value={`patient ${patient.name} ${patient.id}`}
                onSelect={() => handleSelect(`/patients/${patient.id}`)}
                className="cursor-pointer"
              >
                <User className="mr-2 h-4 w-4 text-emerald-400" />
                <span className="font-medium">{patient.name}</span>
                <span className="ml-2 text-xs text-slate-400">{patient.id}</span>
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandSeparator />

        {/* Rapports */}
        {reports.length > 0 && (
          <CommandGroup heading="Rapports ECG récents">
            {reports.slice(0, 4).map((report) => (
              <CommandItem
                key={report.id}
                value={`rapport ${report.patientName} ${report.ecgId}`}
                onSelect={() => handleSelect(`/reports/${report.id}`)}
                className="cursor-pointer"
              >
                <FileText className="mr-2 h-4 w-4 text-indigo-400" />
                <span className="font-medium">{report.patientName}</span>
                <span className="ml-2 text-xs text-slate-400">{report.ecgId}</span>
                {report.isUrgent && (
                  <span className="ml-auto text-[10px] bg-red-100 text-red-600 px-1.5 py-0.5 rounded font-semibold">
                    URGENT
                  </span>
                )}
              </CommandItem>
            ))}
          </CommandGroup>
        )}

        <CommandSeparator />

        {/* Actions rapides */}
        <CommandGroup heading="Actions rapides">
          {user?.role === 'medecin' && (
            <CommandItem
              value="nouvel ECG envoyer analyse"
              onSelect={() => handleSelect('/medecin/new-ecg')}
              className="cursor-pointer"
            >
              <Activity className="mr-2 h-4 w-4 text-indigo-400" />
              Envoyer un nouvel ECG
            </CommandItem>
          )}
          <CommandItem
            value="profil paramètres compte"
            onSelect={() => handleSelect('/profile')}
            className="cursor-pointer"
          >
            <User className="mr-2 h-4 w-4 text-slate-400" />
            Mon profil
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
