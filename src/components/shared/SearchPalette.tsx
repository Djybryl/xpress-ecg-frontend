import { useState, useEffect, useRef } from 'react';
import { Search, FileText, Building2, Clock, ArrowRight, Command } from 'lucide-react';
import { useECGStore } from '@/stores/ecgStore';

interface SearchPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectECG: (ecgId: string) => void;
}

export function SearchPalette({ isOpen, onClose, onSelectECG }: SearchPaletteProps) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const { records } = useECGStore();

  // Focus input when opened
  useEffect(() => {
    if (isOpen) {
      inputRef.current?.focus();
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Close on escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Filter results
  const results = query.trim()
    ? records.filter(record => {
        const searchLower = query.toLowerCase();
        return (
          record.referenceNumber.toLowerCase().includes(searchLower) ||
          record.patient.firstName.toLowerCase().includes(searchLower) ||
          record.patient.lastName.toLowerCase().includes(searchLower) ||
          record.medicalCenter.toLowerCase().includes(searchLower) ||
          record.referringDoctor.toLowerCase().includes(searchLower)
        );
      }).slice(0, 8)
    : records.slice(0, 5);

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results[selectedIndex]) {
      e.preventDefault();
      onSelectECG(results[selectedIndex].id);
      onClose();
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-[20vh]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Palette */}
      <div className="relative w-full max-w-2xl mx-4 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
        {/* Search input */}
        <div className="flex items-center gap-3 px-4 py-4 border-b dark:border-gray-700">
          <Search className="h-5 w-5 text-gray-400" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Rechercher un patient, ECG, établissement..."
            className="flex-1 bg-transparent border-none outline-none text-gray-900 dark:text-white placeholder-gray-400 text-lg"
          />
          <kbd className="hidden sm:inline-flex items-center gap-1 px-2 py-1 bg-gray-100 dark:bg-gray-800 rounded text-xs text-gray-500 border dark:border-gray-700">
            <Command className="h-3 w-3" />K
          </kbd>
        </div>

        {/* Results */}
        <div className="max-h-[400px] overflow-y-auto">
          {results.length === 0 && query.trim() ? (
            <div className="p-8 text-center text-gray-500 dark:text-gray-400">
              <Search className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
              <p className="font-medium">Aucun résultat trouvé</p>
              <p className="text-sm mt-1">Essayez avec d'autres termes de recherche</p>
            </div>
          ) : (
            <>
              {!query.trim() && (
                <div className="px-4 py-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800">
                  ECG récents
                </div>
              )}
              <div className="py-2">
                {results.map((record, index) => (
                  <button
                    key={record.id}
                    onClick={() => {
                      onSelectECG(record.id);
                      onClose();
                    }}
                    className={`w-full px-4 py-3 flex items-center gap-4 transition-colors ${
                      index === selectedIndex
                        ? 'bg-indigo-50 dark:bg-indigo-900/30'
                        : 'hover:bg-gray-50 dark:hover:bg-gray-800'
                    }`}
                  >
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      record.priority === 'critical' ? 'bg-red-100 dark:bg-red-900/50' :
                      record.priority === 'urgent' ? 'bg-amber-100 dark:bg-amber-900/50' :
                      'bg-indigo-100 dark:bg-indigo-900/50'
                    }`}>
                      <FileText className={`h-5 w-5 ${
                        record.priority === 'critical' ? 'text-red-600' :
                        record.priority === 'urgent' ? 'text-amber-600' :
                        'text-indigo-600'
                      }`} />
                    </div>

                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-gray-900 dark:text-white">
                          {record.patient.firstName} {record.patient.lastName}
                        </span>
                        <span className="text-xs text-gray-500 dark:text-gray-400">
                          {record.referenceNumber}
                        </span>
                        {record.priority !== 'normal' && (
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                            record.priority === 'critical' 
                              ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-300'
                              : 'bg-amber-100 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300'
                          }`}>
                            {record.priority}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500 dark:text-gray-400">
                        <span className="flex items-center gap-1">
                          <Building2 className="h-3 w-3" />
                          {record.medicalCenter}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {formatDate(record.acquisitionDate)}
                        </span>
                      </div>
                    </div>

                    <ArrowRight className={`h-4 w-4 transition-opacity ${
                      index === selectedIndex ? 'opacity-100 text-indigo-600' : 'opacity-0'
                    }`} />
                  </button>
                ))}
              </div>
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-800 flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded">↑</kbd>
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded">↓</kbd>
              pour naviguer
            </span>
            <span className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded">↵</kbd>
              pour ouvrir
            </span>
          </div>
          <span className="flex items-center gap-1">
            <kbd className="px-1.5 py-0.5 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded">Esc</kbd>
            pour fermer
          </span>
        </div>
      </div>
    </div>
  );
}

