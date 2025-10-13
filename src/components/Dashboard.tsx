import { Transaction, TransactionSummary } from '../types/transaction';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, PieChart, Pie, LineChart, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Activity, Download } from 'lucide-react';
import ChartCard from './ChartCard';
import DataTable from './DataTable';
import { exportToCSV, exportToJSON } from '../utils/analytics';

interface DashboardProps {
  transactions: Transaction[];
  summary: TransactionSummary;
  onReset: () => void;
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#14b8a6', '#f97316'];

export default function Dashboard({ transactions, summary, onReset }: DashboardProps) {
  const pieData = Object.entries(summary.categoryBreakdown)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const handleExportCSV = () => {
    const csv = exportToCSV(transactions);
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bank-statement-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const json = exportToJSON(transactions, summary);
    const blob = new Blob([json], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `bank-statement-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto p-8 space-y-8"
    >
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
            Financial Overview
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Analysis of {summary.transactionCount} transactions
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Download size={18} />
            CSV
          </button>
          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
          >
            <Download size={18} />
            JSON
          </button>
          <button
            onClick={onReset}
            className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
          >
            New Analysis
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Total Income</h3>
            <TrendingUp size={24} />
          </div>
          <p className="text-3xl font-bold">${summary.totalIncome.toFixed(2)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-gradient-to-br from-red-500 to-rose-600 rounded-2xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Total Expenses</h3>
            <TrendingDown size={24} />
          </div>
          <p className="text-3xl font-bold">${summary.totalExpenses.toFixed(2)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Net Balance</h3>
            <DollarSign size={24} />
          </div>
          <p className="text-3xl font-bold">${summary.netBalance.toFixed(2)}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-gradient-to-br from-purple-500 to-violet-600 rounded-2xl shadow-lg p-6 text-white"
        >
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-sm font-medium opacity-90">Transactions</h3>
            <Activity size={24} />
          </div>
          <p className="text-3xl font-bold">{summary.transactionCount}</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Monthly Income vs Expenses">
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={summary.monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="income" fill="#10b981" name="Income" />
              <Bar dataKey="expenses" fill="#ef4444" name="Expenses" />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>

        <ChartCard title="Spending by Category">
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>

      <ChartCard title="Balance Trend">
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={summary.monthlyData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="month" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="income"
              stroke="#10b981"
              strokeWidth={2}
              name="Income"
            />
            <Line
              type="monotone"
              dataKey="expenses"
              stroke="#ef4444"
              strokeWidth={2}
              name="Expenses"
            />
          </LineChart>
        </ResponsiveContainer>
      </ChartCard>

      <DataTable transactions={transactions} />
    </motion.div>
  );
}
