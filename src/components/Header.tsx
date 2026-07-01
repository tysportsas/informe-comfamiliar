import React, { useState } from 'react';
import { Activity, Printer, RotateCcw, Download, Loader2 } from 'lucide-react';
import { exportDashboardToWord } from '../utils/wordExport';

interface HeaderProps {
  onReset: () => void;
  selectedPeriod: string;
  onDownloadCSV: () => void;
}

export default function Header({ onReset, selectedPeriod, onDownloadCSV }: HeaderProps) {
  const [isExportingWord, setIsExportingWord] = useState(false);

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadWord = async () => {
    setIsExportingWord(true);
    await exportDashboardToWord();
    setIsExportingWord(false);
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0 no-print overflow-x-auto">
      <div className="flex items-center gap-3 min-w-max">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-600 text-white shadow-sm">
          <Activity className="h-5 w-5" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-slate-800 font-display">
            Informe de Gestión y Cobertura &bull; Recreación y Deportes
          </h1>
          <p className="text-[11px] text-slate-400 font-medium">
            Comfamiliar Risaralda &bull; {selectedPeriod}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2 min-w-max">
        <button
          onClick={onReset}
          className="px-3 py-1.5 border border-slate-200 text-xs font-semibold text-slate-600 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Restaurar parámetros por defecto"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Restaurar</span>
        </button>
        <button
          onClick={onDownloadCSV}
          className="px-3 py-1.5 border border-slate-200 text-xs font-semibold text-slate-600 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer"
          title="Descargar datos en formato CSV para Excel"
        >
          <Download className="h-3.5 w-3.5 text-slate-500" />
          <span className="hidden sm:inline">CSV</span>
        </button>
        <button
          onClick={handleDownloadWord}
          disabled={isExportingWord}
          className="px-3 py-1.5 border border-slate-200 text-xs font-semibold text-slate-600 rounded-lg hover:bg-slate-50 transition-colors flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
          title="Descargar en formato Word Profesional"
        >
          {isExportingWord ? (
            <Loader2 className="h-3.5 w-3.5 text-blue-500 animate-spin" />
          ) : (
            <Download className="h-3.5 w-3.5 text-blue-500" />
          )}
          <span className="hidden sm:inline">{isExportingWord ? 'Procesando...' : 'Word'}</span>
        </button>
        <button
          onClick={handlePrint}
          className="px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors flex items-center gap-1.5 cursor-pointer uppercase tracking-wider"
        >
          <Printer className="h-3.5 w-3.5" />
          <span>PDF</span>
        </button>
      </div>
    </header>
  );
}
