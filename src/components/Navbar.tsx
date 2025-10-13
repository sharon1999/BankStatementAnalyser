import { FileBarChart } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

export default function Navbar() {
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
              100% Private & Secure
            </p>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </nav>
  );
}
