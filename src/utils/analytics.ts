import { Transaction, TransactionSummary, MonthlyData } from '../types/transaction';

export function generateSummary(transactions: Transaction[]): TransactionSummary {
  const totalIncome = transactions
    .filter(t => t.type === 'credit')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpenses = transactions
    .filter(t => t.type === 'debit')
    .reduce((sum, t) => sum + t.amount, 0);

  const categoryBreakdown = transactions.reduce((acc, t) => {
    if (t.type === 'debit') {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
    }
    return acc;
  }, {} as Record<string, number>);

  const monthlyMap = new Map<string, { income: number; expenses: number }>();

  transactions.forEach(t => {
    const monthKey = `${t.date.getFullYear()}-${String(t.date.getMonth() + 1).padStart(2, '0')}`;

    if (!monthlyMap.has(monthKey)) {
      monthlyMap.set(monthKey, { income: 0, expenses: 0 });
    }

    const data = monthlyMap.get(monthKey)!;
    if (t.type === 'credit') {
      data.income += t.amount;
    } else {
      data.expenses += t.amount;
    }
  });

  const monthlyData: MonthlyData[] = Array.from(monthlyMap.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([month, data]) => ({
      month: formatMonth(month),
      income: data.income,
      expenses: data.expenses
    }));

  return {
    totalIncome,
    totalExpenses,
    netBalance: totalIncome - totalExpenses,
    transactionCount: transactions.length,
    categoryBreakdown,
    monthlyData
  };
}

function formatMonth(monthKey: string): string {
  const [year, month] = monthKey.split('-');
  const date = new Date(parseInt(year), parseInt(month) - 1);
  return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
}

export function exportToCSV(transactions: Transaction[]): string {
  const headers = ['Date', 'Description', 'Amount', 'Type', 'Category'];
  const rows = transactions.map(t => [
    t.date.toLocaleDateString(),
    `"${t.description.replace(/"/g, '""')}"`,
    t.amount.toFixed(2),
    t.type,
    t.category
  ]);

  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

export function exportToJSON(transactions: Transaction[], summary: TransactionSummary): string {
  return JSON.stringify({
    summary,
    transactions: transactions.map(t => ({
      ...t,
      date: t.date.toISOString()
    }))
  }, null, 2);
}
