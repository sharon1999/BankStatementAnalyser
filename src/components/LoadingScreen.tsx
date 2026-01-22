import { motion } from 'framer-motion';
import { Loader2, Sparkles } from 'lucide-react';
import { useState, useEffect } from 'react';

interface LoadingScreenProps {
  message?: string;
}

const AI_MESSAGES = [
  'Connecting to AI provider...',
  'Analyzing transactions with AI...',
  'Categorizing expenses intelligently...',
  'Generating financial insights...',
  'Processing your data...'
];

export default function LoadingScreen({ message }: LoadingScreenProps) {
  const [messageIndex, setMessageIndex] = useState(0);
  const [displayMessage, setDisplayMessage] = useState(
    message || AI_MESSAGES[0]
  );

  useEffect(() => {
    if (!message) {
      const interval = setInterval(() => {
        setMessageIndex((prev) => (prev + 1) % AI_MESSAGES.length);
      }, 2000);
      return () => clearInterval(interval);
    }
  }, [message]);

  useEffect(() => {
    if (!message) {
      setDisplayMessage(AI_MESSAGES[messageIndex]);
    }
  }, [messageIndex, message]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center min-h-[60vh] gap-6"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
        className="relative"
      >
        <Loader2 size={64} className="text-blue-600 dark:text-blue-400" />
        <motion.div
          animate={{ scale: [1, 1.2, 1], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute -top-2 -right-2"
        >
          <Sparkles size={24} className="text-cyan-500" />
        </motion.div>
      </motion.div>

      <div className="text-center max-w-md">
        <motion.h2
          key={displayMessage}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-2xl font-bold text-gray-800 dark:text-white mb-2"
        >
          {displayMessage}
        </motion.h2>
        <p className="text-gray-600 dark:text-gray-400">
          {message ? 'This may take a few moments' : 'Powered by AI'}
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
