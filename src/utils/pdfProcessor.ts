import * as pdfjsLib from "pdfjs-dist";
import { RedactionBox } from "../types/transaction";

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

export interface PDFPageData {
  pageNumber: number;
  text: string;
  viewport: any;
}

/**
 * Check whether a text item falls inside any redaction box.
 * Uses proper coordinate transformation between PDF space and canvas space.
 */
function isTextRedacted(
  textItem: any,
  redactionBoxes: RedactionBox[],
  pageNumber: number,
  viewport: any
): boolean {
  const pageBoxes = redactionBoxes.filter(
    (box) => box.pageNumber === pageNumber
  );
  if (pageBoxes.length === 0) return false;

  // Extract the PDF-space coordinates
  const [pdfX, pdfY] = [textItem.transform[4], textItem.transform[5]];
  const pdfWidth = textItem.width;
  const pdfHeight = textItem.height;

  // Convert PDF coordinates to canvas coordinates using the viewport
  const [x1, y1] = viewport.convertToViewportPoint(pdfX, pdfY);
  const [x2, y2] = viewport.convertToViewportPoint(
    pdfX + pdfWidth,
    pdfY + pdfHeight
  );

  const textX = Math.min(x1, x2);
  const textY = Math.min(y1, y2);
  const textWidth = Math.abs(x2 - x1);
  const textHeight = Math.abs(y2 - y1);

  const textRight = textX + textWidth;
  const textBottom = textY + textHeight;

  // Compare with user redaction boxes (in canvas coordinates)
  for (const box of pageBoxes) {
    const boxRight = box.x + box.width;
    const boxBottom = box.y + box.height;

    const textInsideBox =
      textX >= box.x &&
      textY >= box.y &&
      textRight <= boxRight &&
      textBottom <= boxBottom;

    if (textInsideBox) return true;
  }

  return false;
}

/**
 * Extracts visible text (excluding redacted regions)
 */
export async function extractTextFromPDF(
  file: File,
  redactionBoxes: RedactionBox[] = []
): Promise<PDFPageData[]> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const pages: PDFPageData[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);

    // Use scale = 1 (as requested)
    const scale = 1;
    const viewport = page.getViewport({ scale });

    const textContent = await page.getTextContent();

    // Filter text based on redactions (using proper transform)
    const filteredItems = textContent.items.filter((item: any) => {
      return (
        item.str?.trim() && !isTextRedacted(item, redactionBoxes, i, viewport)
      );
    });

    const text = filteredItems.map((item: any) => item.str).join(" ");

    pages.push({
      pageNumber: i,
      text,
      viewport,
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
    const allText = pages.map((p) => p.text.toLowerCase()).join(" ");

    const bankIndicators = [
      "statement",
      "account",
      "balance",
      "transaction",
      "deposit",
      "withdrawal",
      "debit",
      "credit",
      "bank",
      "beginning balance",
      "ending balance",
      "account number",
      "statement period",
      "opening balance",
      "closing balance",
    ];

    const matchCount = bankIndicators.reduce(
      (count, indicator) => count + (allText.includes(indicator) ? 1 : 0),
      0
    );

    return matchCount >= 3;
  } catch (error) {
    console.error("Error validating PDF:", error);
    return false;
  }
}
