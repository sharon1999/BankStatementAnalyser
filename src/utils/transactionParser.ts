import { Transaction } from '../types/transaction';

export function parseTransactions(text: string): Transaction[] {
  const transactions: Transaction[] = [];
  const lines = text.split('\n').filter(line => line.trim());

  const datePatterns = [
    /(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/g,
    /(\d{4}[\/\-]\d{1,2}[\/\-]\d{1,2})/g,
    /(\d{1,2}\s+(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+\d{2,4})/gi
  ];

  const amountPattern = /(?:[\$£€]?\s*)([\-\+]?\d{1,3}(?:,\d{3})*(?:\.\d{2})?)/g;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];

    let dateMatch = null;
    let matchedPattern = null;

    for (const pattern of datePatterns) {
      const match = line.match(pattern);
      if (match) {
        dateMatch = match[0];
        matchedPattern = pattern;
        break;
      }
    }

    if (!dateMatch) continue;

    const amounts = [...line.matchAll(amountPattern)]
      .map(m => m[1].replace(/,/g, ''))
      .filter(a => !isNaN(parseFloat(a)))
      .map(a => parseFloat(a));

    if (amounts.length === 0) continue;

    const amount = Math.abs(amounts[amounts.length - 1]);

    const isDebit = line.toLowerCase().includes('debit') ||
                    line.toLowerCase().includes('withdrawal') ||
                    line.toLowerCase().includes('payment') ||
                    amounts[amounts.length - 1] < 0;

    let description = line
      .replace(dateMatch, '')
      .replace(amountPattern, '')
      .replace(/debit|credit|withdrawal|deposit|payment/gi, '')
      .trim();

    if (description.length > 100) {
      description = description.substring(0, 100) + '...';
    }

    if (description.length < 3) {
      description = 'Transaction';
    }

    transactions.push({
      id: `txn-${Date.now()}-${i}`,
      date: parseDate(dateMatch),
      description,
      amount,
      type: isDebit ? 'debit' : 'credit',
      category: 'Uncategorized',
      rawText: line
    });
  }

  return transactions;
}

function parseDate(dateStr: string): Date {
  const cleaned = dateStr.trim();

  const formats = [
    /(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{2,4})/,
    /(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})/,
  ];

  for (const format of formats) {
    const match = cleaned.match(format);
    if (match) {
      let year, month, day;

      if (match[1].length === 4) {
        [, year, month, day] = match;
      } else {
        [, month, day, year] = match;
      }

      if (year.length === 2) {
        year = '20' + year;
      }

      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      if (!isNaN(date.getTime())) {
        return date;
      }
    }
  }

  const monthMatch = cleaned.match(/(\d{1,2})\s+(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{2,4})/i);
  if (monthMatch) {
    const [, day, monthStr, year] = monthMatch;
    const months: Record<string, number> = {
      jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
      jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11
    };
    const month = months[monthStr.toLowerCase().substring(0, 3)];
    const fullYear = year.length === 2 ? '20' + year : year;
    return new Date(parseInt(fullYear), month, parseInt(day));
  }

  return new Date();
}
