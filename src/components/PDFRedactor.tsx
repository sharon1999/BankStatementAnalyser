import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import { RedactionBox } from "../types/transaction";
import { motion } from "framer-motion";
import { Eraser, Check } from "lucide-react";

interface PDFRedactorProps {
  file: File;
  onComplete: (redactionBoxes: RedactionBox[]) => void;
  onCancel: () => void;
}

export default function PDFRedactor({
  file,
  onComplete,
  onCancel,
}: PDFRedactorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [redactionBoxes, setRedactionBoxes] = useState<RedactionBox[]>([]);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPos, setStartPos] = useState({ x: 0, y: 0 });
  const [pdfDoc, setPdfDoc] = useState<any>(null);

  useEffect(() => {
    loadPDF();
  }, [file]);

  useEffect(() => {
    if (pdfDoc) {
      renderPage(currentPage);
    }
  }, [currentPage, pdfDoc, redactionBoxes]);

  const loadPDF = async () => {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    setPdfDoc(pdf);
    setTotalPages(pdf.numPages);
  };

  const renderPage = async (pageNum: number) => {
    if (!pdfDoc || !canvasRef.current) return;

    const page = await pdfDoc.getPage(pageNum);
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d")!;

    const viewport = page.getViewport({ scale: 1 });

    const outputScale = window.devicePixelRatio || 1;
    canvas.width = Math.floor(viewport.width * outputScale);
    canvas.height = Math.floor(viewport.height * outputScale);
    canvas.style.width = Math.floor(viewport.width) + "px";
    canvas.style.height = Math.floor(viewport.height) + "px";

    const transform =
      outputScale !== 1 ? [outputScale, 0, 0, outputScale, 0, 0] : undefined;

    await page.render({
      canvasContext: ctx,
      viewport: viewport,
      transform: transform,
    }).promise;

    const pageBoxes = redactionBoxes.filter(
      (box) => box.pageNumber === pageNum
    );
    pageBoxes.forEach((box) => {
      ctx.fillStyle = "#000000";
      ctx.fillRect(
        box.x * outputScale,
        box.y * outputScale,
        box.width * outputScale,
        box.height * outputScale
      );
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    setStartPos({ x, y });
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing || !canvasRef.current) return;

    const rect = canvasRef.current.getBoundingClientRect();
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    renderPage(currentPage).then(() => {
      const ctx = canvasRef.current!.getContext("2d")!;
      const outputScale = window.devicePixelRatio || 1;
      ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
      ctx.fillRect(startPos.x, startPos.y, x - startPos.x, y - startPos.y);
    });
  };

  const handleMouseUp = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const rect = canvasRef.current!.getBoundingClientRect();
    const scaleX = canvasRef.current!.width / rect.width;
    const scaleY = canvasRef.current!.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;

    const width = x - startPos.x;
    const height = y - startPos.y;

    const outputScale = window.devicePixelRatio || 1;

    if (Math.abs(width) > 10 && Math.abs(height) > 10) {
      setRedactionBoxes([
        ...redactionBoxes,
        {
          x: Math.min(startPos.x, x) / outputScale,
          y: Math.min(startPos.y, y) / outputScale,
          width: Math.abs(width) / outputScale,
          height: Math.abs(height) / outputScale,
          pageNumber: currentPage,
        },
      ]);
    }

    setIsDrawing(false);
  };

  const handleComplete = () => {
    onComplete(redactionBoxes);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center gap-6 p-8"
    >
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">
          Redact Sensitive Information
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Click and drag to cover sensitive data (names, account numbers, etc.)
        </p>
      </div>

      <div className="relative border-2 border-gray-300 dark:border-gray-700 rounded-lg overflow-hidden shadow-xl">
        <canvas
          ref={canvasRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className="cursor-crosshair"
        />
      </div>

      <div className="flex items-center gap-4">
        <button
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50"
        >
          Previous
        </button>
        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Page {currentPage} of {totalPages}
        </span>
        <button
          onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg disabled:opacity-50"
        >
          Next
        </button>
      </div>

      <div className="flex gap-4">
        <button
          onClick={() => setRedactionBoxes(redactionBoxes.slice(0, -1))}
          disabled={redactionBoxes.length === 0}
          className="flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          <Eraser size={20} />
          Undo Last
        </button>

        <button
          onClick={onCancel}
          className="px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          Cancel
        </button>

        <button
          onClick={handleComplete}
          className="flex items-center gap-2 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
        >
          <Check size={20} />
          Continue to Analysis
        </button>
      </div>
    </motion.div>
  );
}
