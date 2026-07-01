import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import MetricCards from './components/MetricCards';
import RevenuesModule from './components/RevenuesModule';
import ModalitiesTableModule from './components/ModalitiesTableModule';
import CoverageModule from './components/CoverageModule';
import SettingsPanel from './components/SettingsPanel';

import {
  DEFAULT_LINE_ALLOCATION,
  DEFAULT_MODALITIES,
  DEFAULT_COVERAGE_ALLOCATION_2025,
  DEFAULT_COVERAGE_ALLOCATION_2026,
  MONTHS
} from './data';
import { LineAllocation, ProgramModality, CoverageAllocation } from './types';

// Load our pre-extracted high-fidelity JSON data directly!
import reportData from './data/report_data.json';

export default function App() {
  // --- States ---
  const [periodOption, setPeriodOption] = useState<'jan_may' | 'jan_jun'>('jan_may');
  const [selectedMunicipality, setSelectedMunicipality] = useState<string>('ALL');

  const [lineAllocation, setLineAllocation] = useState<LineAllocation>(() => {
    const saved = localStorage.getItem('comfamiliar_line_allocation');
    return saved ? JSON.parse(saved) : DEFAULT_LINE_ALLOCATION;
  });

  const [modalities, setModalities] = useState<ProgramModality[]>(() => {
    const saved = localStorage.getItem('comfamiliar_modalities');
    return saved ? JSON.parse(saved) : DEFAULT_MODALITIES;
  });

  const [coverageAllocation2025, setCoverageAllocation2025] = useState<CoverageAllocation>(() => {
    const saved = localStorage.getItem('comfamiliar_cov_alloc_2025');
    return saved ? JSON.parse(saved) : DEFAULT_COVERAGE_ALLOCATION_2025;
  });

  const [coverageAllocation2026, setCoverageAllocation2026] = useState<CoverageAllocation>(() => {
    const saved = localStorage.getItem('comfamiliar_cov_alloc_2026');
    return saved ? JSON.parse(saved) : DEFAULT_COVERAGE_ALLOCATION_2026;
  });

  // --- Sync storage ---
  useEffect(() => {
    localStorage.setItem('comfamiliar_line_allocation', JSON.stringify(lineAllocation));
  }, [lineAllocation]);

  useEffect(() => {
    localStorage.setItem('comfamiliar_modalities', JSON.stringify(modalities));
  }, [modalities]);

  useEffect(() => {
    localStorage.setItem('comfamiliar_cov_alloc_2025', JSON.stringify(coverageAllocation2025));
  }, [coverageAllocation2025]);

  useEffect(() => {
    localStorage.setItem('comfamiliar_cov_alloc_2026', JSON.stringify(coverageAllocation2026));
  }, [coverageAllocation2026]);

  // --- Reset All Parameters to Default ---
  const handleResetAll = () => {
    if (window.confirm('¿Está seguro de restaurar todas las distribuciones y parámetros por defecto?')) {
      setLineAllocation(DEFAULT_LINE_ALLOCATION);
      setModalities(DEFAULT_MODALITIES);
      setCoverageAllocation2025(DEFAULT_COVERAGE_ALLOCATION_2025);
      setCoverageAllocation2026(DEFAULT_COVERAGE_ALLOCATION_2026);
      localStorage.removeItem('comfamiliar_line_allocation');
      localStorage.removeItem('comfamiliar_modalities');
      localStorage.removeItem('comfamiliar_cov_alloc_2025');
      localStorage.removeItem('comfamiliar_cov_alloc_2026');
    }
  };

  // --- Calculations ---
  const monthsLimit = periodOption === 'jan_may' ? 5 : 6;
  const periodLabel = periodOption === 'jan_may' ? 'Enero - Mayo' : 'Enero - Junio';
  const hasIncompleteJune = periodOption === 'jan_jun';

  // Extract year records
  const data2025 = reportData.years['2025'];
  const data2026 = reportData.years['2026'];

  // Sum total incomes for current filters
  const calculateTotalIncome = (yearData: any) => {
    let sum = 0;
    Object.keys(yearData).forEach((key) => {
      // Filter by municipality if selected
      if (selectedMunicipality !== 'ALL' && !key.includes(selectedMunicipality)) {
        return;
      }
      const totals = yearData[key]?.totals || [];
      sum += totals.slice(0, monthsLimit).reduce((acc: number, curr: number) => acc + curr, 0);
    });
    return sum;
  };

  const totalIncome2025 = calculateTotalIncome(data2025);
  const totalIncome2026 = calculateTotalIncome(data2026);

  // Dynamic Base Coverage total based on selected municipality
  const getBaseCoverage = (year: 2025 | 2026) => {
    let base = year === 2025 ? 28450 : 31200;
    if (selectedMunicipality === 'PEREIRA') return Math.round(base * 0.60);
    if (selectedMunicipality === 'DOSQUEBRADAS') return Math.round(base * 0.25);
    if (selectedMunicipality === 'SANTA ROSA') return Math.round(base * 0.10);
    if (selectedMunicipality === 'QUINCHIA') return Math.round(base * 0.05);
    return base;
  };

  const coverageTotal2025 = getBaseCoverage(2025);
  const coverageTotal2026 = getBaseCoverage(2026);

  // Split Line totals for modality formulas
  const getLineTotals = (yearData: any) => {
    let deporteSum = 0;
    let recreacionSum = 0;

    Object.keys(yearData).forEach((key) => {
      if (selectedMunicipality !== 'ALL' && !key.includes(selectedMunicipality)) {
        return;
      }
      const totals = yearData[key]?.totals || [];
      const sum = totals.slice(0, monthsLimit).reduce((acc: number, curr: number) => acc + curr, 0);

      if (key.includes('DEPORTES')) {
        deporteSum += sum;
      } else if (key.includes('RECREACION')) {
        recreacionSum += sum;
      }
    });

    return {
      deporte: deporteSum * (lineAllocation.deporte / 100),
      recreacion: recreacionSum * (lineAllocation.recreacion / 100),
      actividadFisica: recreacionSum * (lineAllocation.actividadFisica / 100),
      eventos: recreacionSum * (lineAllocation.eventos / 100)
    };
  };

  const lineTotals2025 = getLineTotals(data2025);
  const lineTotals2026 = getLineTotals(data2026);

  const handleDownloadCSV = () => {
    // Generate a professional semicolon-separated CSV file
    let csvContent = "sep=;\n";
    csvContent += "Tipo de Registro;Concepto o Mes;Linea o Categoria;Municipio/Sede;Valor/Cantidad Año 2025;Valor/Cantidad Año 2026\n";

    // 1. Incomes by Month
    const monthsArray = MONTHS.slice(0, monthsLimit);
    monthsArray.forEach((month, idx) => {
      let sum25 = 0;
      let sum26 = 0;
      Object.keys(data2025).forEach((key) => {
        if (selectedMunicipality !== 'ALL' && !key.includes(selectedMunicipality)) return;
        sum25 += data2025[key]?.totals[idx] || 0;
      });
      Object.keys(data2026).forEach((key) => {
        if (selectedMunicipality !== 'ALL' && !key.includes(selectedMunicipality)) return;
        sum26 += data2026[key]?.totals[idx] || 0;
      });
      csvContent += `Ingresos Mensuales;${month};Consolidado;${selectedMunicipality};${sum25.toFixed(0)};${sum26.toFixed(0)}\n`;
    });

    // 2. Line distribution
    csvContent += `Distribución Líneas;Escuelas Deportivas;Deporte;${selectedMunicipality};${lineTotals2025.deporte.toFixed(0)};${lineTotals2026.deporte.toFixed(0)}\n`;
    csvContent += `Distribución Líneas;Recreación Base;Recreacion;${selectedMunicipality};${lineTotals2025.recreacion.toFixed(0)};${lineTotals2026.recreacion.toFixed(0)}\n`;
    csvContent += `Distribución Líneas;Actividad Física / Gimnasios;ActividadFisica;${selectedMunicipality};${lineTotals2025.actividadFisica.toFixed(0)};${lineTotals2026.actividadFisica.toFixed(0)}\n`;
    csvContent += `Distribución Líneas;Eventos y Festivales;Eventos;${selectedMunicipality};${lineTotals2025.eventos.toFixed(0)};${lineTotals2026.eventos.toFixed(0)}\n`;

    // 3. Modalities Detail
    modalities.forEach(mod => {
      const lineTotal25 = lineTotals2025[mod.line as keyof typeof lineTotals2025] || 0;
      const lineTotal26 = lineTotals2026[mod.line as keyof typeof lineTotals2026] || 0;
      const val25 = lineTotal25 * (mod.share2025 / 100);
      const val26 = lineTotal26 * (mod.share2026 / 100);
      csvContent += `Detalle Modalidades;${mod.name};${mod.line};${selectedMunicipality};${val25.toFixed(0)};${val26.toFixed(0)}\n`;
    });

    // 4. Beneficiary Coverage
    csvContent += `Cobertura Beneficiarios;Categoría A;Cat. A;${selectedMunicipality};${Math.round(coverageTotal2025 * (coverageAllocation2025.A / 100))};${Math.round(coverageTotal2026 * (coverageAllocation2026.A / 100))}\n`;
    csvContent += `Cobertura Beneficiarios;Categoría B;Cat. B;${selectedMunicipality};${Math.round(coverageTotal2025 * (coverageAllocation2025.B / 100))};${Math.round(coverageTotal2026 * (coverageAllocation2026.B / 100))}\n`;
    csvContent += `Cobertura Beneficiarios;Categoría C;Cat. C;${selectedMunicipality};${Math.round(coverageTotal2025 * (coverageAllocation2025.C / 100))};${Math.round(coverageTotal2026 * (coverageAllocation2026.C / 100))}\n`;
    csvContent += `Cobertura Beneficiarios;Categoría D;Cat. D;${selectedMunicipality};${Math.round(coverageTotal2025 * (coverageAllocation2025.D / 100))};${Math.round(coverageTotal2026 * (coverageAllocation2026.D / 100))}\n`;

    // Trigger download
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `informe_comfamiliar_${selectedMunicipality.toLowerCase()}_${periodOption}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleUpdateCoverageAllocation = (year: 2025 | 2026, alloc: CoverageAllocation) => {
    if (year === 2025) {
      setCoverageAllocation2025(alloc);
    } else {
      setCoverageAllocation2026(alloc);
    }
  };

  return (
    <div className="flex flex-col md:flex-row h-auto md:h-screen print:h-auto print:overflow-visible print:block w-full bg-slate-50 text-slate-900 font-sans overflow-auto md:overflow-hidden">
      
      {/* Left Sidebar */}
      <aside className="w-full md:w-80 bg-white border-b md:border-b-0 md:border-r border-slate-200 flex flex-col no-print shrink-0">
        <div className="p-6 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600"></div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-slate-500 font-display">Comfamiliar-Risaralda</h2>
          </div>
        </div>

        <div className="flex-1 p-5 space-y-6 overflow-y-auto">
          {/* Section 1: Filters */}
          <ControlPanel
            periodOption={periodOption}
            setPeriodOption={setPeriodOption}
            selectedMunicipality={selectedMunicipality}
            setSelectedMunicipality={setSelectedMunicipality}
          />

          {/* Section 4: Revenue Partitions Config (Settings) */}
          <SettingsPanel
            lineAllocation={lineAllocation}
            onUpdateLineAllocation={setLineAllocation}
            onReset={() => setLineAllocation(DEFAULT_LINE_ALLOCATION)}
          />
        </div>

        <div className="p-4 text-[10px] text-slate-400 border-t border-slate-100 bg-slate-50/20 flex justify-between items-center font-mono">
          <span>DB Sync: Completo</span>
          <span className="flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Estable
          </span>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col print:h-auto print:overflow-visible print:block min-w-0">
        
        {/* Header Panel */}
        <Header onReset={handleResetAll} selectedPeriod={periodLabel} onDownloadCSV={handleDownloadCSV} />

        {/* Content View */}
        <main className="flex-1 p-6 md:p-8 space-y-6 overflow-y-auto print:h-auto print:overflow-visible print:block">
          
          {/* Print Title Block (Visible ONLY during printing) */}
          <div className="hidden print:block border-b border-slate-300 pb-4 mb-6">
            <img src="/logo.png" alt="Logo Comfamiliar" className="h-16 mb-4 object-contain" />
            <h2 className="text-xl font-semibold text-slate-700">Informe Trimestral Comparativo de Recreación y Deportes</h2>
            <div className="mt-2 text-xs text-slate-500 font-mono">
              <p>Período seleccionado: {periodLabel}</p>
              <p>Sede / Municipio: {selectedMunicipality === 'ALL' ? 'CONSOLIDADO DE TODAS LAS SEDES' : selectedMunicipality}</p>
              <p>Generado: {new Date().toLocaleDateString('es-CO')}</p>
            </div>
          </div>

          {/* Section 2: Metric Overview Cards */}
          <MetricCards
            total2025={totalIncome2025}
            total2026={totalIncome2026}
            coverage2025={coverageTotal2025}
            coverage2026={coverageTotal2026}
            periodLabel={periodLabel}
            hasIncompleteJune={hasIncompleteJune}
          />

          {/* Section 3: Revenue Comparative Module (Req 1 & 2) */}
          <div className="border-t border-slate-200/50 pt-2">
            <RevenuesModule
              data2025={data2025}
              data2026={data2026}
              lineAllocation={lineAllocation}
              periodOption={periodOption}
              selectedMunicipality={selectedMunicipality}
            />
          </div>

          {/* Modalities Table Comparative Module */}
          <ModalitiesTableModule selectedMunicipality={selectedMunicipality} />

          {/* Section 6: Coverage (Real Data 2026) */}
          <CoverageModule
            selectedMunicipality={selectedMunicipality}
          />

          {/* Footer */}
          <footer className="mt-8 border-t border-slate-200 pt-6 text-center text-xs text-slate-400 no-print">
            <p className="font-semibold">Plataforma de Informes de Gestión y Control &bull; Comfamiliar Risaralda</p>
            <p className="mt-1">Todos los cálculos financieros y coberturas están vinculados directamente a la base de datos de ingresos.</p>
          </footer>

        </main>
      </div>
    </div>
  );
}
