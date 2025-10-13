export interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'debit' | 'credit';
  category: string;
  rawText?: string;
}

export interface TransactionSummary {
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  transactionCount: number;
  categoryBreakdown: Record<string, number>;
  monthlyData: MonthlyData[];
}

export interface MonthlyData {
  month: string;
  income: number;
  expenses: number;
}

export interface RedactionBox {
  x: number;
  y: number;
  width: number;
  height: number;
  pageNumber: number;
}
