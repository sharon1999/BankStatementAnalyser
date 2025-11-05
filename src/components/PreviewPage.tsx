import { ArrowLeft, Download } from "lucide-react";
import { motion } from "framer-motion";

interface PreviewPageProps {
  text: string;
  pageCount: number;
  onBack: () => void;
  onConfirm: () => void;
}

export default function PreviewPage({
  text,
  pageCount,
  onBack,
  onConfirm,
}: PreviewPageProps) {
  const handleDownload = () => {
    const element = document.createElement("a");
    const file = new Blob([text], { type: "text/plain" });
    element.href = URL.createObjectURL(file);
    element.download = "redacted_text.txt";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const wordCount = text
    .trim()
    .split(/\s+/)
    .filter((word) => word.length > 0).length;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 py-8"
    >
      <div className="container mx-auto px-4">
        <motion.button
          whileHover={{ x: -4 }}
          onClick={onBack}
          className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white mb-8 transition-colors"
        >
          <ArrowLeft size={20} />
          Back to redaction
        </motion.button>

        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 mb-6"
          >
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Preview Redacted Text
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Review the extracted text with redacted content removed
            </p>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 mb-6"
          >
            <div className="flex flex-wrap gap-4 mb-6 pb-6 border-b border-gray-200 dark:border-gray-700">
              <div className="flex-1 min-w-[150px]">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Pages Processed
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {pageCount}
                </p>
              </div>
              <div className="flex-1 min-w-[150px]">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Words Extracted
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {wordCount.toLocaleString()}
                </p>
              </div>
              <div className="flex-1 min-w-[150px]">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300 mb-1">
                  Characters
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {text.length.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 dark:text-gray-200 mb-3">
                Extracted Text
              </label>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto border border-gray-200 dark:border-gray-600">
                <p className="text-gray-800 dark:text-gray-100 whitespace-pre-wrap text-sm leading-relaxed font-mono">
                  {text}
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleDownload}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-900 dark:text-white rounded-lg font-semibold hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              <Download size={20} />
              Download Text
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={onConfirm}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-lg font-semibold hover:from-blue-600 hover:to-cyan-600 transition-all shadow-lg"
            >
              Proceed to Analysis
            </motion.button>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}
