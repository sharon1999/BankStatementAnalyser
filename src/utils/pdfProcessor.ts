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
 * Check whether a text item should be redacted.
 * Uses area-based coverage: only redacts if >50% of text is covered by a redaction box.
 * This allows for precise word-level redaction instead of entire lines.
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

  const pdfX = textItem.transform[4];
  const pdfY = textItem.transform[5];
  const pdfWidth = textItem.width;
  const pdfHeight = textItem.height;

  const [vx1, vy1] = viewport.convertToViewportPoint(pdfX, pdfY);
  const [vx2, vy2] = viewport.convertToViewportPoint(
    pdfX + pdfWidth,
    pdfY + pdfHeight
  );

  const textX = Math.min(vx1, vx2);
  const textY = Math.min(vy1, vy2);
  const textWidth = Math.abs(vx2 - vx1);
  const textHeight = Math.abs(vy2 - vy1);

  const textRight = textX + textWidth;
  const textBottom = textY + textHeight;
  const textArea = textWidth * textHeight;

  for (const box of pageBoxes) {
    const boxRight = box.x + box.width;
    const boxBottom = box.y + box.height;

    // Calculate intersection area
    const intersectLeft = Math.max(textX, box.x);
    const intersectTop = Math.max(textY, box.y);
    const intersectRight = Math.min(textRight, boxRight);
    const intersectBottom = Math.min(textBottom, boxBottom);

    // Check if there's an intersection
    if (intersectLeft < intersectRight && intersectTop < intersectBottom) {
      const intersectWidth = intersectRight - intersectLeft;
      const intersectHeight = intersectBottom - intersectTop;
      const intersectArea = intersectWidth * intersectHeight;

      // Redact if more than 50% of the text is covered
      const coverageRatio = intersectArea / textArea;
      if (coverageRatio > 0.5) {
        return true;
      }
    }
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

/**
 * Extracts ONLY the redacted text from the PDF
 */
export async function extractRedactedText(
  file: File,
  redactionBoxes: RedactionBox[] = []
): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const redactedTexts: string[] = [];

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const scale = 1;
    const viewport = page.getViewport({ scale });
    const textContent = await page.getTextContent();

    // Filter to get ONLY redacted text items
    const redactedItems = textContent.items.filter((item: any) => {
      return (
        item.str?.trim() && isTextRedacted(item, redactionBoxes, i, viewport)
      );
    });

    const redactedText = redactedItems.map((item: any) => item.str).join(" ");
    if (redactedText.trim()) {
      redactedTexts.push(redactedText);
    }
  }

  return redactedTexts.join("\n");
}