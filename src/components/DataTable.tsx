import { useState } from 'react';
import { Transaction } from '../types/transaction';
import { motion } from 'framer-motion';
import { ArrowUpDown, Search } from 'lucide-react';

interface DataTableProps {
  transactions: Transaction[];
}

export default function DataTable({ transactions }: DataTableProps) {
  const [sortKey, setSortKey] = useState<keyof Transaction>('date');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'debit' | 'credit'>('all');

  const handleSort = (key: keyof Transaction) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('desc');
    }
  };

  const filteredAndSorted = transactions
    .filter(t => {
      const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           t.category.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = filterType === 'all' || t.type === filterType;
      return matchesSearch && matchesType;
    })
    .sort((a, b) => {
      const aVal = a[sortKey];
      const bVal = b[sortKey];

      if (aVal instanceof Date && bVal instanceof Date) {
        return sortOrder === 'asc' ? aVal.getTime() - bVal.getTime() : bVal.getTime() - aVal.getTime();
      }

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return sortOrder === 'asc' ? aVal - bVal : bVal - aVal;
      }

      return sortOrder === 'asc'
        ? String(aVal).localeCompare(String(bVal))
        : String(bVal).localeCompare(String(aVal));
    });

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden"
    >
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">
          Transaction Details
        </h3>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
            <input
              type="text"
              placeholder="Search transactions..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setFilterType('all')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterType === 'all'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setFilterType('credit')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterType === 'credit'
                  ? 'bg-green-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Income
            </button>
            <button
              onClick={() => setFilterType('debit')}
              className={`px-4 py-2 rounded-lg transition-colors ${
                filterType === 'debit'
                  ? 'bg-red-600 text-white'
                  : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
              }`}
            >
              Expenses
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900">
            <tr>
              <th
                onClick={() => handleSort('date')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <div className="flex items-center gap-2">
                  Date
                  <ArrowUpDown size={14} />
                </div>
              </th>
              <th
                onClick={() => handleSort('description')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <div className="flex items-center gap-2">
                  Description
                  <ArrowUpDown size={14} />
                </div>
              </th>
              <th
                onClick={() => handleSort('category')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <div className="flex items-center gap-2">
                  Category
                  <ArrowUpDown size={14} />
                </div>
              </th>
              <th
                onClick={() => handleSort('amount')}
                className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <div className="flex items-center justify-end gap-2">
                  Amount
                  <ArrowUpDown size={14} />
                </div>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {filteredAndSorted.map((transaction, index) => (
              <motion.tr
                key={transaction.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.02 }}
                className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-700 dark:text-gray-300">
                  {transaction.date.toLocaleDateString()}
                </td>
                <td className="px-6 py-4 text-sm text-gray-700 dark:text-gray-300">
                  {transaction.description}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm">
                  <span className="px-2 py-1 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-medium">
                    {transaction.category}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium">
                  <span className={transaction.type === 'credit' ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}>
                    {transaction.type === 'credit' ? '+' : '-'}${transaction.amount.toFixed(2)}
                  </span>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredAndSorted.length === 0 && (
        <div className="p-8 text-center text-gray-500 dark:text-gray-400">
          No transactions found
        </div>
      )}
    </motion.div>
  );
}
