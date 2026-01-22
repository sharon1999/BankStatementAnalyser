import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Settings, Eye, EyeOff, CheckCircle, XCircle, ExternalLink, Loader } from 'lucide-react';
import { LLMProvider, LLMSettings, AVAILABLE_MODELS, PROVIDER_INFO } from '../types/llm';
import { saveSettings, loadSettings, validateSettings } from '../utils/settingsStorage';
import { testConnection } from '../services/llmService';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSave: (settings: LLMSettings) => void;
}

export default function SettingsModal({ isOpen, onClose, onSave }: SettingsModalProps) {
    const [provider, setProvider] = useState<LLMProvider>('openai');
    const [model, setModel] = useState('gpt-4o-mini');
    const [apiKey, setApiKey] = useState('');
    const [showApiKey, setShowApiKey] = useState(false);
    const [testing, setTesting] = useState(false);
    const [testResult, setTestResult] = useState<'success' | 'error' | null>(null);
    const [error, setError] = useState<string>('');

    // Load saved settings on mount
    useEffect(() => {
        if (isOpen) {
            const saved = loadSettings();
            if (saved) {
                setProvider(saved.provider);
                setModel(saved.model);
                setApiKey(saved.apiKey);
            }
            setTestResult(null);
            setError('');
        }
    }, [isOpen]);

    // Update model when provider changes
    useEffect(() => {
        const models = AVAILABLE_MODELS[provider];
        if (models.length > 0) {
            setModel(models[0].id);
        }
    }, [provider]);

    const handleTestConnection = async () => {
        setTesting(true);
        setTestResult(null);
        setError('');

        const settings: LLMSettings = { provider, model, apiKey };
        const validation = validateSettings(settings);

        if (!validation.valid) {
            setError(validation.error || 'Invalid settings');
            setTesting(false);
            setTestResult('error');
            return;
        }

        try {
            const success = await testConnection(settings);
            setTestResult(success ? 'success' : 'error');
            if (!success) {
                setError('Connection failed. Please check your API key and try again.');
            }
        } catch (err: any) {
            setTestResult('error');
            setError(err.message || 'Connection test failed');
        } finally {
            setTesting(false);
        }
    };

    const handleSave = () => {
        const settings: LLMSettings = { provider, model, apiKey };
        const validation = validateSettings(settings);

        if (!validation.valid) {
            setError(validation.error || 'Invalid settings');
            return;
        }

        try {
            saveSettings(settings);
            onSave(settings);
            onClose();
        } catch (err: any) {
            setError(err.message || 'Failed to save settings');
        }
    };

    const selectedModelInfo = AVAILABLE_MODELS[provider].find(m => m.id === model);
    const estimatedCost = selectedModelInfo
        ? ((3000 * selectedModelInfo.costPer1kTokens.input) + (800 * selectedModelInfo.costPer1kTokens.output)) / 1000
        : 0;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
                        onClick={onClose}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                            {/* Header */}
                            <div className="sticky top-0 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="p-2 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg">
                                        <Settings className="text-white" size={24} />
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-bold text-gray-800 dark:text-white">
                                            AI Settings
                                        </h2>
                                        <p className="text-sm text-gray-600 dark:text-gray-400">
                                            Configure your LLM provider and API key
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={onClose}
                                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                                >
                                    <X size={24} className="text-gray-600 dark:text-gray-400" />
                                </button>
                            </div>

                            {/* Content */}
                            <div className="p-6 space-y-6">
                                {/* Provider Selection */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        AI Provider
                                    </label>
                                    <select
                                        value={provider}
                                        onChange={(e) => setProvider(e.target.value as LLMProvider)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-white"
                                    >
                                        {Object.entries(PROVIDER_INFO).map(([key, info]) => (
                                            <option key={key} value={key}>
                                                {info.name}
                                            </option>
                                        ))}
                                    </select>
                                    <a
                                        href={PROVIDER_INFO[provider].apiKeyUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="inline-flex items-center gap-1 mt-2 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                                    >
                                        Get API Key <ExternalLink size={14} />
                                    </a>
                                </div>

                                {/* Model Selection */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        Model
                                    </label>
                                    <select
                                        value={model}
                                        onChange={(e) => setModel(e.target.value)}
                                        className="w-full px-4 py-3 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-white"
                                    >
                                        {AVAILABLE_MODELS[provider].map((m) => (
                                            <option key={m.id} value={m.id}>
                                                {m.name}
                                            </option>
                                        ))}
                                    </select>

                                    {/* Model Info */}
                                    {selectedModelInfo && (
                                        <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                                            <div className="flex items-center justify-between text-sm">
                                                <span className="text-gray-700 dark:text-gray-300">
                                                    Estimated cost per analysis:
                                                </span>
                                                <span className="font-semibold text-blue-700 dark:text-blue-400">
                                                    {estimatedCost === 0 ? 'Free' : `~$${estimatedCost.toFixed(4)}`}
                                                </span>
                                            </div>
                                            <div className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                                                Based on ~3,000 input + ~800 output tokens
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* API Key Input */}
                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                        API Key
                                    </label>
                                    <div className="relative">
                                        <input
                                            type={showApiKey ? 'text' : 'password'}
                                            value={apiKey}
                                            onChange={(e) => {
                                                setApiKey(e.target.value);
                                                setTestResult(null);
                                                setError('');
                                            }}
                                            placeholder={`Enter your ${PROVIDER_INFO[provider].name} API key`}
                                            className="w-full px-4 py-3 pr-12 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-gray-800 dark:text-white font-mono text-sm"
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowApiKey(!showApiKey)}
                                            className="absolute right-3 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-200 dark:hover:bg-gray-700 rounded transition-colors"
                                        >
                                            {showApiKey ? (
                                                <EyeOff size={20} className="text-gray-600 dark:text-gray-400" />
                                            ) : (
                                                <Eye size={20} className="text-gray-600 dark:text-gray-400" />
                                            )}
                                        </button>
                                    </div>
                                    <p className="mt-2 text-xs text-gray-600 dark:text-gray-400">
                                        🔒 Your API key is encrypted and stored locally in your browser. It's never sent to our servers.
                                    </p>
                                </div>

                                {/* Test Connection */}
                                <div>
                                    <button
                                        onClick={handleTestConnection}
                                        disabled={testing || !apiKey}
                                        className="w-full px-4 py-3 bg-gradient-to-r from-green-500 to-emerald-500 text-white rounded-lg hover:from-green-600 hover:to-emerald-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 font-semibold"
                                    >
                                        {testing ? (
                                            <>
                                                <Loader className="animate-spin" size={20} />
                                                Testing Connection...
                                            </>
                                        ) : (
                                            <>
                                                <CheckCircle size={20} />
                                                Test Connection
                                            </>
                                        )}
                                    </button>

                                    {/* Test Result */}
                                    {testResult && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className={`mt-3 p-3 rounded-lg border flex items-center gap-2 ${testResult === 'success'
                                                    ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800 text-green-700 dark:text-green-400'
                                                    : 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 text-red-700 dark:text-red-400'
                                                }`}
                                        >
                                            {testResult === 'success' ? (
                                                <>
                                                    <CheckCircle size={20} />
                                                    <span className="font-medium">Connection successful!</span>
                                                </>
                                            ) : (
                                                <>
                                                    <XCircle size={20} />
                                                    <span className="font-medium">Connection failed</span>
                                                </>
                                            )}
                                        </motion.div>
                                    )}

                                    {/* Error Message */}
                                    {error && (
                                        <motion.div
                                            initial={{ opacity: 0, y: -10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg text-sm text-red-700 dark:text-red-400"
                                        >
                                            {error}
                                        </motion.div>
                                    )}
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="sticky bottom-0 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 p-6 flex gap-3">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors font-semibold"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleSave}
                                    disabled={!apiKey}
                                    className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 text-white rounded-lg hover:from-blue-700 hover:to-cyan-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all font-semibold"
                                >
                                    Save Settings
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
