import { Keyboard } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { useAppStore } from '@/stores/appStore';
import { getShortcutsByCategory, formatShortcut } from '@/hooks/useKeyboardShortcuts';

export function KeyboardShortcutsModal() {
  const { showKeyboardShortcuts, setShowKeyboardShortcuts } = useAppStore();
  const shortcuts = getShortcutsByCategory();

  const categoryLabels = {
    navigation: '🧭 Navigation',
    actions: '⚡ Actions',
    view: '👁️ Affichage',
    system: '⚙️ Système',
  };

  return (
    <Modal
      isOpen={showKeyboardShortcuts}
      onClose={() => setShowKeyboardShortcuts(false)}
      title="Raccourcis clavier"
      size="lg"
    >
      <div className="grid grid-cols-2 gap-6">
        {Object.entries(shortcuts).map(([category, items]) => (
          <div key={category}>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              {categoryLabels[category as keyof typeof categoryLabels]}
            </h3>
            <div className="space-y-2">
              {items.map((shortcut, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between py-2 px-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
                >
                  <span className="text-sm text-gray-700 dark:text-gray-300">
                    {shortcut.description}
                  </span>
                  <kbd className="px-2 py-1 bg-white dark:bg-gray-700 border dark:border-gray-600 rounded text-xs font-mono text-gray-600 dark:text-gray-300 shadow-sm">
                    {formatShortcut(shortcut)}
                  </kbd>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t dark:border-gray-700">
        <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
          <Keyboard className="h-4 w-4" />
          Appuyez sur <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-xs font-mono">Shift + ?</kbd> à tout moment pour afficher cette aide
        </p>
      </div>
    </Modal>
  );
}

