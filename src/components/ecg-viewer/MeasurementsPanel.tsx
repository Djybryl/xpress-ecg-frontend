import { Activity, Calculator } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import type { ECGMeasurements } from './ECGViewerPage';

interface MeasurementsPanelProps {
  measurements: ECGMeasurements;
  onMeasurementChange: (key: keyof ECGMeasurements, value: number | null) => void;
}

// Valeurs normales pour indication
const normalRanges = {
  heartRate: { min: 60, max: 100, unit: 'bpm' },
  prInterval: { min: 120, max: 200, unit: 'ms' },
  qrsDuration: { min: 80, max: 120, unit: 'ms' },
  qtInterval: { min: 350, max: 440, unit: 'ms' },
  qtcInterval: { min: 350, max: 440, unit: 'ms' },
  axisQRS: { min: -30, max: 90, unit: '°' },
  axisP: { min: 0, max: 75, unit: '°' },
  axisT: { min: 0, max: 90, unit: '°' },
};

export function MeasurementsPanel({ measurements, onMeasurementChange }: MeasurementsPanelProps) {
  const handleInputChange = (key: keyof ECGMeasurements, value: string) => {
    const numValue = value === '' ? null : parseInt(value, 10);
    onMeasurementChange(key, isNaN(numValue as number) ? null : numValue);
  };

  const isAbnormal = (key: keyof ECGMeasurements, value: number | null): boolean => {
    if (value === null) return false;
    const range = normalRanges[key as keyof typeof normalRanges];
    if (!range) return false;
    return value < range.min || value > range.max;
  };

  const MeasurementInput = ({ 
    label, 
    measureKey, 
    unit,
    autoCalculated = false 
  }: { 
    label: string; 
    measureKey: keyof ECGMeasurements; 
    unit: string;
    autoCalculated?: boolean;
  }) => {
    const value = measurements[measureKey];
    const abnormal = isAbnormal(measureKey, value);
    
    return (
      <div className="space-y-1">
        <Label className="text-xs text-gray-500 flex items-center gap-1">
          {label}
          {autoCalculated && (
            <Calculator className="h-3 w-3 text-indigo-500" />
          )}
        </Label>
        <div className="flex items-center gap-1">
          <Input
            type="number"
            value={value ?? ''}
            onChange={(e) => handleInputChange(measureKey, e.target.value)}
            className={`h-8 text-sm text-center ${
              abnormal 
                ? 'border-red-300 bg-red-50 text-red-700 focus:border-red-500' 
                : autoCalculated 
                  ? 'bg-indigo-50 border-indigo-200' 
                  : ''
            }`}
            placeholder="—"
            readOnly={autoCalculated}
          />
          <span className="text-xs text-gray-400 w-8">{unit}</span>
        </div>
      </div>
    );
  };

  return (
    <Card className="h-full overflow-hidden flex flex-col">
      <CardHeader className="py-3 px-4 bg-gradient-to-r from-indigo-50 to-white border-b">
        <CardTitle className="text-sm font-semibold text-gray-800 flex items-center gap-2">
          <Activity className="h-4 w-4 text-indigo-600" />
          Mesures ECG
        </CardTitle>
      </CardHeader>
      <CardContent className="p-4 flex-1 overflow-y-auto">
        <div className="space-y-4">
          {/* Fréquence cardiaque - mise en avant */}
          <div className="bg-gradient-to-r from-indigo-50 to-purple-50 rounded-lg p-3 border border-indigo-100">
            <Label className="text-xs text-indigo-600 font-medium">Fréquence Cardiaque</Label>
            <div className="flex items-baseline gap-2 mt-1">
              <Input
                type="number"
                value={measurements.heartRate ?? ''}
                onChange={(e) => handleInputChange('heartRate', e.target.value)}
                className={`h-10 text-xl font-bold text-center w-24 ${
                  isAbnormal('heartRate', measurements.heartRate) 
                    ? 'border-red-300 bg-red-50 text-red-700' 
                    : 'border-indigo-200'
                }`}
                placeholder="—"
              />
              <span className="text-sm text-indigo-600 font-medium">bpm</span>
            </div>
            <p className="text-[10px] text-gray-400 mt-1">Normal: 60-100 bpm</p>
          </div>

          {/* Intervalles */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Intervalles</p>
            <div className="grid grid-cols-2 gap-3">
              <MeasurementInput label="PR" measureKey="prInterval" unit="ms" />
              <MeasurementInput label="QRS" measureKey="qrsDuration" unit="ms" />
              <MeasurementInput label="QT" measureKey="qtInterval" unit="ms" />
              <MeasurementInput label="QTc (Bazett)" measureKey="qtcInterval" unit="ms" autoCalculated />
            </div>
          </div>

          {/* Axes */}
          <div>
            <p className="text-xs font-medium text-gray-500 mb-2 uppercase tracking-wider">Axes</p>
            <div className="grid grid-cols-3 gap-2">
              <MeasurementInput label="Axe P" measureKey="axisP" unit="°" />
              <MeasurementInput label="Axe QRS" measureKey="axisQRS" unit="°" />
              <MeasurementInput label="Axe T" measureKey="axisT" unit="°" />
            </div>
          </div>

          {/* Légende */}
          <div className="pt-2 border-t">
            <div className="flex items-center gap-4 text-[10px] text-gray-400">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 rounded bg-red-100 border border-red-300"></div>
                <span>Anormal</span>
              </div>
              <div className="flex items-center gap-1">
                <Calculator className="h-3 w-3 text-indigo-500" />
                <span>Auto-calculé</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

