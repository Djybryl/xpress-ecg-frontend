import { 
  ZoomIn, 
  ZoomOut, 
  Move, 
  Ruler, 
  Grid3X3
} from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ECGToolbarProps {
  zoomLevel: number;
  onZoomChange: (level: number) => void;
  activeTool: 'pan' | 'caliper' | 'marker';
  onToolChange: (tool: 'pan' | 'caliper' | 'marker') => void;
  showGrid: boolean;
  onShowGridChange: (show: boolean) => void;
  speed: 25 | 50;
  onSpeedChange: (speed: 25 | 50) => void;
  amplitude: 5 | 10 | 20;
  onAmplitudeChange: (amplitude: 5 | 10 | 20) => void;
}

export function ECGToolbar({
  zoomLevel,
  onZoomChange,
  activeTool,
  onToolChange,
  showGrid,
  onShowGridChange,
  speed,
  onSpeedChange,
  amplitude,
  onAmplitudeChange
}: ECGToolbarProps) {
  const handleZoomIn = () => {
    onZoomChange(Math.min(zoomLevel + 0.25, 3));
  };

  const handleZoomOut = () => {
    onZoomChange(Math.max(zoomLevel - 0.25, 0.5));
  };

  const handleResetZoom = () => {
    onZoomChange(1);
  };

  return (
    <div className="bg-white border-b px-4 py-2">
      <div className="flex items-center justify-between">
        {/* Outils de zoom */}
        <div className="flex items-center gap-1">
          <span className="text-xs font-medium text-gray-500 mr-2">Zoom:</span>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleZoomOut}
            disabled={zoomLevel <= 0.5}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <button
            onClick={handleResetZoom}
            className="h-8 px-3 text-sm font-medium text-gray-700 hover:bg-gray-100 rounded-md transition-colors"
          >
            {Math.round(zoomLevel * 100)}%
          </button>
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={handleZoomIn}
            disabled={zoomLevel >= 3}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        {/* Outils de mesure */}
        <div className="flex items-center gap-1 border-l pl-4 ml-4">
          <span className="text-xs font-medium text-gray-500 mr-2">Outils:</span>
          <Button
            variant={activeTool === 'pan' ? 'default' : 'outline'}
            size="sm"
            className={`h-8 ${activeTool === 'pan' ? 'bg-indigo-600' : ''}`}
            onClick={() => onToolChange('pan')}
          >
            <Move className="h-4 w-4 mr-1" />
            Déplacer
          </Button>
          <Button
            variant={activeTool === 'caliper' ? 'default' : 'outline'}
            size="sm"
            className={`h-8 ${activeTool === 'caliper' ? 'bg-indigo-600' : ''}`}
            onClick={() => onToolChange('caliper')}
          >
            <Ruler className="h-4 w-4 mr-1" />
            Calipers
          </Button>
        </div>

        {/* Affichage grille */}
        <div className="flex items-center gap-1 border-l pl-4 ml-4">
          <Button
            variant={showGrid ? 'default' : 'outline'}
            size="sm"
            className={`h-8 ${showGrid ? 'bg-indigo-600' : ''}`}
            onClick={() => onShowGridChange(!showGrid)}
          >
            <Grid3X3 className="h-4 w-4 mr-1" />
            Grille
          </Button>
        </div>

        {/* Vitesse de défilement */}
        <div className="flex items-center gap-1 border-l pl-4 ml-4">
          <span className="text-xs font-medium text-gray-500 mr-2">Vitesse:</span>
          <div className="flex rounded-lg border overflow-hidden">
            <button
              onClick={() => onSpeedChange(25)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                speed === 25 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              25 mm/s
            </button>
            <button
              onClick={() => onSpeedChange(50)}
              className={`px-3 py-1.5 text-sm font-medium transition-colors border-l ${
                speed === 50 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              50 mm/s
            </button>
          </div>
        </div>

        {/* Amplitude */}
        <div className="flex items-center gap-1 border-l pl-4 ml-4">
          <span className="text-xs font-medium text-gray-500 mr-2">Amplitude:</span>
          <div className="flex rounded-lg border overflow-hidden">
            <button
              onClick={() => onAmplitudeChange(5)}
              className={`px-2 py-1.5 text-sm font-medium transition-colors ${
                amplitude === 5 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              5
            </button>
            <button
              onClick={() => onAmplitudeChange(10)}
              className={`px-2 py-1.5 text-sm font-medium transition-colors border-l ${
                amplitude === 10 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              10
            </button>
            <button
              onClick={() => onAmplitudeChange(20)}
              className={`px-2 py-1.5 text-sm font-medium transition-colors border-l ${
                amplitude === 20 
                  ? 'bg-indigo-600 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              20
            </button>
          </div>
          <span className="text-xs text-gray-500 ml-1">mm/mV</span>
        </div>
      </div>
    </div>
  );
}

