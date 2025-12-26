import { useState, useRef } from 'react';
import { Ruler, Trash2, Move, Clock, Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Caliper {
  id: string;
  type: 'horizontal' | 'vertical';
  start: { x: number; y: number };
  end: { x: number; y: number };
  label?: string;
}

interface ECGCalipersProps {
  isActive: boolean;
  onToggle: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
  pixelsPerMm?: number;
  pixelsPerMs?: number;
}

export function ECGCalipers({ 
  isActive, 
  onToggle, 
  containerRef,
  pixelsPerMm = 4,
  pixelsPerMs = 0.4
}: ECGCalipersProps) {
  const [calipers, setCalipers] = useState<Caliper[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [currentCaliper, setCurrentCaliper] = useState<Caliper | null>(null);
  const [caliperType, setCaliperType] = useState<'horizontal' | 'vertical'>('horizontal');
  const [selectedCaliper, setSelectedCaliper] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);

  // Calculate measurement from caliper
  const calculateMeasurement = (caliper: Caliper): string => {
    const dx = Math.abs(caliper.end.x - caliper.start.x);
    const dy = Math.abs(caliper.end.y - caliper.start.y);

    if (caliper.type === 'horizontal') {
      // Time measurement (ms)
      const ms = dx / pixelsPerMs;
      if (ms >= 1000) {
        return `${(ms / 1000).toFixed(2)} s`;
      }
      return `${ms.toFixed(0)} ms`;
    } else {
      // Amplitude measurement (mV)
      const mm = dy / pixelsPerMm;
      const mV = mm / 10; // 10mm = 1mV standard
      return `${mV.toFixed(2)} mV`;
    }
  };

  // Calculate heart rate from RR interval
  const calculateHeartRate = (caliper: Caliper): string | null => {
    if (caliper.type !== 'horizontal') return null;
    const dx = Math.abs(caliper.end.x - caliper.start.x);
    const ms = dx / pixelsPerMs;
    if (ms < 200 || ms > 2000) return null; // Unrealistic RR interval
    const bpm = Math.round(60000 / ms);
    return `${bpm} bpm`;
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!isActive || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const newCaliper: Caliper = {
      id: `caliper-${Date.now()}`,
      type: caliperType,
      start: { x, y },
      end: { x, y },
    };

    setCurrentCaliper(newCaliper);
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !currentCaliper || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    setCurrentCaliper({
      ...currentCaliper,
      end: { 
        x: caliperType === 'vertical' ? currentCaliper.start.x : x,
        y: caliperType === 'horizontal' ? currentCaliper.start.y : y
      },
    });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentCaliper) return;

    const dx = Math.abs(currentCaliper.end.x - currentCaliper.start.x);
    const dy = Math.abs(currentCaliper.end.y - currentCaliper.start.y);

    // Only add if caliper has meaningful size
    if (dx > 10 || dy > 10) {
      setCalipers([...calipers, currentCaliper]);
    }

    setCurrentCaliper(null);
    setIsDrawing(false);
  };

  const deleteCaliper = (id: string) => {
    setCalipers(calipers.filter(c => c.id !== id));
    if (selectedCaliper === id) setSelectedCaliper(null);
  };

  const clearAllCalipers = () => {
    setCalipers([]);
    setSelectedCaliper(null);
  };

  const renderCaliper = (caliper: Caliper, isPreview = false) => {
    const isSelected = selectedCaliper === caliper.id;
    const measurement = calculateMeasurement(caliper);
    const heartRate = calculateHeartRate(caliper);
    const midX = (caliper.start.x + caliper.end.x) / 2;
    const midY = (caliper.start.y + caliper.end.y) / 2;

    return (
      <g key={caliper.id} className={isPreview ? 'opacity-70' : ''}>
        {/* Main line */}
        <line
          x1={caliper.start.x}
          y1={caliper.start.y}
          x2={caliper.end.x}
          y2={caliper.end.y}
          stroke={caliper.type === 'horizontal' ? '#6366f1' : '#10b981'}
          strokeWidth={isSelected ? 3 : 2}
          strokeDasharray={isPreview ? '5,5' : 'none'}
          className="cursor-pointer"
          onClick={() => !isPreview && setSelectedCaliper(caliper.id)}
        />

        {/* End markers */}
        {caliper.type === 'horizontal' ? (
          <>
            <line
              x1={caliper.start.x}
              y1={caliper.start.y - 15}
              x2={caliper.start.x}
              y2={caliper.start.y + 15}
              stroke="#6366f1"
              strokeWidth={2}
            />
            <line
              x1={caliper.end.x}
              y1={caliper.end.y - 15}
              x2={caliper.end.x}
              y2={caliper.end.y + 15}
              stroke="#6366f1"
              strokeWidth={2}
            />
          </>
        ) : (
          <>
            <line
              x1={caliper.start.x - 15}
              y1={caliper.start.y}
              x2={caliper.start.x + 15}
              y2={caliper.start.y}
              stroke="#10b981"
              strokeWidth={2}
            />
            <line
              x1={caliper.end.x - 15}
              y1={caliper.end.y}
              x2={caliper.end.x + 15}
              y2={caliper.end.y}
              stroke="#10b981"
              strokeWidth={2}
            />
          </>
        )}

        {/* Measurement label */}
        {!isPreview && (
          <g>
            <rect
              x={midX - 40}
              y={caliper.type === 'horizontal' ? midY - 35 : midY - 15}
              width={80}
              height={heartRate ? 40 : 24}
              rx={4}
              fill="white"
              stroke={caliper.type === 'horizontal' ? '#6366f1' : '#10b981'}
              strokeWidth={1}
              className="drop-shadow-sm"
            />
            <text
              x={midX}
              y={caliper.type === 'horizontal' ? midY - 18 : midY + 2}
              textAnchor="middle"
              className="text-xs font-bold fill-gray-900"
            >
              {measurement}
            </text>
            {heartRate && (
              <text
                x={midX}
                y={midY - 2}
                textAnchor="middle"
                className="text-xs fill-indigo-600"
              >
                ≈ {heartRate}
              </text>
            )}
          </g>
        )}

        {/* Delete button for selected */}
        {isSelected && !isPreview && (
          <g
            className="cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              deleteCaliper(caliper.id);
            }}
          >
            <circle
              cx={caliper.end.x + 20}
              cy={caliper.end.y - 20}
              r={12}
              fill="#ef4444"
              className="hover:fill-red-600"
            />
            <text
              x={caliper.end.x + 20}
              y={caliper.end.y - 16}
              textAnchor="middle"
              className="text-xs fill-white font-bold"
            >
              ×
            </text>
          </g>
        )}
      </g>
    );
  };

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="absolute top-2 left-2 z-20 flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 p-1">
        <Button
          variant={isActive ? 'default' : 'ghost'}
          size="sm"
          onClick={onToggle}
          className={isActive ? 'bg-indigo-600 hover:bg-indigo-700' : ''}
        >
          <Ruler className="h-4 w-4 mr-1" />
          Calipers
        </Button>

        {isActive && (
          <>
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1" />
            
            <Button
              variant={caliperType === 'horizontal' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setCaliperType('horizontal')}
              title="Mesure temporelle (ms)"
            >
              <Clock className="h-4 w-4" />
            </Button>
            
            <Button
              variant={caliperType === 'vertical' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setCaliperType('vertical')}
              title="Mesure d'amplitude (mV)"
            >
              <Activity className="h-4 w-4" />
            </Button>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1" />

            <Button
              variant="ghost"
              size="sm"
              onClick={clearAllCalipers}
              disabled={calipers.length === 0}
              title="Effacer tous les calipers"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Caliper info */}
      {isActive && calipers.length > 0 && (
        <div className="absolute top-2 right-2 z-20 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 p-3 min-w-[200px]">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
            Mesures ({calipers.length})
          </h4>
          <div className="space-y-1.5 max-h-[150px] overflow-y-auto">
            {calipers.map((caliper, idx) => {
              const measurement = calculateMeasurement(caliper);
              const heartRate = calculateHeartRate(caliper);
              return (
                <div
                  key={caliper.id}
                  className={`flex items-center justify-between text-sm p-1.5 rounded cursor-pointer transition-colors ${
                    selectedCaliper === caliper.id
                      ? 'bg-indigo-50 dark:bg-indigo-900/30'
                      : 'hover:bg-gray-50 dark:hover:bg-gray-700'
                  }`}
                  onClick={() => setSelectedCaliper(caliper.id)}
                >
                  <span className="flex items-center gap-2">
                    {caliper.type === 'horizontal' ? (
                      <Clock className="h-3 w-3 text-indigo-500" />
                    ) : (
                      <Activity className="h-3 w-3 text-emerald-500" />
                    )}
                    <span className="text-gray-700 dark:text-gray-300">
                      #{idx + 1}
                    </span>
                  </span>
                  <span className="font-mono font-medium text-gray-900 dark:text-white">
                    {measurement}
                    {heartRate && (
                      <span className="text-indigo-600 ml-1">({heartRate})</span>
                    )}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SVG overlay for drawing */}
      {isActive && containerRef.current && (
        <svg
          ref={svgRef}
          className="absolute inset-0 z-10 cursor-crosshair"
          style={{
            width: containerRef.current.scrollWidth,
            height: containerRef.current.scrollHeight,
          }}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Existing calipers */}
          {calipers.map(caliper => renderCaliper(caliper))}
          
          {/* Current caliper being drawn */}
          {currentCaliper && renderCaliper(currentCaliper, true)}
        </svg>
      )}

      {/* Instructions */}
      {isActive && calipers.length === 0 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 bg-indigo-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-pulse">
          <Move className="h-4 w-4 inline mr-2" />
          Cliquez et faites glisser pour mesurer
        </div>
      )}
    </div>
  );
}
