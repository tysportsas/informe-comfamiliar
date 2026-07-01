import { useState, useEffect } from 'react';

/**
 * Hook that detects when the browser is in print mode.
 * Recharts' ResponsiveContainer fails during printing because it can't calculate
 * the parent's dimensions while the print dialog is active.
 * This hook listens to browser print events and returns a flag so charts can
 * switch to explicit pixel dimensions during print.
 */
export function usePrintMode(): boolean {
  const [isPrinting, setIsPrinting] = useState(false);

  useEffect(() => {
    const handleBeforePrint = () => setIsPrinting(true);
    const handleAfterPrint = () => setIsPrinting(false);

    // Modern browsers (Chrome, Edge, Firefox)
    window.addEventListener('beforeprint', handleBeforePrint);
    window.addEventListener('afterprint', handleAfterPrint);

    // Older Safari fallback using matchMedia
    const mql = window.matchMedia('print');
    const handleMQLChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsPrinting(true);
      } else {
        setIsPrinting(false);
      }
    };
    mql.addEventListener('change', handleMQLChange);

    return () => {
      window.removeEventListener('beforeprint', handleBeforePrint);
      window.removeEventListener('afterprint', handleAfterPrint);
      mql.removeEventListener('change', handleMQLChange);
    };
  }, []);

  return isPrinting;
}
