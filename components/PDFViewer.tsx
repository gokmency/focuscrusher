import React, { useState, useEffect, useRef } from 'react';
import { Document, Page, pdfjs } from 'react-pdf';
import { useStore } from '../store/useStore';
import { toBionicHTML } from '../utils/bionic';
import { BrutalButton, ProgressBar } from './BrutalistUI';
import { explainLikeABro } from '../services/geminiService';

// Initialize PDF worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PDFViewerProps {
  onSelection?: (text: string) => void;
}

const PDFViewer: React.FC<PDFViewerProps> = ({ onSelection }) => {
  const { 
    file, numPages, setNumPages, currentPage, setCurrentPage, 
    scale, setScale, isTunnelMode, isBionic,
    setAiResponse, setAiLoading
  } = useStore();
  
  // Ref for the overlay to avoid re-renders on mousemove
  const overlayRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const rafRef = useRef<number>();

  // Selection Tooltip State
  const [tooltipPos, setTooltipPos] = useState<{x: number, y: number} | null>(null);
  const [selectedTextLocal, setSelectedTextLocal] = useState('');

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  // Keyboard Navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default scrolling for arrow keys if they are used for navigation
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' '].includes(e.key)) {
         e.preventDefault();
      }

      if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'ArrowDown') {
        if (currentPage < numPages) setCurrentPage(currentPage + 1);
      } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        if (currentPage > 1) setCurrentPage(currentPage - 1);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentPage, numPages, setCurrentPage]);

  // Handle Mouse Move for Tunnel Vision (Optimized)
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isTunnelMode || !overlayRef.current || !containerRef.current) return;
    
    // Use requestAnimationFrame for smooth UI updates
    if (rafRef.current) cancelAnimationFrame(rafRef.current);

    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    rafRef.current = requestAnimationFrame(() => {
        if (overlayRef.current) {
            // Update the CSS variables or background directly
            overlayRef.current.style.background = `radial-gradient(circle 180px at ${x}px ${y}px, transparent 0%, rgba(0,0,0,0.98) 100%)`;
            
            // Move the crosshair elements (requires them to be reachable refs or children we can query)
            // Simpler approach: Update CSS variables on the container
            overlayRef.current.style.setProperty('--cursor-x', `${x}px`);
            overlayRef.current.style.setProperty('--cursor-y', `${y}px`);
        }
    });
  };

  // Handle Text Selection & Tooltip
  useEffect(() => {
    const handleSelection = () => {
      const selection = window.getSelection();
      
      // Strict check: if selection is empty, clear everything
      if (!selection || selection.toString().trim().length === 0) {
        // Only clear if we really have no selection (sometimes click-drag is messy)
        setTooltipPos(null);
        setSelectedTextLocal('');
        if (onSelection) onSelection('');
        return;
      }

      const text = selection.toString();
      setSelectedTextLocal(text);
      if (onSelection) onSelection(text);

      // Calculate position for tooltip
      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        const containerRect = containerRef.current?.getBoundingClientRect();

        if (containerRect) {
            // Calculate center of selection
            const centerX = rect.left + (rect.width / 2) - containerRect.left;
            const topY = rect.top - containerRect.top;
            
            // Default to showing above, unless too close to top
            let finalY = topY - 10;
            if (finalY < 50) {
               finalY = rect.bottom - containerRect.top + 50; // Show below if cramped
            }

            setTooltipPos({
                x: centerX,
                y: finalY
            });
        }
      } catch (e) {
        console.error("Selection rect calculation failed", e);
      }
    };

    // Use mouseup on the document to catch selection end
    const docContainer = containerRef.current;
    if(docContainer) {
        docContainer.addEventListener('mouseup', handleSelection);
        // Also handle keyup for keyboard selection
        docContainer.addEventListener('keyup', handleSelection);
    }
    
    return () => {
        if(docContainer) {
            docContainer.removeEventListener('mouseup', handleSelection);
            docContainer.removeEventListener('keyup', handleSelection);
        }
    };
  }, [onSelection]);

  // Handle "Quick Explain" click
  const handleQuickExplain = async (e: React.MouseEvent) => {
      // PREVENT DEFAULT is vital here to stop the browser from deselecting text
      e.preventDefault();
      e.stopPropagation();
      
      console.log("Quick Explain Clicked");

      // Prefer cached local state, fallback to current selection
      const textToExplain = selectedTextLocal || window.getSelection()?.toString();

      if(!textToExplain) {
          console.warn("No text selected for explanation");
          return;
      }

      setAiLoading(true);
      const res = await explainLikeABro(textToExplain);
      setAiResponse(res);
      setAiLoading(false);
      
      // Cleanup UI
      window.getSelection()?.removeAllRanges();
      setTooltipPos(null);
  };

  // Process Bionic Text
  const handleTextLayerRender = () => {
    if (!isBionic || !containerRef.current) return;

    setTimeout(() => {
        if (!containerRef.current) return;
        const textLayer = containerRef.current.querySelector('.react-pdf__Page__textContent');
        if (textLayer) {
            const spans = textLayer.querySelectorAll('span');
            spans.forEach((span) => {
                if (span.getAttribute('data-bionic') === 'true') return;
                const originalText = span.textContent || '';
                if (originalText.trim().length > 0) {
                    try {
                        span.innerHTML = toBionicHTML(originalText);
                        span.setAttribute('data-bionic', 'true');
                    } catch (e) {
                        console.error("Bionic error", e);
                    }
                }
            });
        }
    }, 50);
  };

  if (!file) return null;

  return (
    <div 
      className="relative w-full flex flex-col items-center bg-[#f0f0f0] min-h-[80vh] border-x-4 border-black"
      ref={containerRef}
      onMouseMove={handleMouseMove}
    >
      {/* Top Bar */}
      <div className="sticky top-0 z-20 w-full bg-black text-white p-2 border-b-4 border-white flex flex-col gap-2 shadow-xl">
        <div className="flex justify-between items-center flex-wrap gap-2">
            <div className="flex gap-2">
            <BrutalButton variant="black" onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage <= 1}>
                &lt;
            </BrutalButton>
            <div className="flex items-center font-mono text-lg md:text-xl px-2 md:px-4 bg-white text-black border-2 border-white min-w-[100px] justify-center">
                {currentPage} / {numPages}
            </div>
            <BrutalButton variant="black" onClick={() => setCurrentPage(Math.min(numPages, currentPage + 1))} disabled={currentPage >= numPages}>
                &gt;
            </BrutalButton>
            </div>
            <div className="flex gap-2">
            <BrutalButton variant="black" onClick={() => setScale(Math.max(0.5, scale - 0.2))}>-</BrutalButton>
            <BrutalButton variant="black" onClick={() => setScale(Math.min(3.0, scale + 0.2))}>+</BrutalButton>
            </div>
        </div>
        <ProgressBar current={currentPage} total={numPages} />
      </div>

      {/* PDF Document */}
      <div className="p-4 md:p-8 relative w-full flex justify-center min-h-[500px]">
        <div className={`relative border-4 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] bg-white transition-all duration-300 ${isBionic ? 'bionic-active' : ''}`}>
          <Document
            file={file}
            onLoadSuccess={onDocumentLoadSuccess}
            loading={
               <div className="p-12 text-center font-black animate-pulse text-2xl">
                  INITIALIZING CORE...
               </div>
            }
            error={
                <div className="p-12 text-center font-bold text-red-600">
                    PDF FAILED TO LOAD
                </div>
            }
          >
            <Page
              key={`page_${currentPage}_${scale}_${isBionic}`}
              pageNumber={currentPage}
              scale={scale}
              renderTextLayer={true}
              renderAnnotationLayer={false}
              onRenderTextLayerSuccess={handleTextLayerRender}
              loading={
                <div className="h-[800px] w-[600px] flex items-center justify-center bg-gray-100">
                   <span className="font-mono animate-bounce">RENDERING...</span>
                </div>
              }
            />
          </Document>
          
          {/* Contextual Tooltip */}
          {tooltipPos && (
             <div 
               className="absolute z-30 animate-in fade-in zoom-in duration-200"
               style={{ 
                   left: tooltipPos.x, 
                   top: tooltipPos.y,
                   transform: 'translate(-50%, -100%)'
               }}
               // CRITICAL: Prevent mousedown from propagating or default behavior (clearing selection)
               onMouseDown={(e) => {
                 e.preventDefault(); 
                 e.stopPropagation();
               }}
               onMouseUp={(e) => {
                 e.preventDefault();
                 e.stopPropagation();
               }}
               onClick={(e) => {
                 e.stopPropagation();
               }}
             >
                 <div className="relative group">
                    <BrutalButton 
                        variant="accent" 
                        onClick={handleQuickExplain}
                        className="flex items-center gap-2 whitespace-nowrap shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-[10px_10px_0px_0px_rgba(0,0,0,1)] text-xs md:text-sm py-2 md:py-3 border-4 border-black bg-[#CCFF00]"
                    >
                        <span className="font-black text-lg">?</span> 
                        <span className="font-bold">WTF DOES THIS MEAN</span>
                    </BrutalButton>
                 </div>
                 {/* Little triangle arrow pointing down to text */}
                 <div className="w-0 h-0 border-l-[10px] border-l-transparent border-r-[10px] border-r-transparent border-t-[10px] border-t-black mx-auto mt-[-4px]"></div>
             </div>
          )}
        </div>

        {/* Tunnel Vision Overlay (DOM Manipulated) */}
        <div 
            ref={overlayRef}
            className={`absolute inset-0 pointer-events-none z-10 overflow-hidden transition-opacity duration-300 ${isTunnelMode ? 'opacity-100' : 'opacity-0'}`}
            style={{
                '--cursor-x': '-100px',
                '--cursor-y': '-100px',
            } as React.CSSProperties}
        >
             {/* Note: The background gradient is handled via JS for performance */}
             
             {/* Crosshair Elements controlled by CSS Variables */}
             <div 
               className="absolute w-8 h-8 border-2 border-[#CCFF00] rounded-full -translate-x-1/2 -translate-y-1/2 pointer-events-none mix-blend-difference will-change-transform"
               style={{ left: 'var(--cursor-x)', top: 'var(--cursor-y)' }}
             />
             <div 
               className="absolute w-[2px] h-4 bg-[#CCFF00] -translate-x-1/2 -translate-y-1/2 pointer-events-none will-change-transform"
               style={{ left: 'var(--cursor-x)', top: 'calc(var(--cursor-y) - 12px)' }}
             />
             <div 
               className="absolute w-[2px] h-4 bg-[#CCFF00] -translate-x-1/2 -translate-y-1/2 pointer-events-none will-change-transform"
               style={{ left: 'var(--cursor-x)', top: 'calc(var(--cursor-y) + 12px)' }}
             />
             <div 
               className="absolute w-4 h-[2px] bg-[#CCFF00] -translate-x-1/2 -translate-y-1/2 pointer-events-none will-change-transform"
               style={{ left: 'calc(var(--cursor-x) - 12px)', top: 'var(--cursor-y)' }}
             />
             <div 
               className="absolute w-4 h-[2px] bg-[#CCFF00] -translate-x-1/2 -translate-y-1/2 pointer-events-none will-change-transform"
               style={{ left: 'calc(var(--cursor-x) + 12px)', top: 'var(--cursor-y)' }}
             />
        </div>
      </div>
    </div>
  );
};

export default PDFViewer;