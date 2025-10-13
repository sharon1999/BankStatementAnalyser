import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export interface PDFPageData {
  pageNumber: number;
  text: string;
  viewport: any;
}

export async function extractTextFromPDF(file: File): Promise<PDFPageData[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pages: PDFPageData[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1.0 });

    const text = textContent.items
      .map((item: any) => item.str)
      .join(' ');

    pages.push({
      pageNumber: i,
      text,
      viewport
    });
  }

  return pages;
}

export async function loadPDFDocument(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  return await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
}

export async function validateBankStatement(file: File): Promise<boolean> {
  try {
    const pages = await extractTextFromPDF(file);
    const allText = pages.map(p => p.text.toLowerCase()).join(' ');

    const bankIndicators = [
      'statement',
      'account',
      'balance',
      'transaction',
      'deposit',
      'withdrawal',
      'debit',
      'credit',
      'bank',
      'beginning balance',
      'ending balance',
      'account number',
      'statement period',
      'opening balance',
      'closing balance'
    ];

    let matchCount = 0;
    for (const indicator of bankIndicators) {
      if (allText.includes(indicator)) {
        matchCount++;
      }
    }

    return matchCount >= 3;
  } catch (error) {
    console.error('Error validating PDF:', error);
    return false;
  }
}
