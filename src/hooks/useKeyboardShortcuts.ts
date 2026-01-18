import { useEffect, useCallback } from 'react';
import { useAppStore } from '@/stores/appStore';

interface ShortcutConfig {
  key: string;
  ctrl?: boolean;
  shift?: boolean;
  alt?: boolean;
  action: () => void;
  description: string;
  category: 'navigation' | 'actions' | 'view' | 'system';
}

export const KEYBOARD_SHORTCUTS: ShortcutConfig[] = [
  // Navigation
  { key: 'ArrowLeft', action: () => {}, description: 'ECG précédent', category: 'navigation' },
  { key: 'ArrowRight', action: () => {}, description: 'ECG suivant', category: 'navigation' },
  { key: 'Escape', action: () => {}, description: 'Fermer / Retour', category: 'navigation' },
  
  // Actions
  { key: 's', ctrl: true, action: () => {}, description: 'Sauvegarder / Valider', category: 'actions' },
  { key: 'p', ctrl: true, action: () => {}, description: 'Imprimer', category: 'actions' },
  { key: 'n', ctrl: true, action: () => {}, description: 'Nouvelle note', category: 'actions' },
  { key: 'Enter', ctrl: true, action: () => {}, description: 'Valider et envoyer', category: 'actions' },
  
  // View
  { key: 'k', ctrl: true, action: () => {}, description: 'Recherche rapide', category: 'view' },
  { key: 'g', ctrl: true, action: () => {}, description: 'Afficher/masquer grille', category: 'view' },
  { key: '+', ctrl: true, action: () => {}, description: 'Zoom avant', category: 'view' },
  { key: '-', ctrl: true, action: () => {}, description: 'Zoom arrière', category: 'view' },
  { key: '0', ctrl: true, action: () => {}, description: 'Réinitialiser zoom', category: 'view' },
  
  // System
  { key: '?', shift: true, action: () => {}, description: 'Afficher les raccourcis', category: 'system' },
  { key: 'l', ctrl: true, shift: true, action: () => {}, description: 'Verrouiller la session', category: 'system' },
  { key: 'd', ctrl: true, action: () => {}, description: 'Basculer thème sombre', category: 'system' },
];

interface UseKeyboardShortcutsProps {
  onPrevious?: () => void;
  onNext?: () => void;
  onSave?: () => void;
  onPrint?: () => void;
  onEscape?: () => void;
  onSearch?: () => void;
  onToggleGrid?: () => void;
  onZoomIn?: () => void;
  onZoomOut?: () => void;
  onZoomReset?: () => void;
  onNewNote?: () => void;
  onValidate?: () => void;
  disabled?: boolean;
}

export function useKeyboardShortcuts({
  onPrevious,
  onNext,
  onSave,
  onPrint,
  onEscape,
  onSearch,
  onToggleGrid,
  onZoomIn,
  onZoomOut,
  onZoomReset,
  onNewNote,
  onValidate,
  disabled = false,
}: UseKeyboardShortcutsProps) {
  const { setShowKeyboardShortcuts, setTheme, theme, lockSession } = useAppStore();

  const handleKeyDown = useCallback(
    (event: KeyboardEvent) => {
      if (disabled) return;

      // Ignore if typing in an input/textarea
      const target = event.target as HTMLElement;
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.isContentEditable
      ) {
        // Allow some shortcuts even in inputs
        if (!(event.ctrlKey && ['s', 'p', 'k'].includes(event.key.toLowerCase()))) {
          return;
        }
      }

      const key = event.key.toLowerCase();
      const isCtrl = event.ctrlKey || event.metaKey;
      const isShift = event.shiftKey;

      // Show keyboard shortcuts
      if (event.key === '?' && isShift) {
        event.preventDefault();
        setShowKeyboardShortcuts(true);
        return;
      }

      // Toggle dark mode
      if (key === 'd' && isCtrl) {
        event.preventDefault();
        setTheme(theme === 'dark' ? 'light' : 'dark');
        return;
      }

      // Lock session
      if (key === 'l' && isCtrl && isShift) {
        event.preventDefault();
        lockSession();
        return;
      }

      // Search
      if (key === 'k' && isCtrl) {
        event.preventDefault();
        onSearch?.();
        return;
      }

      // Save
      if (key === 's' && isCtrl) {
        event.preventDefault();
        onSave?.();
        return;
      }

      // Print
      if (key === 'p' && isCtrl) {
        event.preventDefault();
        onPrint?.();
        return;
      }

      // New note
      if (key === 'n' && isCtrl) {
        event.preventDefault();
        onNewNote?.();
        return;
      }

      // Validate and send
      if (key === 'enter' && isCtrl) {
        event.preventDefault();
        onValidate?.();
        return;
      }

      // Toggle grid
      if (key === 'g' && isCtrl) {
        event.preventDefault();
        onToggleGrid?.();
        return;
      }

      // Zoom
      if ((key === '+' || key === '=') && isCtrl) {
        event.preventDefault();
        onZoomIn?.();
        return;
      }
      if (key === '-' && isCtrl) {
        event.preventDefault();
        onZoomOut?.();
        return;
      }
      if (key === '0' && isCtrl) {
        event.preventDefault();
        onZoomReset?.();
        return;
      }

      // Navigation (without modifiers)
      if (!isCtrl && !isShift) {
        if (event.key === 'ArrowLeft') {
          onPrevious?.();
          return;
        }
        if (event.key === 'ArrowRight') {
          onNext?.();
          return;
        }
        if (event.key === 'Escape') {
          onEscape?.();
          return;
        }
      }
    },
    [
      disabled,
      onPrevious,
      onNext,
      onSave,
      onPrint,
      onEscape,
      onSearch,
      onToggleGrid,
      onZoomIn,
      onZoomOut,
      onZoomReset,
      onNewNote,
      onValidate,
      setShowKeyboardShortcuts,
      setTheme,
      theme,
      lockSession,
    ]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
}

export function getShortcutsByCategory() {
  const categories = {
    navigation: [] as ShortcutConfig[],
    actions: [] as ShortcutConfig[],
    view: [] as ShortcutConfig[],
    system: [] as ShortcutConfig[],
  };

  KEYBOARD_SHORTCUTS.forEach((shortcut) => {
    categories[shortcut.category].push(shortcut);
  });

  return categories;
}

export function formatShortcut(shortcut: ShortcutConfig): string {
  const parts: string[] = [];
  if (shortcut.ctrl) parts.push('Ctrl');
  if (shortcut.shift) parts.push('Shift');
  if (shortcut.alt) parts.push('Alt');
  
  let key = shortcut.key;
  if (key === 'ArrowLeft') key = '←';
  if (key === 'ArrowRight') key = '→';
  if (key === 'ArrowUp') key = '↑';
  if (key === 'ArrowDown') key = '↓';
  if (key === 'Escape') key = 'Esc';
  if (key === 'Enter') key = '↵';
  if (key === ' ') key = 'Space';
  
  parts.push(key.toUpperCase());
  
  return parts.join(' + ');
}
