import { LLMSettings, BankStatementAnalysis, AnalyzedTransaction } from '../types/llm';
import { Transaction, TransactionSummary } from '../types/transaction';

const SYSTEM_PROMPT = `You are a financial analysis AI specialized in parsing bank statements. 
Your task is to extract transactions from bank statement text and categorize them intelligently.

Extract the following information for each transaction:
- Date (in YYYY-MM-DD format)
- Description (clean, concise description)
- Amount (positive number)
- Type (debit or credit)
- Category (categorize into: Food & Dining, Transportation, Shopping, Bills & Utilities, Healthcare, Entertainment, Travel, Income, Transfer, Other)
- Balance (if available)

Return ONLY valid JSON in this exact format:
{
  "transactions": [
    {
      "date": "2024-01-15",
      "description": "Grocery Store",
      "amount": 45.50,
      "type": "debit",
      "category": "Food & Dining",
      "balance": 1234.56
    }
  ]
}`;

/**
 * Analyze bank statement text using the configured LLM provider
 */
export async function analyzeBankStatement(
    text: string,
    settings: LLMSettings
): Promise<{ transactions: Transaction[]; summary: TransactionSummary }> {
    if (!settings.apiKey) {
        throw new Error('API key is required. Please configure your API key in settings.');
    }

    if (!text || text.trim().length === 0) {
        throw new Error('No text to analyze. Please ensure the bank statement contains readable text.');
    }

    let response: BankStatementAnalysis;

    try {
        switch (settings.provider) {
            case 'openai':
                response = await callOpenAI(text, settings);
                break;
            case 'anthropic':
                response = await callAnthropic(text, settings);
                break;
            case 'gemini':
                response = await callGemini(text, settings);
                break;
            case 'groq':
                response = await callGroq(text, settings);
                break;
            default:
                throw new Error(`Unsupported provider: ${settings.provider}`);
        }
    } catch (error: any) {
        if (error.message?.includes('API key')) {
            throw new Error('Invalid API key. Please check your settings.');
        }
        if (error.message?.includes('quota') || error.message?.includes('rate limit')) {
            throw new Error('API rate limit exceeded. Please try again later or use a different provider.');
        }
        throw new Error(`Failed to analyze statement: ${error.message}`);
    }

    // Convert to app's Transaction format
    const transactions: Transaction[] = response.transactions.map((t, index) => ({
        id: `txn-${Date.now()}-${index}`,
        date: new Date(t.date),
        description: t.description,
        amount: t.amount,
        type: t.type,
        category: t.category
    }));

    // Generate summary
    const summary: TransactionSummary = {
        totalIncome: response.summary.totalIncome,
        totalExpenses: response.summary.totalExpenses,
        netBalance: response.summary.netChange,
        transactionCount: response.summary.transactionCount,
        categoryBreakdown: response.summary.categoryBreakdown,
        monthlyData: []
    };

    return { transactions, summary };
}

/**
 * OpenAI API call
 */
async function callOpenAI(text: string, settings: LLMSettings): Promise<BankStatementAnalysis> {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.apiKey}`
        },
        body: JSON.stringify({
            model: settings.model,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: `Analyze this bank statement and extract all transactions:\n\n${text}` }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.1
        })
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);

    return processAnalysis(parsed);
}

/**
 * Anthropic API call
 */
async function callAnthropic(text: string, settings: LLMSettings): Promise<BankStatementAnalysis> {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'x-api-key': settings.apiKey,
            'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify({
            model: settings.model,
            max_tokens: 4096,
            system: SYSTEM_PROMPT,
            messages: [
                {
                    role: 'user',
                    content: `Analyze this bank statement and extract all transactions:\n\n${text}`
                }
            ],
            temperature: 0.1
        })
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `Anthropic API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.content[0].text;

    // Extract JSON from markdown code blocks if present
    const jsonMatch = content.match(/```json\n([\s\S]*?)\n```/) || content.match(/\{[\s\S]*\}/);
    const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : content;
    const parsed = JSON.parse(jsonStr);

    return processAnalysis(parsed);
}

/**
 * Google Gemini API call
 */
async function callGemini(text: string, settings: LLMSettings): Promise<BankStatementAnalysis> {
    const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${settings.model}:generateContent?key=${settings.apiKey}`,
        {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                contents: [{
                    parts: [{
                        text: `${SYSTEM_PROMPT}\n\nAnalyze this bank statement and extract all transactions:\n\n${text}`
                    }]
                }],
                generationConfig: {
                    temperature: 0.1,
                    responseMimeType: 'application/json'
                }
            })
        }
    );

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.candidates[0].content.parts[0].text;
    const parsed = JSON.parse(content);

    return processAnalysis(parsed);
}

/**
 * Groq API call (OpenAI-compatible)
 */
async function callGroq(text: string, settings: LLMSettings): Promise<BankStatementAnalysis> {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${settings.apiKey}`
        },
        body: JSON.stringify({
            model: settings.model,
            messages: [
                { role: 'system', content: SYSTEM_PROMPT },
                { role: 'user', content: `Analyze this bank statement and extract all transactions:\n\n${text}` }
            ],
            response_format: { type: 'json_object' },
            temperature: 0.1
        })
    });

    if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.error?.message || `Groq API error: ${response.status}`);
    }

    const data = await response.json();
    const content = data.choices[0].message.content;
    const parsed = JSON.parse(content);

    return processAnalysis(parsed);
}

/**
 * Process and validate the LLM response, generate summary
 */
function processAnalysis(parsed: any): BankStatementAnalysis {
    const transactions: AnalyzedTransaction[] = parsed.transactions || [];

    if (!Array.isArray(transactions) || transactions.length === 0) {
        throw new Error('No transactions found in the analysis. Please ensure the document is a valid bank statement.');
    }

    // Calculate summary
    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryBreakdown: Record<string, number> = {};

    transactions.forEach(t => {
        if (t.type === 'credit' || t.category === 'Income') {
            totalIncome += t.amount;
        } else {
            totalExpenses += t.amount;
        }

        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
    });

    const topExpenseCategories = Object.entries(categoryBreakdown)
        .filter(([cat]) => cat !== 'Income')
        .map(([category, amount]) => ({ category, amount }))
        .sort((a, b) => b.amount - a.amount)
        .slice(0, 5);

    return {
        transactions,
        summary: {
            totalIncome,
            totalExpenses,
            netChange: totalIncome - totalExpenses,
            transactionCount: transactions.length,
            categoryBreakdown,
            topExpenseCategories
        }
    };
}

/**
 * Test API connection with a simple request
 */
export async function testConnection(settings: LLMSettings): Promise<boolean> {
    try {
        const testText = "Date: 2024-01-01, Description: Test Transaction, Amount: $10.00, Type: Debit";
        await analyzeBankStatement(testText, settings);
        return true;
    } catch (error) {
        console.error('Connection test failed:', error);
        return false;
    }
}
