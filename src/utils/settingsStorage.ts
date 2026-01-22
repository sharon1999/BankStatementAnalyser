import { LLMSettings } from '../types/llm';

const STORAGE_KEY = 'bankStatementAnalyzer_llmSettings';
const ENCRYPTION_KEY = 'bsa_2024_secure'; // Simple obfuscation key

/**
 * Simple encryption for API key (base64 + XOR cipher)
 * Note: This is basic obfuscation, not cryptographic security
 */
function encrypt(text: string): string {
    const xorEncrypt = (str: string, key: string): string => {
        return str
            .split('')
            .map((char, i) =>
                String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))
            )
            .join('');
    };

    const encrypted = xorEncrypt(text, ENCRYPTION_KEY);
    return btoa(encrypted); // Base64 encode
}

/**
 * Simple decryption for API key
 */
function decrypt(encrypted: string): string {
    const xorDecrypt = (str: string, key: string): string => {
        return str
            .split('')
            .map((char, i) =>
                String.fromCharCode(char.charCodeAt(0) ^ key.charCodeAt(i % key.length))
            )
            .join('');
    };

    try {
        const decoded = atob(encrypted); // Base64 decode
        return xorDecrypt(decoded, ENCRYPTION_KEY);
    } catch {
        return '';
    }
}

/**
 * Save LLM settings to localStorage
 */
export function saveSettings(settings: LLMSettings): void {
    try {
        const encryptedSettings = {
            provider: settings.provider,
            model: settings.model,
            apiKey: encrypt(settings.apiKey)
        };

        localStorage.setItem(STORAGE_KEY, JSON.stringify(encryptedSettings));
    } catch (error) {
        console.error('Failed to save settings:', error);
        throw new Error('Failed to save settings. Please check browser storage permissions.');
    }
}

/**
 * Load LLM settings from localStorage
 */
export function loadSettings(): LLMSettings | null {
    try {
        const stored = localStorage.getItem(STORAGE_KEY);
        if (!stored) return null;

        const parsed = JSON.parse(stored);
        return {
            provider: parsed.provider,
            model: parsed.model,
            apiKey: decrypt(parsed.apiKey)
        };
    } catch (error) {
        console.error('Failed to load settings:', error);
        return null;
    }
}

/**
 * Clear all settings from localStorage
 */
export function clearSettings(): void {
    try {
        localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
        console.error('Failed to clear settings:', error);
    }
}

/**
 * Check if settings are configured
 */
export function hasSettings(): boolean {
    const settings = loadSettings();
    return !!(settings && settings.apiKey && settings.provider && settings.model);
}

/**
 * Validate settings
 */
export function validateSettings(settings: LLMSettings): { valid: boolean; error?: string } {
    if (!settings.provider) {
        return { valid: false, error: 'Please select a provider' };
    }

    if (!settings.model) {
        return { valid: false, error: 'Please select a model' };
    }

    if (!settings.apiKey || settings.apiKey.trim().length === 0) {
        return { valid: false, error: 'Please enter an API key' };
    }

    // Basic API key format validation
    const apiKeyPatterns: Record<string, RegExp> = {
        openai: /^sk-[a-zA-Z0-9_-]{20,}$/,  // Supports both old and new formats (sk-... and sk-proj-...)
        anthropic: /^sk-ant-[a-zA-Z0-9-]{20,}$/,
        gemini: /^[a-zA-Z0-9_-]{20,}$/,
        groq: /^gsk_[a-zA-Z0-9]{20,}$/
    };

    const pattern = apiKeyPatterns[settings.provider];
    if (pattern && !pattern.test(settings.apiKey)) {
        return {
            valid: false,
            error: `Invalid API key format for ${settings.provider}. Please check your API key.`
        };
    }

    return { valid: true };
}
