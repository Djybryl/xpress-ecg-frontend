import { useState } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Calendar, Download } from 'lucide-react';
import { DashboardStats } from './DashboardStats';

const mockData = {
  today: [
    { date: '2024-03-19 08:00', received: 12, analyzed: 10, sent: 8 },
    { date: '2024-03-19 10:00', received: 18, analyzed: 15, sent: 14 },
    { date: '2024-03-19 12:00', received: 25, analyzed: 22, sent: 20 },
    { date: '2024-03-19 14:00', received: 35, analyzed: 30, sent: 28 },
    { date: '2024-03-19 16:00', received: 42, analyzed: 38, sent: 35 },
    { date: '2024-03-19 18:00', received: 45, analyzed: 42, sent: 40 }
  ],
  week: [
    { date: '2024-03-13', received: 42, analyzed: 40, sent: 38 },
    { date: '2024-03-14', received: 38, analyzed: 35, sent: 33 },
    { date: '2024-03-15', received: 45, analyzed: 42, sent: 40 },
    { date: '2024-03-16', received: 52, analyzed: 48, sent: 45 },
    { date: '2024-03-17', received: 48, analyzed: 45, sent: 43 },
    { date: '2024-03-18', received: 42, analyzed: 40, sent: 38 },
    { date: '2024-03-19', received: 45, analyzed: 42, sent: 40 }
  ],
  month: [
    { date: '2024-02-19', received: 280, analyzed: 265, sent: 260 },
    { date: '2024-02-26', received: 310, analyzed: 295, sent: 290 },
    { date: '2024-03-05', received: 295, analyzed: 280, sent: 275 },
    { date: '2024-03-12', received: 320, analyzed: 305, sent: 300 },
    { date: '2024-03-19', received: 312, analyzed: 298, sent: 285 }
  ]
};

interface StatisticsDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function StatisticsDrawer({ open, onOpenChange }: StatisticsDrawerProps) {
  const [period, setPeriod] = useState<'today' | 'week' | 'month'>('today');
  const [selectedDoctor, setSelectedDoctor] = useState<string>('all');
  const [selectedCenter, setSelectedCenter] = useState<string>('all');

  const handleExport = () => {
    // TODO: Implémenter l'export des données
    console.log('Exporting data...');
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-[900px] overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Statistiques</SheetTitle>
        </SheetHeader>

        <div className="space-y-6">
          {/* Filtres */}
          <div className="flex flex-wrap gap-4">
            <Select value={period} onValueChange={(value: 'today' | 'week' | 'month') => setPeriod(value)}>
              <SelectTrigger className="w-[180px]">
                <Calendar className="h-4 w-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Aujourd'hui</SelectItem>
                <SelectItem value="week">Cette semaine</SelectItem>
                <SelectItem value="month">Ce mois</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedDoctor} onValueChange={setSelectedDoctor}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Médecin" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les médecins</SelectItem>
                <SelectItem value="1">Dr. Martin</SelectItem>
                <SelectItem value="2">Dr. Bernard</SelectItem>
                <SelectItem value="3">Dr. Dubois</SelectItem>
              </SelectContent>
            </Select>

            <Select value={selectedCenter} onValueChange={setSelectedCenter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Centre médical" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous les centres</SelectItem>
                <SelectItem value="1">Cardiobox Web</SelectItem>
                <SelectItem value="2">Facility Demo</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" onClick={handleExport}>
              <Download className="h-4 w-4 mr-2" />
              Exporter
            </Button>
          </div>

          {/* Statistiques */}
          <DashboardStats 
            data={mockData[period]}
            period={period}
          />

          {/* Métriques de performance */}
          <div className="grid gap-4 md:grid-cols-4">
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Temps moyen d'analyse</h3>
              <p className="text-2xl font-bold">12 min</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Taux de complétion</h3>
              <p className="text-2xl font-bold">94%</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Seconds avis</h3>
              <p className="text-2xl font-bold">28</p>
            </div>
            <div className="bg-white p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 mb-1">ECG urgents</h3>
              <p className="text-2xl font-bold">15</p>
            </div>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
}