import { useState, useRef, useCallback, useEffect } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import HTMLFlipBook from "react-pageflip";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  BookOpen,
  Loader2,
  Download,
  ArrowLeft,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import React from "react";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

// Point pdf.js worker to the CDN
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const PDF_URL = "/G_TECH_AUDITION_RULEBOOK.pdf";

// Single page rendered by react-pdf, forwarded ref for react-pageflip
const FlipPage = React.forwardRef<
  HTMLDivElement,
  { pageNumber: number; width: number; height: number }
>(({ pageNumber, width, height }, ref) => {
  return (
    <div
      ref={ref}
      className="flex items-center justify-center bg-white overflow-hidden"
      style={{ width, height }}
    >
      <Page
        pageNumber={pageNumber}
        width={width}
        renderAnnotationLayer={false}
        renderTextLayer={false}
      />
    </div>
  );
});
FlipPage.displayName = "FlipPage";

export default function Rulebook() {
  const [numPages, setNumPages] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 640);
  const flipBookRef = useRef<any>(null);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 640);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // On mobile: full-width single page. On desktop: half-width two-page spread.
  const baseWidth = isMobile
    ? Math.min(520, window.innerWidth - 80)
    : Math.min(460, (window.innerWidth - 120) / 2);
  const pageWidth = Math.max(220, baseWidth * scale);
  const pageHeight = pageWidth * 1.414; // A4 ratio

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
    setLoading(false);
  };

  const goToPrev = useCallback(() => {
    flipBookRef.current?.pageFlip()?.flipPrev();
  }, []);

  const goToNext = useCallback(() => {
    flipBookRef.current?.pageFlip()?.flipNext();
  }, []);

  const onFlip = useCallback((e: any) => {
    setCurrentPage(e.data + 1);
  }, []);

  const zoomIn = () => setScale((s) => Math.min(s + 0.15, 1.8));
  const zoomOut = () => setScale((s) => Math.max(s - 0.15, 0.5));

  return (
    <main className="h-screen bg-[#050510] flex flex-col overflow-hidden">
      {/* Form-style header */}
      <header className="w-full flex items-center justify-between px-4 md:px-6 py-4 z-50 glass border-b border-white/10 shrink-0">
        {/* Left — Back to Home */}
        <Button
          render={<Link to="/" />}
          variant="outline"
          className="glass border-white/20 bg-black/50 hover:bg-black/80 text-white rounded-full pl-4 pr-5 md:pr-6 h-10 md:h-12 shadow-lg backdrop-blur-md group transition-all"
        >
          <ArrowLeft className="w-4 h-4 md:w-5 md:h-5 mr-2 group-hover:-translate-x-1 transition-transform" />
          <span className="hidden sm:inline">Back to Home</span>
          <span className="sm:hidden">Back</span>
        </Button>

        {/* Centre — Title */}
        <div className="flex items-center gap-2">
          <BookOpen className="w-5 h-5 text-neon-purple" />
          <span className="font-display font-bold text-white text-base md:text-lg">Rulebook</span>
          <span className="hidden md:inline text-white/30 text-xs uppercase tracking-widest ml-2">G-Tech Audition' 2026-27</span>
        </div>

        {/* Right — Page counter + Download */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:block text-white/50 text-sm">
            Page <span className="text-white font-bold">{numPages ? currentPage : "--"}</span>
            {" "}/{" "}
            <span className="text-white font-bold">{numPages || "--"}</span>
          </span>
          <a
            href={PDF_URL}
            download
            className="btn-primary px-4 md:px-6 py-2 md:py-3 rounded-full font-bold flex items-center text-sm md:text-base"
          >
            <span className="hidden sm:inline">Download</span>
            <Download className="w-4 h-4 sm:ml-2" />
          </a>
        </div>
      </header>

      {/* Flipbook area */}
      <div className="flex-1 flex items-center justify-center px-12 md:px-16 relative">
        {/* Prev button */}
        <button
          onClick={goToPrev}
          disabled={currentPage <= 1}
          className="absolute left-2 md:left-6 z-20 glass border border-white/10 rounded-full p-3 text-white/60 hover:text-white hover:border-neon-purple/50 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>

        {/* Book */}
        <Document
          file={PDF_URL}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex flex-col items-center justify-center gap-4 py-20 text-white/50">
              <Loader2 className="w-10 h-10 animate-spin text-neon-purple" />
              <p className="text-sm">
                Loading rulebook… this may take a moment
              </p>
            </div>
          }
          error={
            <div className="text-red-400 text-center py-20">
              Failed to load PDF. Make sure the file exists at
              /G_TECH_AUDITION_RULEBOOK.pdf
            </div>
          }
        >
          {!loading && numPages > 0 && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="shadow-[0_0_80px_rgba(168,85,247,0.25)] rounded-sm overflow-hidden"
            >
              {/* @ts-ignore */}
              <HTMLFlipBook
                ref={flipBookRef}
                width={pageWidth}
                height={pageHeight}
                size="fixed"
                minWidth={200}
                maxWidth={600}
                minHeight={280}
                maxHeight={848}
                drawShadow
                flippingTime={700}
                usePortrait={isMobile}
                startZIndex={10}
                autoSize={false}
                maxShadowOpacity={0.6}
                showCover
                mobileScrollSupport
                onFlip={onFlip}
                className=""
                style={{}}
                startPage={0}
                clickEventForward
                useMouseEvents
                swipeDistance={30}
                showPageCorners
                disableFlipByClick={false}
              >
                {Array.from({ length: numPages }, (_, i) => (
                  <FlipPage
                    key={i}
                    pageNumber={i + 1}
                    width={pageWidth}
                    height={pageHeight}
                  />
                ))}
              </HTMLFlipBook>
            </motion.div>
          )}
        </Document>

        {/* Next button */}
        <button
          onClick={goToNext}
          disabled={currentPage >= numPages}
          className="absolute right-2 md:right-6 z-20 glass border border-white/10 rounded-full p-3 text-white/60 hover:text-white hover:border-neon-purple/50 transition-all disabled:opacity-20 disabled:cursor-not-allowed"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      </div>

      {/* Keyboard hint */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 }}
        className="text-center text-white/25 text-xs mt-6 tracking-widest"
      >
        Click page corners or use arrows to flip · Drag to flip
      </motion.p>
    </main>
  );
}
