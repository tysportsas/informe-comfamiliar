import React from 'react';
import { Calendar, Filter, MapPin } from 'lucide-react';
import { MUNICIPALITIES } from '../data';

interface ControlPanelProps {
  periodOption: 'jan_may' | 'jan_jun';
  setPeriodOption: (val: 'jan_may' | 'jan_jun') => void;
  selectedMunicipality: string;
  setSelectedMunicipality: (val: string) => void;
}

export default function ControlPanel({
  periodOption,
  setPeriodOption,
  selectedMunicipality,
  setSelectedMunicipality
}: ControlPanelProps) {
  return (
    <div className="space-y-4">
      {/* Title */}
      <div className="flex items-center gap-2 px-1">
        <Filter className="h-4 w-4 text-slate-400" />
        <span className="text-xs font-bold uppercase tracking-wider text-slate-500 font-display">
          Filtros de Análisis
        </span>
      </div>

      <div className="space-y-4 rounded-xl border border-slate-150 bg-slate-50/50 p-4">
        {/* Period Selector */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            <Calendar className="h-3.5 w-3.5 text-slate-400" />
            Período de Análisis
          </label>
          <div className="flex flex-col gap-1 rounded-lg border border-slate-200 p-1 bg-white">
            <button
              onClick={() => setPeriodOption('jan_may')}
              className={`w-full rounded-md px-2.5 py-1.5 text-left text-xs font-semibold transition-all cursor-pointer ${
                periodOption === 'jan_may'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Ene - May (Período Homólogo)
            </button>
            <button
              onClick={() => setPeriodOption('jan_jun')}
              className={`w-full rounded-md px-2.5 py-1.5 text-left text-xs font-semibold transition-all cursor-pointer ${
                periodOption === 'jan_jun'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Ene - Jun (Completo 2025)
            </button>
          </div>
        </div>

        {/* Municipality Selector */}
        <div className="space-y-1.5">
          <label className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            <MapPin className="h-3.5 w-3.5 text-slate-400" />
            Municipio / Sede
          </label>
          <select
            value={selectedMunicipality}
            onChange={(e) => setSelectedMunicipality(e.target.value)}
            className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 outline-none hover:border-slate-300 focus:border-blue-500 transition-all cursor-pointer"
          >
            <option value="ALL">Todos (Consolidado)</option>
            {MUNICIPALITIES.map((mun) => (
              <option key={mun.id} value={mun.id}>
                {mun.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
