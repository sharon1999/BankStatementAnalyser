import { motion } from 'framer-motion';
import { Loader2 } from 'lucide-react';

interface LoadingScreenProps {
  message?: string;
}

export default function LoadingScreen({ message = 'Analyzing your bank statement...' }: LoadingScreenProps) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[60vh] gap-6"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
      >
        <Loader2 size={64} className="text-blue-600 dark:text-blue-400" />
      </motion.div>

      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          {message}
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          This may take a few moments
        </p>
      </div>

      <div className="flex gap-2">
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0 }}
          className="w-3 h-3 bg-blue-600 rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.2 }}
          className="w-3 h-3 bg-blue-600 rounded-full"
        />
        <motion.div
          animate={{ scale: [1, 1.2, 1] }}
          transition={{ duration: 0.6, repeat: Infinity, delay: 0.4 }}
          className="w-3 h-3 bg-blue-600 rounded-full"
        />
      </div>
    </motion.div>
  );
}
