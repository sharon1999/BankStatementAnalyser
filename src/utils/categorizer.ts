import { Transaction } from '../types/transaction';

const categoryRules: Record<string, string[]> = {
  'Food & Dining': [
    'restaurant', 'cafe', 'coffee', 'pizza', 'burger', 'food', 'dining',
    'mcdonald', 'starbucks', 'subway', 'domino', 'kfc', 'grocery', 'supermarket',
    'whole foods', 'trader joe', 'safeway', 'walmart', 'target'
  ],
  'Transportation': [
    'uber', 'lyft', 'taxi', 'gas', 'fuel', 'parking', 'metro', 'transit',
    'airline', 'flight', 'car rental', 'shell', 'chevron', 'exxon'
  ],
  'Shopping': [
    'amazon', 'ebay', 'store', 'shop', 'mall', 'retail', 'clothes', 'fashion',
    'nike', 'adidas', 'apple store', 'best buy', 'ikea'
  ],
  'Bills & Utilities': [
    'electric', 'water', 'gas bill', 'internet', 'phone', 'mobile', 'utility',
    'verizon', 'at&t', 't-mobile', 'comcast', 'spectrum'
  ],
  'Entertainment': [
    'movie', 'cinema', 'netflix', 'spotify', 'hulu', 'disney', 'gaming',
    'steam', 'playstation', 'xbox', 'concert', 'ticket'
  ],
  'Healthcare': [
    'pharmacy', 'doctor', 'hospital', 'medical', 'health', 'clinic',
    'cvs', 'walgreens', 'dental', 'vision'
  ],
  'Salary': [
    'salary', 'payroll', 'wage', 'income', 'direct deposit', 'employer',
    'payment received'
  ],
  'Transfer': [
    'transfer', 'atm withdrawal', 'cash withdrawal', 'deposit'
  ],
  'Subscription': [
    'subscription', 'membership', 'recurring', 'monthly fee', 'annual fee'
  ]
};

export function categorizeTransaction(transaction: Transaction): Transaction {
  const searchText = `${transaction.description}`.toLowerCase();

  for (const [category, keywords] of Object.entries(categoryRules)) {
    for (const keyword of keywords) {
      if (searchText.includes(keyword.toLowerCase())) {
        return { ...transaction, category };
      }
    }
  }

  if (transaction.type === 'credit' && transaction.amount > 500) {
    return { ...transaction, category: 'Salary' };
  }

  return { ...transaction, category: 'Other' };
}

export function categorizeTransactions(transactions: Transaction[]): Transaction[] {
  return transactions.map(categorizeTransaction);
}
