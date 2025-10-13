import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface ChartCardProps {
  title: string;
  children: ReactNode;
  className?: string;
}

export default function ChartCard({ title, children, className = '' }: ChartCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 border border-gray-200 dark:border-gray-700 ${className}`}
    >
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
        {title}
      </h3>
      <div className="w-full">
        {children}
      </div>
    </motion.div>
  );
}
