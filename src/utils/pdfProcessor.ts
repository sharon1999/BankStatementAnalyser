import * as pdfjsLib from 'pdfjs-dist';
import { RedactionBox } from '../types/transaction';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

export interface PDFPageData {
  pageNumber: number;
  text: string;
  viewport: any;
}

function isTextRedacted(
  textItem: any,
  redactionBoxes: RedactionBox[],
  pageNumber: number,
  scale: number = 1.5
): boolean {
  const pageBoxes = redactionBoxes.filter(box => box.pageNumber === pageNumber);

  if (pageBoxes.length === 0) return false;

  const textX = textItem.transform[4] * scale;
  const textY = textItem.transform[5] * scale;
  const textWidth = textItem.width * scale;
  const textHeight = textItem.height * scale;

  for (const box of pageBoxes) {
    const overlapsX = textX < box.x + box.width && textX + textWidth > box.x;
    const overlapsY = textY < box.y + box.height && textY + textHeight > box.y;

    if (overlapsX && overlapsY) {
      return true;
    }
  }

  return false;
}

export async function extractTextFromPDF(
  file: File,
  redactionBoxes: RedactionBox[] = []
): Promise<PDFPageData[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pages: PDFPageData[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1.5 });

    const filteredItems = textContent.items.filter((item: any) => {
      return item.str?.trim() && !isTextRedacted(item, redactionBoxes, i, 1.5);
    });

    const text = filteredItems.map((item: any) => item.str).join(' ');

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
