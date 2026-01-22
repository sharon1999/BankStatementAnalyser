import { useState } from "react";
import Navbar from "./components/Navbar";
import FileUploader from "./components/FileUploader";
import PDFRedactor from "./components/PDFRedactor";
import PreviewPage from "./components/PreviewPage";
import LoadingScreen from "./components/LoadingScreen";
import Dashboard from "./components/Dashboard";
import SettingsModal from "./components/SettingsModal";
import {
  Transaction,
  TransactionSummary,
  RedactionBox,
} from "./types/transaction";
import {
  extractTextFromPDF
} from "./utils/pdfProcessor";
import { analyzeBankStatement } from "./services/llmService";
import { loadSettings, hasSettings } from "./utils/settingsStorage";
import { LLMSettings } from "./types/llm";

type AppState = "upload" | "redact" | "preview" | "loading" | "dashboard";

function App() {
  const [state, setState] = useState<AppState>("upload");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [summary, setSummary] = useState<TransactionSummary | null>(null);
  const [previewText, setPreviewText] = useState<string>("");
  const [previewPageCount, setPreviewPageCount] = useState<number>(0);
  const [settingsOpen, setSettingsOpen] = useState<boolean>(false);
  const [llmSettings, setLLMSettings] = useState<LLMSettings | null>(
    loadSettings()
  );

  const handleFileSelect = async (file: File) => {
    setState("loading");

    try {
      setSelectedFile(file);
      setState("redact");
    } catch (error) {
      console.error("Error validating PDF:", error);
      alert("Failed to validate PDF. Please try again.");
      setState("upload");
    }
  };

  const handleRedactionComplete = async (boxes: RedactionBox[]) => {
    setState("loading");

    try {
      await new Promise((resolve) => setTimeout(resolve, 500));

      const pages = await extractTextFromPDF(selectedFile!, boxes);
      const allText = pages.map((p) => p.text).join("\n");

      setPreviewText(allText);
      setPreviewPageCount(pages.length);
      setState("preview");
    } catch (error) {
      console.error("Error processing PDF:", error);
      alert("Failed to process PDF. Please try again with a different file.");
      setState("upload");
    }
  };

  const handlePreviewConfirm = async () => {
    // Check if API key is configured
    if (!llmSettings || !hasSettings()) {
      alert('Please configure your AI settings first.');
      setSettingsOpen(true);
      return;
    }

    setState("loading");

    try {
      // Use LLM to analyze the bank statement
      const result = await analyzeBankStatement(previewText, llmSettings);

      setTransactions(result.transactions);
      setSummary(result.summary);
      setState("dashboard");
    } catch (error) {
      console.error("Error analyzing transactions:", error);
      alert(
        error instanceof Error
          ? error.message
          : "Failed to analyze transactions. Please check your API settings and try again."
      );
      setState("preview");
    }
  };

  const handleSettingsSave = (settings: LLMSettings) => {
    setLLMSettings(settings);
  };

  const handleBackToRedaction = () => {
    setState("redact");
  };

  const handleReset = () => {
    setSelectedFile(null);
    setTransactions([]);
    setSummary(null);
    setPreviewText("");
    setPreviewPageCount(0);
    setState("upload");
  };

  const handleCancelRedaction = () => {
    setSelectedFile(null);
    setState("upload");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <Navbar
        onSettingsClick={() => setSettingsOpen(true)}
        hasApiKey={hasSettings()}
      />

      <SettingsModal
        isOpen={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        onSave={handleSettingsSave}
      />

      <main className="container mx-auto">
        {state === "upload" && <FileUploader onFileSelect={handleFileSelect} />}

        {state === "redact" && selectedFile && (
          <PDFRedactor
            key={selectedFile.name}
            file={selectedFile}
            onComplete={handleRedactionComplete}
            onCancel={handleCancelRedaction}
          />
        )}

        {state === "preview" && (
          <PreviewPage
            text={previewText}
            pageCount={previewPageCount}
            onBack={handleBackToRedaction}
            onConfirm={handlePreviewConfirm}
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
          🔒 Privacy-First AI Analysis
        </p>
        <p className="max-w-2xl mx-auto">
          Redacted information is <strong>NEVER</strong> sent to AI providers. Only visible text is analyzed using your personal API key. No data is stored on our servers.
        </p>
      </footer>
    </div>
  );
}

export default App;
