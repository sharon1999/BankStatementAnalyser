export type LLMProvider = 'openai' | 'anthropic' | 'gemini' | 'groq';

export interface LLMModel {
    id: string;
    name: string;
    provider: LLMProvider;
    contextWindow: number;
    costPer1kTokens: {
        input: number;
        output: number;
    };
}

export interface LLMSettings {
    provider: LLMProvider;
    model: string;
    apiKey: string;
}

export interface AnalyzedTransaction {
    date: string;
    description: string;
    amount: number;
    type: 'debit' | 'credit';
    category: string;
    balance?: number;
}

export interface BankStatementAnalysis {
    transactions: AnalyzedTransaction[];
    summary: {
        totalIncome: number;
        totalExpenses: number;
        netChange: number;
        transactionCount: number;
        categoryBreakdown: Record<string, number>;
        topExpenseCategories: Array<{ category: string; amount: number }>;
    };
}

export const AVAILABLE_MODELS: Record<LLMProvider, LLMModel[]> = {
    openai: [
        {
            id: 'gpt-4o',
            name: 'GPT-4o (Best Quality)',
            provider: 'openai',
            contextWindow: 128000,
            costPer1kTokens: { input: 0.005, output: 0.015 }
        },
        {
            id: 'gpt-4o-mini',
            name: 'GPT-4o Mini (Recommended)',
            provider: 'openai',
            contextWindow: 128000,
            costPer1kTokens: { input: 0.00015, output: 0.0006 }
        },
        {
            id: 'gpt-3.5-turbo',
            name: 'GPT-3.5 Turbo (Fastest)',
            provider: 'openai',
            contextWindow: 16385,
            costPer1kTokens: { input: 0.0005, output: 0.0015 }
        }
    ],
    anthropic: [
        {
            id: 'claude-3-5-sonnet-20241022',
            name: 'Claude 3.5 Sonnet (Best Overall)',
            provider: 'anthropic',
            contextWindow: 200000,
            costPer1kTokens: { input: 0.003, output: 0.015 }
        },
        {
            id: 'claude-3-opus-20240229',
            name: 'Claude 3 Opus (Most Capable)',
            provider: 'anthropic',
            contextWindow: 200000,
            costPer1kTokens: { input: 0.015, output: 0.075 }
        },
        {
            id: 'claude-3-haiku-20240307',
            name: 'Claude 3 Haiku (Fastest)',
            provider: 'anthropic',
            contextWindow: 200000,
            costPer1kTokens: { input: 0.00025, output: 0.00125 }
        }
    ],
    gemini: [
        {
            id: 'gemini-2.5-pro',
            name: 'Gemini 2.5 Pro (Best Quality)',
            provider: 'gemini',
            contextWindow: 1000000,
            costPer1kTokens: { input: 0.00125, output: 0.005 }
        },
        {
            id: 'gemini-2.5-flash',
            name: 'Gemini 2.5 Flash (Fast & Recommended)',
            provider: 'gemini',
            contextWindow: 1000000,
            costPer1kTokens: { input: 0.000075, output: 0.0003 }
        },
        {
            id: 'gemini-2.0-flash',
            name: 'Gemini 2.0 Flash',
            provider: 'gemini',
            contextWindow: 1000000,
            costPer1kTokens: { input: 0.000075, output: 0.0003 }
        }
    ],
    groq: [
        {
            id: 'llama-3.1-70b-versatile',
            name: 'Llama 3.1 70B (Free, Fast)',
            provider: 'groq',
            contextWindow: 131072,
            costPer1kTokens: { input: 0, output: 0 }
        },
        {
            id: 'mixtral-8x7b-32768',
            name: 'Mixtral 8x7B (Free, Fast)',
            provider: 'groq',
            contextWindow: 32768,
            costPer1kTokens: { input: 0, output: 0 }
        },
        {
            id: 'gemma-7b-it',
            name: 'Gemma 7B (Free, Fastest)',
            provider: 'groq',
            contextWindow: 8192,
            costPer1kTokens: { input: 0, output: 0 }
        }
    ]
};

export const PROVIDER_INFO: Record<LLMProvider, { name: string; website: string; apiKeyUrl: string }> = {
    openai: {
        name: 'OpenAI',
        website: 'https://openai.com',
        apiKeyUrl: 'https://platform.openai.com/api-keys'
    },
    anthropic: {
        name: 'Anthropic',
        website: 'https://anthropic.com',
        apiKeyUrl: 'https://console.anthropic.com/settings/keys'
    },
    gemini: {
        name: 'Google Gemini',
        website: 'https://ai.google.dev',
        apiKeyUrl: 'https://aistudio.google.com/app/apikey'
    },
    groq: {
        name: 'Groq',
        website: 'https://groq.com',
        apiKeyUrl: 'https://console.groq.com/keys'
    }
};
