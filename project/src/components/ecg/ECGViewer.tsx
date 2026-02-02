import { useState, useRef, useEffect } from 'react';
import {
  ZoomIn,
  ZoomOut,
  RotateCw,
  Move,
  Maximize2,
  Minimize2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Image } from '@/components/ui/image';
import { IMAGES } from '@/lib/constants';

interface Point {
  x: number;
  y: number;
}

interface Measurement {
  id: string;
  type: 'interval' | 'amplitude';
  start: Point;
  end: Point;
  label: string;
}

interface ECGViewerProps {
  src?: string;
  onMeasure?: (measurement: Measurement) => void;
}

export function ECGViewer({ src = IMAGES.ECG.DEFAULT, onMeasure }: ECGViewerProps) {
  const [zoom, setZoom] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [measurements, setMeasurements] = useState<Measurement[]>([]);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const startPosRef = useRef<Point | null>(null);

  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isFullscreen) {
        setIsFullscreen(false);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isFullscreen]);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.1, 3));
  const handleZoomOut = () => setZoom(prev => Math.max(prev - 0.1, 0.5));
  const handleRotate = () => setRotation(prev => (prev + 90) % 360);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (!imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    startPosRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || !startPosRef.current || !imageRef.current) return;

    const rect = imageRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left - startPosRef.current.x;
    const y = e.clientY - rect.top - startPosRef.current.y;

    setPosition({ x, y });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    startPosRef.current = null;
  };

  const toggleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <div
      ref={containerRef}
      className={`relative ${
        isFullscreen
          ? 'fixed inset-0 z-50 bg-black'
          : 'w-full h-full'
      }`}
    >
      <div className="absolute top-4 right-4 z-10 bg-white/80 backdrop-blur-sm rounded-lg p-1 flex gap-1">
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleZoomOut}
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleZoomIn}
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={handleRotate}
        >
          <RotateCw className="h-4 w-4" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={toggleFullscreen}
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </div>

      <div
        className="relative w-full h-full overflow-hidden"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        <Image
          ref={imageRef}
          src={src}
          fallbackSrc={IMAGES.ECG.FALLBACK}
          alt="ECG"
          className="w-full h-full object-contain transition-transform cursor-move"
          style={{
            transform: `
              translate(${position.x}px, ${position.y}px)
              scale(${zoom})
              rotate(${rotation}deg)
            `,
            transformOrigin: 'center'
          }}
        />

        {measurements.map((measurement) => (
          <svg
            key={measurement.id}
            className="absolute inset-0 pointer-events-none"
          >
            <line
              x1={measurement.start.x}
              y1={measurement.start.y}
              x2={measurement.end.x}
              y2={measurement.end.y}
              stroke="red"
              strokeWidth="2"
            />
            <text
              x={(measurement.start.x + measurement.end.x) / 2}
              y={(measurement.start.y + measurement.end.y) / 2}
              fill="red"
              fontSize="12"
            >
              {measurement.label}
            </text>
          </svg>
        ))}
      </div>
    </div>
  );
}