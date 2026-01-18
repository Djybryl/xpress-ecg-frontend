import { useState } from 'react';
import { 
  Flag, 
  AlertTriangle, 
  Heart, 
  Zap, 
  MessageSquare,
  Trash2,
  ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface ECGMarker {
  id: string;
  type: 'p-wave' | 'qrs' | 't-wave' | 'arrhythmia' | 'artifact' | 'custom';
  position: { x: number; y: number };
  label: string;
  color: string;
  note?: string;
}

interface ECGMarkersProps {
  markers: ECGMarker[];
  onAddMarker: (marker: ECGMarker) => void;
  onDeleteMarker: (id: string) => void;
  onClearMarkers: () => void;
  isActive: boolean;
  onToggle: () => void;
  containerRef: React.RefObject<HTMLDivElement>;
}

const MARKER_TYPES = [
  { type: 'p-wave', label: 'Onde P', color: '#3b82f6', icon: '🔵' },
  { type: 'qrs', label: 'Complexe QRS', color: '#10b981', icon: '💚' },
  { type: 't-wave', label: 'Onde T', color: '#f59e0b', icon: '🟡' },
  { type: 'arrhythmia', label: 'Arythmie', color: '#ef4444', icon: '❗' },
  { type: 'artifact', label: 'Artéfact', color: '#6b7280', icon: '⚠️' },
  { type: 'custom', label: 'Personnalisé', color: '#8b5cf6', icon: '📍' },
] as const;

export function ECGMarkers({
  markers,
  onAddMarker,
  onDeleteMarker,
  onClearMarkers,
  isActive,
  onToggle,
  containerRef,
}: ECGMarkersProps) {
  const [selectedType, setSelectedType] = useState<ECGMarker['type']>('qrs');
  const [showTypeMenu, setShowTypeMenu] = useState(false);
  const [editingMarker, setEditingMarker] = useState<string | null>(null);
  const [noteText, setNoteText] = useState('');

  const currentType = MARKER_TYPES.find(t => t.type === selectedType)!;

  const handleClick = (e: React.MouseEvent) => {
    if (!isActive || !containerRef.current) return;

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + containerRef.current.scrollLeft;
    const y = e.clientY - rect.top + containerRef.current.scrollTop;

    const marker: ECGMarker = {
      id: `marker-${Date.now()}`,
      type: selectedType,
      position: { x, y },
      label: currentType.label,
      color: currentType.color,
    };

    onAddMarker(marker);
  };

  const saveNote = (_markerId: string) => {
    // Would update marker with note
    setEditingMarker(null);
    setNoteText('');
  };

  return (
    <div className="relative">
      {/* Toolbar */}
      <div className="absolute top-14 left-2 z-20 flex items-center gap-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 p-1">
        <Button
          variant={isActive ? 'default' : 'ghost'}
          size="sm"
          onClick={onToggle}
          className={isActive ? 'bg-emerald-600 hover:bg-emerald-700' : ''}
        >
          <Flag className="h-4 w-4 mr-1" />
          Marqueurs
        </Button>

        {isActive && (
          <>
            <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1" />
            
            {/* Type selector */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowTypeMenu(!showTypeMenu)}
                className="min-w-[140px] justify-between"
              >
                <span className="flex items-center gap-2">
                  <span 
                    className="w-3 h-3 rounded-full" 
                    style={{ backgroundColor: currentType.color }}
                  />
                  {currentType.label}
                </span>
                <ChevronDown className="h-3 w-3 ml-2" />
              </Button>

              {showTypeMenu && (
                <div className="absolute top-full left-0 mt-1 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 py-1 min-w-[160px] z-30">
                  {MARKER_TYPES.map((type) => (
                    <button
                      key={type.type}
                      onClick={() => {
                        setSelectedType(type.type);
                        setShowTypeMenu(false);
                      }}
                      className={`w-full px-3 py-2 text-left text-sm flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-gray-700 ${
                        selectedType === type.type ? 'bg-gray-50 dark:bg-gray-700' : ''
                      }`}
                    >
                      <span 
                        className="w-3 h-3 rounded-full" 
                        style={{ backgroundColor: type.color }}
                      />
                      {type.label}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="w-px h-6 bg-gray-200 dark:bg-gray-600 mx-1" />

            <Button
              variant="ghost"
              size="sm"
              onClick={onClearMarkers}
              disabled={markers.length === 0}
              title="Effacer tous les marqueurs"
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>

      {/* Markers list */}
      {isActive && markers.length > 0 && (
        <div className="absolute top-14 right-2 z-20 bg-white dark:bg-gray-800 rounded-lg shadow-lg border dark:border-gray-700 p-3 min-w-[220px] max-h-[300px] overflow-y-auto">
          <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
            Marqueurs ({markers.length})
          </h4>
          <div className="space-y-2">
            {markers.map((marker) => (
              <div
                key={marker.id}
                className="flex items-start justify-between p-2 rounded-lg bg-gray-50 dark:bg-gray-700/50 group"
              >
                <div className="flex items-start gap-2">
                  <span 
                    className="w-3 h-3 rounded-full mt-0.5 flex-shrink-0" 
                    style={{ backgroundColor: marker.color }}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {marker.label}
                    </p>
                    {marker.note && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                        {marker.note}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setEditingMarker(marker.id)}
                    className="p-1 hover:bg-gray-200 dark:hover:bg-gray-600 rounded"
                    title="Ajouter une note"
                  >
                    <MessageSquare className="h-3 w-3 text-gray-500" />
                  </button>
                  <button
                    onClick={() => onDeleteMarker(marker.id)}
                    className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded text-red-500"
                    title="Supprimer"
                  >
                    <Trash2 className="h-3 w-3" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Click overlay */}
      {isActive && containerRef.current && (
        <div
          className="absolute inset-0 z-10 cursor-crosshair"
          style={{
            width: containerRef.current.scrollWidth,
            height: containerRef.current.scrollHeight,
          }}
          onClick={handleClick}
        >
          {/* Render markers */}
          {markers.map((marker) => (
            <div
              key={marker.id}
              className="absolute transform -translate-x-1/2 -translate-y-1/2 group"
              style={{
                left: marker.position.x,
                top: marker.position.y,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              {/* Marker pin */}
              <div
                className="relative cursor-pointer"
                onClick={() => setEditingMarker(marker.id)}
              >
                <div
                  className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg transform transition-transform hover:scale-110"
                  style={{ backgroundColor: marker.color }}
                >
                  {marker.type === 'arrhythmia' && <AlertTriangle className="h-3 w-3" />}
                  {marker.type === 'qrs' && <Heart className="h-3 w-3" />}
                  {marker.type === 'artifact' && <Zap className="h-3 w-3" />}
                  {!['arrhythmia', 'qrs', 'artifact'].includes(marker.type) && (
                    <Flag className="h-3 w-3" />
                  )}
                </div>
                
                {/* Tooltip */}
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <div className="bg-gray-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {marker.label}
                    {marker.note && (
                      <p className="text-gray-300 mt-0.5">{marker.note}</p>
                    )}
                  </div>
                </div>
              </div>

              {/* Edit note popup */}
              {editingMarker === marker.id && (
                <div 
                  className="absolute top-8 left-1/2 -translate-x-1/2 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-700 p-3 w-64 z-50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <textarea
                    value={noteText}
                    onChange={(e) => setNoteText(e.target.value)}
                    placeholder="Ajouter une note..."
                    className="w-full h-20 text-sm border rounded-lg p-2 resize-none focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    autoFocus
                  />
                  <div className="flex justify-end gap-2 mt-2">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setEditingMarker(null)}
                    >
                      Annuler
                    </Button>
                    <Button
                      size="sm"
                      onClick={() => saveNote(marker.id)}
                      className="bg-indigo-600 hover:bg-indigo-700"
                    >
                      Sauvegarder
                    </Button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Instructions */}
      {isActive && markers.length === 0 && (
        <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-20 bg-emerald-600 text-white px-4 py-2 rounded-lg shadow-lg text-sm animate-pulse">
          <Flag className="h-4 w-4 inline mr-2" />
          Cliquez pour placer un marqueur "{currentType.label}"
        </div>
      )}
    </div>
  );
}
