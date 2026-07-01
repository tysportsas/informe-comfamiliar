import React from 'react';
import { Settings } from 'lucide-react';
import { LineAllocation } from '../types';

interface SettingsPanelProps {
  lineAllocation: LineAllocation;
  onUpdateLineAllocation: (alloc: LineAllocation) => void;
  onReset: () => void;
}

export default function SettingsPanel({
  lineAllocation,
  onUpdateLineAllocation,
  onReset
}: SettingsPanelProps) {
  
  const handlePercentChange = (key: keyof LineAllocation, value: number) => {
    // We restrict the value between 0 and 100
    const clampedVal = Math.max(0, Math.min(100, value));
    
    // Create new allocation
    const newAlloc = {
      ...lineAllocation,
      [key]: clampedVal
    };

    onUpdateLineAllocation(newAlloc);
  };

  const recSum = lineAllocation.recreacion + lineAllocation.actividadFisica + lineAllocation.eventos;
  const isBalanced = recSum === 100;

  return (
    <div className="space-y-4 pt-4 border-t border-slate-100">
      
      {/* Title */}
      <div className="flex items-center justify-between px-1">
        <div className="flex items-center gap-2">
          <Settings className="h-4 w-4 text-slate-400" />
          <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-display">
            Asignación Recreación
          </span>
        </div>

        <button
          onClick={onReset}
          className="text-[10px] font-bold text-blue-600 hover:text-blue-800 transition-colors cursor-pointer"
        >
          Reset
        </button>
      </div>

      {/* Inputs */}
      <div className="space-y-3.5 rounded-xl border border-slate-150 bg-slate-50/50 p-4">
        
        {/* Recreacion */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Línea Recreación
            </span>
            <span className="text-[10px] text-slate-400">Asignación Base</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={lineAllocation.recreacion}
              onChange={(e) => handlePercentChange('recreacion', Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 font-mono"
            />
            <span className="text-xs font-bold text-slate-400">%</span>
          </div>
        </div>

        {/* Actividad Fisica */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Actividad Física
            </span>
            <span className="text-[10px] text-slate-400">Gimnasios</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={lineAllocation.actividadFisica}
              onChange={(e) => handlePercentChange('actividadFisica', Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 font-mono"
            />
            <span className="text-xs font-bold text-slate-400">%</span>
          </div>
        </div>

        {/* Eventos */}
        <div className="space-y-1">
          <div className="flex justify-between items-center">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
              Línea Eventos
            </span>
            <span className="text-[10px] text-slate-400">Festivales</span>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="number"
              value={lineAllocation.eventos}
              onChange={(e) => handlePercentChange('eventos', Number(e.target.value))}
              className="w-full rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-700 outline-none focus:border-blue-500 font-mono"
            />
            <span className="text-xs font-bold text-slate-400">%</span>
          </div>
        </div>

        {/* Validation indicator */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[10px] font-bold">
          <span className="text-slate-400">Suma Total:</span>
          <span className={isBalanced ? 'text-emerald-600' : 'text-rose-500'}>
            {recSum}% {isBalanced ? '(Equilibrado)' : '(No Suma 100%)'}
          </span>
        </div>

      </div>

    </div>
  );
}
