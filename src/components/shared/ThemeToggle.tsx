import { Sun, Moon, Monitor } from 'lucide-react';
import { useAppStore } from '@/stores/appStore';

interface ThemeToggleProps {
  variant?: 'icon' | 'full';
}

export function ThemeToggle({ variant = 'icon' }: ThemeToggleProps) {
  const { theme, setTheme } = useAppStore();

  const toggleTheme = () => {
    if (theme === 'light') {
      setTheme('dark');
    } else if (theme === 'dark') {
      setTheme('system');
    } else {
      setTheme('light');
    }
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={toggleTheme}
        className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800 transition-colors"
        title={`Thème: ${theme === 'light' ? 'Clair' : theme === 'dark' ? 'Sombre' : 'Système'}`}
      >
        {theme === 'light' && <Sun className="h-5 w-5" />}
        {theme === 'dark' && <Moon className="h-5 w-5" />}
        {theme === 'system' && <Monitor className="h-5 w-5" />}
      </button>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm text-gray-600 dark:text-gray-400">Thème:</span>
      <div className="flex rounded-lg border dark:border-gray-700 overflow-hidden">
        <button
          onClick={() => setTheme('light')}
          className={`p-2 transition-colors ${
            theme === 'light'
              ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400'
              : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          title="Thème clair"
        >
          <Sun className="h-4 w-4" />
        </button>
        <button
          onClick={() => setTheme('dark')}
          className={`p-2 border-x dark:border-gray-700 transition-colors ${
            theme === 'dark'
              ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400'
              : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          title="Thème sombre"
        >
          <Moon className="h-4 w-4" />
        </button>
        <button
          onClick={() => setTheme('system')}
          className={`p-2 transition-colors ${
            theme === 'system'
              ? 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900 dark:text-indigo-400'
              : 'text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800'
          }`}
          title="Thème système"
        >
          <Monitor className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

