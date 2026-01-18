import { useRef, useState } from 'react';
import { Maximize2, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ECGCanvasProps {
  zoomLevel: number;
  showGrid: boolean;
  speed: 25 | 50;
  amplitude: 5 | 10 | 20;
  activeTool: 'pan' | 'caliper' | 'marker';
}

export function ECGCanvas({ 
  zoomLevel, 
  showGrid, 
  speed, 
  amplitude,
  activeTool 
}: ECGCanvasProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [scrollPos, setScrollPos] = useState({ x: 0, y: 0 });

  // Gestion du plein écran
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      containerRef.current?.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  // Gestion du drag pour le pan
  const handleMouseDown = (e: React.MouseEvent) => {
    if (activeTool === 'pan') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - scrollPos.x, y: e.clientY - scrollPos.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging && activeTool === 'pan') {
      setScrollPos({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Reset position
  const resetView = () => {
    setScrollPos({ x: 0, y: 0 });
  };

  return (
    <div 
      ref={containerRef}
      className={`relative bg-white rounded-xl border shadow-sm overflow-hidden h-full ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none' : ''
      }`}
    >
      {/* Barre d'outils flottante */}
      <div className="absolute top-3 right-3 z-10 flex gap-1 bg-white/90 backdrop-blur-sm rounded-lg shadow-md p-1 border">
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={resetView}
          title="Réinitialiser la vue"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8"
          onClick={toggleFullscreen}
          title="Plein écran"
        >
          <Maximize2 className="h-4 w-4" />
        </Button>
      </div>

      {/* Indicateurs */}
      <div className="absolute top-3 left-3 z-10 flex gap-2">
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md px-3 py-1.5 border text-xs font-medium text-gray-600">
          {speed} mm/s
        </div>
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md px-3 py-1.5 border text-xs font-medium text-gray-600">
          {amplitude} mm/mV
        </div>
        <div className="bg-white/90 backdrop-blur-sm rounded-lg shadow-md px-3 py-1.5 border text-xs font-medium text-gray-600">
          Zoom: {Math.round(zoomLevel * 100)}%
        </div>
      </div>

      {/* Zone de l'ECG */}
      <div 
        className={`w-full h-full overflow-auto ${
          activeTool === 'pan' ? 'cursor-grab active:cursor-grabbing' : 
          activeTool === 'caliper' ? 'cursor-crosshair' : 'cursor-pointer'
        }`}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <div 
          className="relative min-w-full min-h-full"
          style={{ 
            transform: `scale(${zoomLevel}) translate(${scrollPos.x / zoomLevel}px, ${scrollPos.y / zoomLevel}px)`,
            transformOrigin: 'top left'
          }}
        >
          {/* Grille de fond */}
          {showGrid && (
            <div 
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `
                  linear-gradient(to right, rgba(239, 68, 68, 0.1) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(239, 68, 68, 0.1) 1px, transparent 1px),
                  linear-gradient(to right, rgba(239, 68, 68, 0.05) 1px, transparent 1px),
                  linear-gradient(to bottom, rgba(239, 68, 68, 0.05) 1px, transparent 1px)
                `,
                backgroundSize: '25px 25px, 25px 25px, 5px 5px, 5px 5px'
              }}
            />
          )}

          {/* Tracé ECG simulé - 12 dérivations */}
          <svg 
            viewBox="0 0 1200 800" 
            className="w-full h-full"
            style={{ minWidth: '1200px', minHeight: '800px' }}
          >
            {/* Labels des dérivations */}
            <g className="text-xs font-semibold" fill="#374151">
              <text x="10" y="55">I</text>
              <text x="310" y="55">aVR</text>
              <text x="610" y="55">V1</text>
              <text x="910" y="55">V4</text>
              
              <text x="10" y="255">II</text>
              <text x="310" y="255">aVL</text>
              <text x="610" y="255">V2</text>
              <text x="910" y="255">V5</text>
              
              <text x="10" y="455">III</text>
              <text x="310" y="455">aVF</text>
              <text x="610" y="455">V3</text>
              <text x="910" y="455">V6</text>
            </g>

            {/* Tracés ECG - Dérivation I */}
            <path 
              d="M30 100 L60 100 L70 100 L80 95 L85 60 L90 130 L95 80 L100 105 L110 100 L180 100 L190 100 L200 95 L205 60 L210 130 L215 80 L220 105 L230 100 L280 100"
              fill="none" 
              stroke="#1e40af" 
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            
            {/* Tracés ECG - Dérivation aVR */}
            <path 
              d="M330 100 L360 100 L370 100 L380 105 L385 140 L390 70 L395 120 L400 95 L410 100 L480 100 L490 100 L500 105 L505 140 L510 70 L515 120 L520 95 L530 100 L580 100"
              fill="none" 
              stroke="#1e40af" 
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Tracés ECG - Dérivation V1 */}
            <path 
              d="M630 100 L660 100 L670 100 L680 110 L685 130 L690 50 L695 90 L700 100 L710 100 L780 100 L790 100 L800 110 L805 130 L810 50 L815 90 L820 100 L830 100 L880 100"
              fill="none" 
              stroke="#1e40af" 
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Tracés ECG - Dérivation V4 */}
            <path 
              d="M930 100 L960 100 L970 100 L980 90 L985 40 L990 150 L995 70 L1000 110 L1010 100 L1080 100 L1090 100 L1100 90 L1105 40 L1110 150 L1115 70 L1120 110 L1130 100 L1170 100"
              fill="none" 
              stroke="#1e40af" 
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Dérivation II */}
            <path 
              d="M30 300 L60 300 L70 300 L80 290 L85 250 L90 350 L95 280 L100 310 L110 300 L180 300 L190 300 L200 290 L205 250 L210 350 L215 280 L220 310 L230 300 L280 300"
              fill="none" 
              stroke="#1e40af" 
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Dérivation aVL */}
            <path 
              d="M330 300 L360 300 L370 300 L380 295 L385 270 L390 330 L395 290 L400 305 L410 300 L480 300 L490 300 L500 295 L505 270 L510 330 L515 290 L520 305 L530 300 L580 300"
              fill="none" 
              stroke="#1e40af" 
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Dérivation V2 */}
            <path 
              d="M630 300 L660 300 L670 300 L680 310 L685 340 L690 240 L695 290 L700 300 L710 300 L780 300 L790 300 L800 310 L805 340 L810 240 L815 290 L820 300 L830 300 L880 300"
              fill="none" 
              stroke="#1e40af" 
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Dérivation V5 */}
            <path 
              d="M930 300 L960 300 L970 300 L980 285 L985 230 L990 370 L995 270 L1000 315 L1010 300 L1080 300 L1090 300 L1100 285 L1105 230 L1110 370 L1115 270 L1120 315 L1130 300 L1170 300"
              fill="none" 
              stroke="#1e40af" 
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Dérivation III */}
            <path 
              d="M30 500 L60 500 L70 500 L80 495 L85 475 L90 525 L95 490 L100 505 L110 500 L180 500 L190 500 L200 495 L205 475 L210 525 L215 490 L220 505 L230 500 L280 500"
              fill="none" 
              stroke="#1e40af" 
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Dérivation aVF */}
            <path 
              d="M330 500 L360 500 L370 500 L380 490 L385 450 L390 550 L395 480 L400 510 L410 500 L480 500 L490 500 L500 490 L505 450 L510 550 L515 480 L520 510 L530 500 L580 500"
              fill="none" 
              stroke="#1e40af" 
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Dérivation V3 */}
            <path 
              d="M630 500 L660 500 L670 500 L680 505 L685 520 L690 460 L695 490 L700 500 L710 500 L780 500 L790 500 L800 505 L805 520 L810 460 L815 490 L820 500 L830 500 L880 500"
              fill="none" 
              stroke="#1e40af" 
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Dérivation V6 */}
            <path 
              d="M930 500 L960 500 L970 500 L980 490 L985 450 L990 550 L995 480 L1000 510 L1010 500 L1080 500 L1090 500 L1100 490 L1105 450 L1110 550 L1115 480 L1120 510 L1130 500 L1170 500"
              fill="none" 
              stroke="#1e40af" 
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />

            {/* Dérivation longue (DII rhythm strip) */}
            <g>
              <text x="10" y="655" className="text-xs font-semibold" fill="#374151">II (Rhythm)</text>
              <path 
                d="M30 700 L80 700 L90 700 L100 690 L105 650 L110 750 L115 680 L120 710 L130 700 
                   L200 700 L210 700 L220 690 L225 650 L230 750 L235 680 L240 710 L250 700 
                   L320 700 L330 700 L340 690 L345 650 L350 750 L355 680 L360 710 L370 700 
                   L440 700 L450 700 L460 690 L465 650 L470 750 L475 680 L480 710 L490 700 
                   L560 700 L570 700 L580 690 L585 650 L590 750 L595 680 L600 710 L610 700 
                   L680 700 L690 700 L700 690 L705 650 L710 750 L715 680 L720 710 L730 700 
                   L800 700 L810 700 L820 690 L825 650 L830 750 L835 680 L840 710 L850 700 
                   L920 700 L930 700 L940 690 L945 650 L950 750 L955 680 L960 710 L970 700 
                   L1040 700 L1050 700 L1060 690 L1065 650 L1070 750 L1075 680 L1080 710 L1090 700 L1170 700"
                fill="none" 
                stroke="#1e40af" 
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </g>

            {/* Calibration signal */}
            <g>
              <text x="10" y="770" className="text-[10px]" fill="#6b7280">1mV</text>
              <path 
                d="M40 780 L40 755 L65 755 L65 780"
                fill="none" 
                stroke="#374151" 
                strokeWidth="1.5"
              />
            </g>
          </svg>
        </div>
      </div>

      {/* Instruction pour les calipers */}
      {activeTool === 'caliper' && (
        <div className="absolute bottom-3 left-1/2 -translate-x-1/2 bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm shadow-lg">
          Cliquez et faites glisser pour mesurer un intervalle
        </div>
      )}
    </div>
  );
}

