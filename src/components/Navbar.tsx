import { FileBarChart, Settings } from 'lucide-react';

interface NavbarProps {
  onSettingsClick?: () => void;
  hasApiKey?: boolean;
}

export default function Navbar({ onSettingsClick, hasApiKey = false }: NavbarProps) {
  return (
    <nav className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg">
            <FileBarChart size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-white">
              Bank Statement Analyzer
            </h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">
              AI-Powered Analysis
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {onSettingsClick && (
            <button
              onClick={onSettingsClick}
              className="relative p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors group"
              title="AI Settings"
            >
              <Settings size={20} className="text-gray-600 dark:text-gray-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors" />
              {!hasApiKey && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-orange-500 rounded-full border-2 border-white dark:border-gray-800 animate-pulse" />
              )}
            </button>
          )}
        </div>
      </div>
    </nav>
  );
}
