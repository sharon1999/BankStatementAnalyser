import { useState } from "react";
import Navbar from "./components/Navbar";
import FileUploader from "./components/FileUploader";
import PDFRedactor from "./components/PDFRedactor";
import LoadingScreen from "./components/LoadingScreen";
import Dashboard from "./components/Dashboard";
import {
  Transaction,
  TransactionSummary,
  RedactionBox,
} from "./types/transaction";
import {
  extractTextFromPDF,
  validateBankStatement,
} from "./utils/pdfProcessor";
import { parseTransactions } from "./utils/transactionParser";
import { categorizeTransactions } from "./utils/categorizer";
import { generateSummary } from "./utils/analytics";

type AppState = "upload" | "redact" | "loading" | "dashboard";

function App() {
  const [state, setState] = useState<AppState>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);

  const handleFileSelect = async (file: File) => {
    setState("loading");

    try {
      // const isValid = await validateBankStatement(file);

      // if (!isValid) {
      //   alert('This PDF does not appear to be a bank statement. Please upload a valid bank statement PDF.');
      //   setState('upload');
      //   return;
      // }

      setSelectedFile(file);
      setState("redact");
    } catch (error) {
      console.error("Error validating PDF:", error);
      alert("Failed to validate PDF. Please try again.");
      setState("upload");
    }
  };

  const handleRedactionComplete = async (redactionBoxes: RedactionBox[]) => {
    setState("loading");

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const pages = await extractTextFromPDF(selectedFile!, redactionBoxes);
      const allText = pages.map((p) => p.text).join("\n");

      const parsedTransactions = parseTransactions(allText);
      const categorizedTransactions =
        categorizeTransactions(parsedTransactions);
      const summaryData = generateSummary(categorizedTransactions);

      setTransactions(categorizedTransactions);
      setSummary(summaryData);
      setState("dashboard");
    } catch (error) {
      console.error("Error processing PDF:", error);
      alert("Failed to process PDF. Please try again with a different file.");
      setState("upload");
    }
  };

  const handleReset = () => {
    setSelectedFile(null);
    setTransactions([]);
    setSummary(null);
    setState("upload");
  };

  const handleCancelRedaction = () => {
    setSelectedFile(null);
    setState("upload");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar />

      <main className="container mx-auto">
        {state === "upload" && <FileUploader onFileSelect={handleFileSelect} />}

        {state === "redact" && selectedFile && (
          <PDFRedactor
            file={selectedFile}
            onComplete={handleRedactionComplete}
            onCancel={handleCancelRedaction}
          />
        )}

        {state === "loading" && <LoadingScreen />}

        {state === "dashboard" && summary && (
          <Dashboard
            transactions={transactions}
            summary={summary}
            onReset={handleReset}
          />
        )}
      </main>

      <footer className="py-6 text-center text-sm text-gray-600 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700 mt-12">
        <p className="font-medium mb-1">
          🔒 All data is processed locally. Nothing is uploaded.
        </p>
        <p>
          Your financial information stays completely private and secure in your
          browser.
        </p>
      </footer>
    </div>
  );
}

export default App;
