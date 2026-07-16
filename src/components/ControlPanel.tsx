import React from 'react';
import { Calendar, Filter, MapPin, Dumbbell, Palette } from 'lucide-react';
import { MUNICIPALITIES } from '../data';
import { CoverageSource, ServiceCategory } from '../types';

interface ControlPanelProps {
  periodOption: 'jan_may' | 'jan_jun';
  setPeriodOption: (val: 'jan_may' | 'jan_jun') => void;
  selectedMunicipality: string;
  setSelectedMunicipality: (val: string) => void;
  coverageSource: CoverageSource;
  setCoverageSource: (val: CoverageSource) => void;
  serviceCategory: ServiceCategory;
  setServiceCategory: (val: ServiceCategory) => void;
}

export default function ControlPanel({
  periodOption,
  setPeriodOption,
  selectedMunicipality,
  setSelectedMunicipality,
  coverageSource,
  setCoverageSource,
  serviceCategory,
  setServiceCategory,
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

        {/* Service Category Filter */}
        <div className="space-y-1.5 pt-2 border-t border-slate-200/50">
          <label className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            <Dumbbell className="h-3.5 w-3.5 text-slate-400" />
            Servicios Facturados
          </label>
          <div className="flex flex-col gap-1 rounded-lg border border-slate-200 p-1 bg-white">
            <button
              id="filter-category-all"
              onClick={() => setServiceCategory('all')}
              className={`w-full rounded-md px-2.5 py-1.5 text-left text-xs font-semibold transition-all cursor-pointer ${
                serviceCategory === 'all'
                  ? 'bg-slate-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Todos (Deporte + Recreación)
            </button>
            <button
              id="filter-category-deporte"
              onClick={() => setServiceCategory('deporte')}
              className={`w-full rounded-md px-2.5 py-1.5 text-left text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                serviceCategory === 'deporte'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Dumbbell className="h-3 w-3 shrink-0" />
              Solo Deporte
            </button>
            <button
              id="filter-category-recreacion"
              onClick={() => setServiceCategory('recreacion')}
              className={`w-full rounded-md px-2.5 py-1.5 text-left text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                serviceCategory === 'recreacion'
                  ? 'bg-violet-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Palette className="h-3 w-3 shrink-0" />
              Solo Recreación
            </button>
          </div>
        </div>

        {/* Coverage Source Selector */}
        <div className="space-y-1.5 pt-2 border-t border-slate-200/50">
          <label className="flex items-center gap-1 text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            <Filter className="h-3.5 w-3.5 text-slate-400" />
            Fuente de Cobertura
          </label>
          <div className="flex flex-col gap-1 rounded-lg border border-slate-200 p-1 bg-white">
            <button
              onClick={() => setCoverageSource('servicios_facturados')}
              className={`w-full rounded-md px-2.5 py-1.5 text-left text-xs font-semibold transition-all cursor-pointer ${
                coverageSource === 'servicios_facturados'
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Servicios Facturados
            </button>
            <button
              onClick={() => setCoverageSource('informacion_super')}
              className={`w-full rounded-md px-2.5 py-1.5 text-left text-xs font-semibold transition-all cursor-pointer ${
                coverageSource === 'informacion_super'
                  ? 'bg-emerald-600 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Información Súper
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
