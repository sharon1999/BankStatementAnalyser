import { useCallback } from 'react';
import { Upload, FileText } from 'lucide-react';
import { motion } from 'framer-motion';

interface FileUploaderProps {
  onFileSelect: (file: File) => void;
}

export default function FileUploader({ onFileSelect }: FileUploaderProps) {
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type === 'application/pdf') {
      onFileSelect(file);
    } else {
      alert('Please upload a PDF file');
    }
  }, [onFileSelect]);

  const handleFileInput = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  }, [onFileSelect]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center justify-center min-h-[60vh] p-8"
    >
      <div className="max-w-2xl w-full">
        <div className="text-center mb-8">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="inline-block p-6 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-full mb-6"
          >
            <FileText size={48} className="text-white" />
          </motion.div>
          <h1 className="text-4xl font-bold text-gray-800 dark:text-white mb-3">
            Bank Statement Analyzer
          </h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">
            Upload your bank statement PDF for instant analysis
          </p>
        </div>

        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          className="border-3 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl p-12 text-center hover:border-blue-500 dark:hover:border-blue-400 transition-colors cursor-pointer bg-gray-50 dark:bg-gray-800/50"
        >
          <Upload size={64} className="mx-auto text-gray-400 mb-4" />
          <p className="text-xl font-medium text-gray-700 dark:text-gray-300 mb-2">
            Drop your PDF here or click to browse
          </p>
          <p className="text-sm text-gray-500 dark:text-gray-500 mb-6">
            Supports PDF bank statements
          </p>
          <label className="inline-block px-8 py-4 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors cursor-pointer font-medium">
            Select File
            <input
              type="file"
              accept=".pdf"
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="mt-8 p-6 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl"
        >
          <h3 className="font-semibold text-green-800 dark:text-green-300 mb-2 flex items-center gap-2">
            <span className="text-2xl">🔒</span>
            Your Privacy is Protected
          </h3>
          <p className="text-sm text-green-700 dark:text-green-400">
            All data is processed locally in your browser. Nothing is uploaded to any server.
            Your financial information stays completely private and secure.
          </p>
        </motion.div>
      </div>
    </motion.div>
  );
}
