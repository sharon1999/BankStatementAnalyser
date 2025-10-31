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

function isTextInRedactionBox(
  textItem: any,
  viewport: any,
  redactionBoxes: RedactionBox[],
  pageNumber: number,
  scale: number = 1.5
): boolean {
  const pageBoxes = redactionBoxes.filter(box => box.pageNumber === pageNumber);

  if (pageBoxes.length === 0) {
    return false;
  }

  const transform = viewport.transform;
  const x = textItem.transform[4];
  const y = textItem.transform[5];
  const width = textItem.width;
  const height = textItem.height;

  for (const box of pageBoxes) {
    const boxLeft = box.x;
    const boxRight = box.x + box.width;
    const boxTop = box.y;
    const boxBottom = box.y + box.height;

    const textLeft = x * scale;
    const textRight = (x + width) * scale;
    const textTop = y * scale;
    const textBottom = (y + height) * scale;

    const horizontalOverlap = textLeft < boxRight && textRight > boxLeft;
    const verticalOverlap = textTop < boxBottom && textBottom > boxTop;

    if (horizontalOverlap && verticalOverlap) {
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
  const scale = 1.5;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const textContent = await page.getTextContent();
    const viewport = page.getViewport({ scale: 1.0 });

    const filteredItems = textContent.items.filter((item: any) => {
      if (!item.str || item.str.trim() === '') {
        return false;
      }

      return !isTextInRedactionBox(item, viewport, redactionBoxes, i, scale);
    });

    const text = filteredItems
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
