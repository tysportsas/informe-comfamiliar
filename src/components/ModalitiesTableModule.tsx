import React, { useState, useMemo } from 'react';
import { ArrowUpRight, ArrowDownRight, BarChart2, Table, DollarSign, Users } from 'lucide-react';
import { CoverageSource } from '../types';
import modalitiesData2026Raw from '../data/modalities_data.json';
import modalitiesData2025Raw from '../data/modalities_data_2025.json';
import tarifasRaw from '../data/tarifas_modalidades.json';
import modalityMappingRaw from '../data/modality_tariff_mapping.json';

interface ModalitiesTableModuleProps {
  selectedMunicipality: string;
  coverageSource?: CoverageSource;
  periodOption?: 'jan_may' | 'jan_jun';
  realTotal2025?: number;
  realTotal2026?: number;
}

const ALL_MONTHS = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'] as const;
type Month = typeof ALL_MONTHS[number];

type ViewMode = 'resumen' | 'mes_a_mes' | 'ingresos' | 'categorias';

const tarifas: Record<string, { t2025: Record<string, number>; t2026: Record<string, number> }> = tarifasRaw as any;
const modalityMapping: Record<string, string> = modalityMappingRaw as any;

// Category allocations (% of users per category)
const CATEGORY_ALLOC = {
  2025: { A: 45, B: 30, C: 15, D: 10 },
  2026: { A: 51, B: 32, C: 6,  D: 11 },
};

function getTarifa(modalityName: string, year: 2025 | 2026): { A: number; B: number; C: number; D: number } {
  const upper = modalityName.toUpperCase().trim();
  // Try direct match first
  let tarifaKey = upper;
  if (!tarifas[tarifaKey]) {
    // Try mapping
    const mapped = modalityMapping[modalityName] || modalityMapping[upper];
    if (mapped) {
      tarifaKey = mapped.toUpperCase();
    }
  }
  const entry = tarifas[tarifaKey];
  if (!entry) return { A: 0, B: 0, C: 0, D: 0 };
  const t = year === 2025 ? entry.t2025 : entry.t2026;
  return { A: t.A || 0, B: t.B || 0, C: t.C || 0, D: t.D || 0 };
}

function calcIngreso(totalUsers: number, year: 2025 | 2026, modalityName: string): number {
  const alloc = CATEGORY_ALLOC[year];
  const tarifa = getTarifa(modalityName, year);
  return (
    (totalUsers * alloc.A / 100) * tarifa.A +
    (totalUsers * alloc.B / 100) * tarifa.B +
    (totalUsers * alloc.C / 100) * tarifa.C +
    (totalUsers * alloc.D / 100) * tarifa.D
  );
}

export default function ModalitiesTableModule({
  selectedMunicipality,
  coverageSource = 'servicios_facturados',
  periodOption = 'jan_jun',
  realTotal2025 = 0,
  realTotal2026 = 0,
}: ModalitiesTableModuleProps) {
  const availableSedes = ['Todas', 'Pereira', 'Dosquebradas', 'Santa Rosa', 'Quinchía'];
  const [sedeFilter, setSedeFilter] = useState<string>(
    selectedMunicipality === 'ALL' ? 'Todas' : selectedMunicipality
  );
  const [viewMode, setViewMode] = useState<ViewMode>('resumen');
  const [selectedMonth, setSelectedMonth] = useState<Month>('Enero');

  const MONTHS: Month[] = periodOption === 'jan_may'
    ? ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo']
    : ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'];

  // Aggregate data from a year's raw JSON
  const aggregateData = (
    raw: any,
    linea: 'Deporte' | 'Recreación',
    sede: string
  ): Record<string, Record<string, number>> => {
    const sourceData = raw[coverageSource] || {};
    const lineaData = sourceData[linea] || {};
    const result: Record<string, Record<string, number>> = {};

    const processSede = (sedeKey: string) => {
      const sedeData = lineaData[sedeKey] || {};
      Object.keys(sedeData).forEach(modality => {
        if (!result[modality]) result[modality] = {};
        const months = sedeData[modality];
        Object.keys(months).forEach(m => {
          result[modality][m] = (result[modality][m] || 0) + (months[m] || 0);
        });
      });
    };

    if (sede === 'Todas') {
      Object.keys(lineaData).forEach(s => processSede(s));
    } else {
      processSede(sede);
    }
    return result;
  };

  const getMergedData = (linea: 'Deporte' | 'Recreación') => {
    const data2026 = aggregateData(modalitiesData2026Raw, linea, sedeFilter);
    const data2025 = aggregateData(modalitiesData2025Raw, linea, sedeFilter);
    const allModalities = new Set([...Object.keys(data2026), ...Object.keys(data2025)]);

    const rows = Array.from(allModalities).map(mod => {
      const d26 = data2026[mod] || {};
      const d25 = data2025[mod] || {};

      const monthVals2026 = MONTHS.map(m => d26[m] || 0);
      const monthVals2025 = MONTHS.map(m => d25[m] || 0);
      const total2026 = monthVals2026.reduce((a, b) => a + b, 0);
      const total2025 = monthVals2025.reduce((a, b) => a + b, 0);
      const diff = total2026 - total2025;
      const pct = total2025 > 0 ? (diff / total2025) * 100 : total2026 > 0 ? 100 : 0;

      return { name: mod, monthVals2026, monthVals2025, total2026, total2025, diff, pct };
    });

    return rows
      .filter(r => r.total2026 > 0 || r.total2025 > 0)
      .sort((a, b) => b.total2026 - a.total2026);
  };

  const deportesData = useMemo(() => getMergedData('Deporte'), [sedeFilter, coverageSource, periodOption]);
  const talleresData = useMemo(() => getMergedData('Recreación'), [sedeFilter, coverageSource, periodOption]);

  // ─── Shared helpers ──────────────────────────────────────────────────────────
  const fmtNum = (n: number) => n > 0 ? n.toLocaleString('es-CO') : '—';
  const pctColor = (n: number) => n >= 0 ? 'text-emerald-600' : 'text-rose-600';
  const pctIcon = (n: number) =>
    n >= 0
      ? <ArrowUpRight className="inline h-3 w-3" />
      : <ArrowDownRight className="inline h-3 w-3" />;

  // ─── RESUMEN TABLE ────────────────────────────────────────────────────────────
  const renderResumenTable = (
    title: string,
    accentColor: string,
    data: ReturnType<typeof getMergedData>
  ) => {
    if (data.length === 0) return <EmptyState title={title} />;

    const colTotals2026 = MONTHS.map((_, i) => data.reduce((a, r) => a + r.monthVals2026[i], 0));
    const colTotals2025 = MONTHS.map((_, i) => data.reduce((a, r) => a + r.monthVals2025[i], 0));
    const sumTotal2026 = data.reduce((a, r) => a + r.total2026, 0);
    const sumTotal2025 = data.reduce((a, r) => a + r.total2025, 0);
    const sumPct = sumTotal2025 > 0 ? ((sumTotal2026 - sumTotal2025) / sumTotal2025) * 100 : 0;

    return (
      <div className="mb-10 last:mb-0">
        <h3 className={`text-sm font-bold mb-3 ${accentColor}`}>{title}</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-center bg-slate-50">
                <th className="py-2 px-3 text-left text-slate-600 font-semibold border-r border-slate-200" rowSpan={2}>
                  Modalidad
                </th>
                <th colSpan={MONTHS.length} className="py-2 px-2 bg-blue-50 text-blue-800 font-bold border-x border-blue-200">
                  Usuarios 2026 (mes a mes)
                </th>
                <th className="py-2 px-3 bg-slate-100 text-slate-600 font-bold border-l border-slate-200" rowSpan={2}>
                  Total 2025
                </th>
                <th className="py-2 px-3 bg-blue-100 text-blue-900 font-bold border-l border-blue-200" rowSpan={2}>
                  Total 2026
                </th>
                <th className="py-2 px-3 text-slate-600 font-bold border-l border-slate-200" rowSpan={2}>
                  Var. YoY
                </th>
              </tr>
              <tr className="border-b border-slate-300 text-slate-500 bg-blue-50/40">
                {MONTHS.map(m => (
                  <th key={m} className="py-2 px-2 text-center font-semibold border-r border-blue-100 last:border-r-0">
                    {m.slice(0, 3)}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => {
                const isNew = row.total2025 === 0;
                return (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                    <td className="py-1.5 px-3 border-r border-slate-200 text-slate-700 font-medium whitespace-nowrap">{row.name}</td>
                    {row.monthVals2026.map((v, mi) => (
                      <td key={mi} className="py-1.5 px-2 text-center text-slate-600 border-r border-blue-50 bg-blue-50/20">
                        {v > 0 ? v.toLocaleString('es-CO') : <span className="text-slate-300">—</span>}
                      </td>
                    ))}
                    <td className="py-1.5 px-3 text-center text-slate-500 border-l border-slate-200 bg-slate-50/40">
                      {row.total2025 > 0 ? row.total2025.toLocaleString('es-CO') : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="py-1.5 px-3 text-center font-bold text-blue-900 border-l border-blue-100 bg-blue-50/30">
                      {row.total2026.toLocaleString('es-CO')}
                    </td>
                    <td className="py-1.5 px-3 text-center border-l border-slate-200">
                      {isNew ? (
                        <span className="text-slate-400 text-xs italic">Nuevo</span>
                      ) : (
                        <span className={`inline-flex items-center gap-0.5 font-semibold text-xs ${pctColor(row.pct)}`}>
                          {pctIcon(row.pct)}{Math.abs(row.pct).toFixed(1)}%
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              <tr className="bg-slate-100/70 border-t-2 border-slate-300 font-bold">
                <td className="py-2 px-3 border-r border-slate-300 text-slate-800">TOTAL</td>
                {colTotals2026.map((v, mi) => (
                  <td key={mi} className="py-2 px-2 text-center text-slate-800 bg-blue-100/40 border-r border-blue-100">
                    {v.toLocaleString('es-CO')}
                  </td>
                ))}
                <td className="py-2 px-3 text-center text-slate-600 border-l border-slate-300 bg-slate-100">
                  {sumTotal2025.toLocaleString('es-CO')}
                </td>
                <td className="py-2 px-3 text-center text-blue-900 border-l border-blue-200 bg-blue-100/50">
                  {sumTotal2026.toLocaleString('es-CO')}
                </td>
                <td className="py-2 px-3 text-center border-l border-slate-300">
                  <span className={`inline-flex items-center gap-0.5 font-bold ${pctColor(sumPct)}`}>
                    {pctIcon(sumPct)}{Math.abs(sumPct).toFixed(1)}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // ─── MES A MES TABLE ──────────────────────────────────────────────────────────
  const renderMesAMesTable = (
    title: string,
    accentColor: string,
    data: ReturnType<typeof getMergedData>
  ) => {
    if (data.length === 0) return <EmptyState title={title} />;

    // For each month: show 2025 | 2026 | Δ%
    // Grand totals per month
    const monthTotals = MONTHS.map((_, i) => ({
      t2025: data.reduce((a, r) => a + r.monthVals2025[i], 0),
      t2026: data.reduce((a, r) => a + r.monthVals2026[i], 0),
    }));

    const MONTH_COLORS: Record<string, { bg25: string; bg26: string; border: string; header: string }> = {
      Enero:   { bg25: 'bg-indigo-50/40', bg26: 'bg-indigo-100/60', border: 'border-indigo-100', header: 'bg-indigo-50 text-indigo-800' },
      Febrero: { bg25: 'bg-blue-50/40',   bg26: 'bg-blue-100/60',   border: 'border-blue-100',   header: 'bg-blue-50 text-blue-800' },
      Marzo:   { bg25: 'bg-teal-50/40',   bg26: 'bg-teal-100/60',   border: 'border-teal-100',   header: 'bg-teal-50 text-teal-800' },
      Abril:   { bg25: 'bg-emerald-50/40',bg26: 'bg-emerald-100/60',border: 'border-emerald-100',header: 'bg-emerald-50 text-emerald-800' },
      Mayo:    { bg25: 'bg-amber-50/40',  bg26: 'bg-amber-100/60',  border: 'border-amber-100',  header: 'bg-amber-50 text-amber-800' },
      Junio:   { bg25: 'bg-rose-50/40',   bg26: 'bg-rose-100/60',   border: 'border-rose-100',   header: 'bg-rose-50 text-rose-800' },
    };

    return (
      <div className="mb-10 last:mb-0">
        <h3 className={`text-sm font-bold mb-3 ${accentColor}`}>{title}</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              {/* Row 1: Month group headers */}
              <tr className="border-b border-slate-200 text-center bg-slate-50">
                <th className="py-2 px-3 text-left text-slate-600 font-semibold border-r border-slate-200" rowSpan={2}>
                  Modalidad
                </th>
                {MONTHS.map(m => {
                  const c = MONTH_COLORS[m];
                  return (
                    <th key={m} colSpan={3} className={`py-2 px-2 font-bold border-x border-slate-200 ${c.header}`}>
                      {m}
                    </th>
                  );
                })}
                <th className="py-2 px-3 bg-slate-100 text-slate-700 font-bold border-l border-slate-200" rowSpan={2}>
                  Total 2025
                </th>
                <th className="py-2 px-3 bg-blue-100 text-blue-900 font-bold border-l border-blue-200" rowSpan={2}>
                  Total 2026
                </th>
                <th className="py-2 px-3 text-slate-600 font-bold border-l border-slate-200" rowSpan={2}>
                  YoY
                </th>
              </tr>
              {/* Row 2: Year sub-headers per month */}
              <tr className="border-b-2 border-slate-300 text-slate-500">
                {MONTHS.map(m => {
                  const c = MONTH_COLORS[m];
                  return (
                    <React.Fragment key={m}>
                      <th className={`py-1.5 px-2 text-center font-semibold ${c.bg25} border-l border-slate-200`}>25</th>
                      <th className={`py-1.5 px-2 text-center font-semibold ${c.bg26}`}>26</th>
                      <th className={`py-1.5 px-2 text-center font-semibold bg-slate-50 border-r border-slate-200`}>Δ%</th>
                    </React.Fragment>
                  );
                })}
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => {
                const isNew = row.total2025 === 0;
                return (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                    <td className="py-1.5 px-3 border-r border-slate-200 text-slate-700 font-medium whitespace-nowrap">
                      {row.name}
                    </td>
                    {MONTHS.map((m, mi) => {
                      const v25 = row.monthVals2025[mi];
                      const v26 = row.monthVals2026[mi];
                      const dp = v25 > 0 ? ((v26 - v25) / v25) * 100 : v26 > 0 ? 100 : null;
                      const c = MONTH_COLORS[m];
                      return (
                        <React.Fragment key={m}>
                          <td className={`py-1.5 px-2 text-center text-slate-500 border-l border-slate-100 ${c.bg25}`}>
                            {fmtNum(v25)}
                          </td>
                          <td className={`py-1.5 px-2 text-center font-semibold text-slate-800 ${c.bg26}`}>
                            {fmtNum(v26)}
                          </td>
                          <td className="py-1.5 px-2 text-center bg-slate-50 border-r border-slate-200">
                            {dp === null ? (
                              <span className="text-slate-300">—</span>
                            ) : (
                              <span className={`inline-flex items-center font-semibold ${pctColor(dp)}`}>
                                {pctIcon(dp)}{Math.abs(dp).toFixed(0)}%
                              </span>
                            )}
                          </td>
                        </React.Fragment>
                      );
                    })}
                    {/* Row totals */}
                    <td className="py-1.5 px-3 text-center text-slate-500 border-l border-slate-200 bg-slate-50/40">
                      {row.total2025 > 0 ? row.total2025.toLocaleString('es-CO') : <span className="text-slate-300">—</span>}
                    </td>
                    <td className="py-1.5 px-3 text-center font-bold text-blue-900 border-l border-blue-100 bg-blue-50/30">
                      {row.total2026.toLocaleString('es-CO')}
                    </td>
                    <td className="py-1.5 px-3 text-center border-l border-slate-200">
                      {isNew ? (
                        <span className="text-slate-400 italic">Nuevo</span>
                      ) : (
                        <span className={`inline-flex items-center gap-0.5 font-bold ${pctColor(row.pct)}`}>
                          {pctIcon(row.pct)}{Math.abs(row.pct).toFixed(1)}%
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {/* TOTAL row */}
              <tr className="bg-slate-100/70 border-t-2 border-slate-300 font-bold">
                <td className="py-2 px-3 border-r border-slate-300 text-slate-800">TOTAL</td>
                {MONTHS.map((m, mi) => {
                  const { t2025, t2026 } = monthTotals[mi];
                  const dp = t2025 > 0 ? ((t2026 - t2025) / t2025) * 100 : 0;
                  const c = MONTH_COLORS[m];
                  return (
                    <React.Fragment key={m}>
                      <td className={`py-2 px-2 text-center text-slate-600 border-l border-slate-200 ${c.bg25}`}>
                        {t2025.toLocaleString('es-CO')}
                      </td>
                      <td className={`py-2 px-2 text-center text-slate-900 ${c.bg26}`}>
                        {t2026.toLocaleString('es-CO')}
                      </td>
                      <td className="py-2 px-2 text-center bg-slate-50 border-r border-slate-200">
                        <span className={`inline-flex items-center ${pctColor(dp)}`}>
                          {pctIcon(dp)}{Math.abs(dp).toFixed(0)}%
                        </span>
                      </td>
                    </React.Fragment>
                  );
                })}
                <td className="py-2 px-3 text-center text-slate-600 border-l border-slate-300 bg-slate-100">
                  {data.reduce((a, r) => a + r.total2025, 0).toLocaleString('es-CO')}
                </td>
                <td className="py-2 px-3 text-center text-blue-900 border-l border-blue-200 bg-blue-100/50">
                  {data.reduce((a, r) => a + r.total2026, 0).toLocaleString('es-CO')}
                </td>
                <td className="py-2 px-3 text-center border-l border-slate-300">
                  {(() => {
                    const t25 = data.reduce((a, r) => a + r.total2025, 0);
                    const t26 = data.reduce((a, r) => a + r.total2026, 0);
                    const p = t25 > 0 ? ((t26 - t25) / t25) * 100 : 0;
                    return <span className={`inline-flex items-center gap-0.5 font-bold ${pctColor(p)}`}>{pctIcon(p)}{Math.abs(p).toFixed(1)}%</span>;
                  })()}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };
  // ─── CATEGORIAS TABLE ────────────────────────────────────────────────────────
  const renderCategoriasTable = (
    title: string,
    accentColor: string,
    data: ReturnType<typeof getMergedData>
  ) => {
    if (data.length === 0) return <EmptyState title={title} />;

    const sumTotal2025 = data.reduce((a, r) => a + r.total2025, 0);
    const sumTotal2026 = data.reduce((a, r) => a + r.total2026, 0);

    return (
      <div className="mb-10 last:mb-0">
        <h3 className={`text-sm font-bold mb-3 ${accentColor}`}>{title}</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-center bg-slate-50">
                <th className="py-2 px-3 text-left text-slate-600 font-semibold border-r border-slate-200" rowSpan={2}>
                  Modalidad/Categoría
                </th>
                <th colSpan={5} className="py-2 px-2 bg-slate-100 text-slate-700 font-bold border-r border-slate-200">
                  2025
                </th>
                <th className="py-2 px-2 bg-slate-100 text-slate-600 font-bold border-r border-slate-200" rowSpan={2}>
                  % PART.
                </th>
                <th colSpan={5} className="py-2 px-2 bg-blue-50 text-blue-900 font-bold border-r border-blue-100">
                  2026
                </th>
                <th className="py-2 px-2 bg-blue-50 text-blue-800 font-bold border-r border-blue-100" rowSpan={2}>
                  % PART.
                </th>
              </tr>
              <tr className="border-b border-slate-300 text-slate-500 bg-slate-50">
                {/* 2025 subcols */}
                <th className="py-1 px-2 text-center font-semibold border-r border-slate-200">A</th>
                <th className="py-1 px-2 text-center font-semibold border-r border-slate-200">B</th>
                <th className="py-1 px-2 text-center font-semibold border-r border-slate-200">C</th>
                <th className="py-1 px-2 text-center font-semibold border-r border-slate-200">D</th>
                <th className="py-1 px-2 text-center font-bold border-r border-slate-200">Total</th>
                {/* 2026 subcols */}
                <th className="py-1 px-2 text-center font-semibold border-r border-blue-100 bg-blue-50/50">A</th>
                <th className="py-1 px-2 text-center font-semibold border-r border-blue-100 bg-blue-50/50">B</th>
                <th className="py-1 px-2 text-center font-semibold border-r border-blue-100 bg-blue-50/50">C</th>
                <th className="py-1 px-2 text-center font-semibold border-r border-blue-100 bg-blue-50/50">D</th>
                <th className="py-1 px-2 text-center font-bold border-r border-blue-100 bg-blue-50/50">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => {
                const a25 = Math.round(row.total2025 * CATEGORY_ALLOC[2025].A / 100);
                const b25 = Math.round(row.total2025 * CATEGORY_ALLOC[2025].B / 100);
                const c25 = Math.round(row.total2025 * CATEGORY_ALLOC[2025].C / 100);
                // D as remainder
                const d25_adj = row.total2025 > 0 ? row.total2025 - a25 - b25 - c25 : 0;

                const a26 = Math.round(row.total2026 * CATEGORY_ALLOC[2026].A / 100);
                const b26 = Math.round(row.total2026 * CATEGORY_ALLOC[2026].B / 100);
                const c26 = Math.round(row.total2026 * CATEGORY_ALLOC[2026].C / 100);
                // D as remainder
                const d26_adj = row.total2026 > 0 ? row.total2026 - a26 - b26 - c26 : 0;

                const pct25 = sumTotal2025 > 0 ? (row.total2025 / sumTotal2025) * 100 : 0;
                const pct26 = sumTotal2026 > 0 ? (row.total2026 / sumTotal2026) * 100 : 0;

                return (
                  <tr key={idx} className="border-b border-slate-100 hover:bg-slate-50/60 transition-colors">
                    <td className="py-1.5 px-3 border-r border-slate-200 text-slate-700 font-medium whitespace-nowrap">{row.name}</td>
                    {/* 2025 */}
                    <td className="py-1.5 px-2 text-center text-slate-600 border-r border-slate-100">{a25.toLocaleString('es-CO')}</td>
                    <td className="py-1.5 px-2 text-center text-slate-600 border-r border-slate-100">{b25.toLocaleString('es-CO')}</td>
                    <td className="py-1.5 px-2 text-center text-slate-600 border-r border-slate-100">{c25.toLocaleString('es-CO')}</td>
                    <td className="py-1.5 px-2 text-center text-slate-600 border-r border-slate-200">{d25_adj.toLocaleString('es-CO')}</td>
                    <td className="py-1.5 px-2 text-center font-bold text-slate-700 border-r border-slate-200 bg-slate-50/40">{row.total2025.toLocaleString('es-CO')}</td>
                    <td className="py-1.5 px-2 text-center text-slate-500 border-r border-slate-200">{pct25.toFixed(1)}%</td>
                    {/* 2026 */}
                    <td className="py-1.5 px-2 text-center text-blue-800 border-r border-blue-50 bg-blue-50/20">{a26.toLocaleString('es-CO')}</td>
                    <td className="py-1.5 px-2 text-center text-blue-800 border-r border-blue-50 bg-blue-50/20">{b26.toLocaleString('es-CO')}</td>
                    <td className="py-1.5 px-2 text-center text-blue-800 border-r border-blue-50 bg-blue-50/20">{c26.toLocaleString('es-CO')}</td>
                    <td className="py-1.5 px-2 text-center text-blue-800 border-r border-blue-100 bg-blue-50/20">{d26_adj.toLocaleString('es-CO')}</td>
                    <td className="py-1.5 px-2 text-center font-bold text-blue-900 border-r border-blue-100 bg-blue-50/40">{row.total2026.toLocaleString('es-CO')}</td>
                    <td className="py-1.5 px-2 text-center font-semibold text-blue-700">{pct26.toFixed(1)}%</td>
                  </tr>
                );
              })}
              {/* TOTAL ROW */}
              <tr className="bg-slate-100/70 border-t-2 border-slate-300 font-bold">
                <td className="py-2 px-3 border-r border-slate-300 text-slate-800">TOTAL</td>
                <td className="py-2 px-2 text-center border-r border-slate-200">{Math.round(sumTotal2025 * CATEGORY_ALLOC[2025].A / 100).toLocaleString('es-CO')}</td>
                <td className="py-2 px-2 text-center border-r border-slate-200">{Math.round(sumTotal2025 * CATEGORY_ALLOC[2025].B / 100).toLocaleString('es-CO')}</td>
                <td className="py-2 px-2 text-center border-r border-slate-200">{Math.round(sumTotal2025 * CATEGORY_ALLOC[2025].C / 100).toLocaleString('es-CO')}</td>
                <td className="py-2 px-2 text-center border-r border-slate-300">{Math.round(sumTotal2025 * CATEGORY_ALLOC[2025].D / 100).toLocaleString('es-CO')}</td>
                <td className="py-2 px-2 text-center text-slate-800 bg-slate-200/50 border-r border-slate-300">{sumTotal2025.toLocaleString('es-CO')}</td>
                <td className="py-2 px-2 text-center border-r border-slate-300">100%</td>

                <td className="py-2 px-2 text-center text-blue-900 border-r border-blue-200">{Math.round(sumTotal2026 * CATEGORY_ALLOC[2026].A / 100).toLocaleString('es-CO')}</td>
                <td className="py-2 px-2 text-center text-blue-900 border-r border-blue-200">{Math.round(sumTotal2026 * CATEGORY_ALLOC[2026].B / 100).toLocaleString('es-CO')}</td>
                <td className="py-2 px-2 text-center text-blue-900 border-r border-blue-200">{Math.round(sumTotal2026 * CATEGORY_ALLOC[2026].C / 100).toLocaleString('es-CO')}</td>
                <td className="py-2 px-2 text-center text-blue-900 border-r border-blue-200">{Math.round(sumTotal2026 * CATEGORY_ALLOC[2026].D / 100).toLocaleString('es-CO')}</td>
                <td className="py-2 px-2 text-center text-blue-900 bg-blue-200/50 border-r border-blue-200">{sumTotal2026.toLocaleString('es-CO')}</td>
                <td className="py-2 px-2 text-center text-blue-900">100%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };


  // ─── INGRESOS TABLE ────────────────────────────────────────────────────────
  // Pre-compute estimated incomes for BOTH lines to get combined scale factor
  const ingresosDeporte = useMemo(() =>
    deportesData.map(r => ({
      ...r,
      ingEst2025: calcIngreso(r.total2025, 2025, r.name),
      ingEst2026: calcIngreso(r.total2026, 2026, r.name),
    })), [deportesData]);

  const ingresosTalleres = useMemo(() =>
    talleresData.map(r => ({
      ...r,
      ingEst2025: calcIngreso(r.total2025, 2025, r.name),
      ingEst2026: calcIngreso(r.total2026, 2026, r.name),
    })), [talleresData]);

  const sumEstimated2025 = useMemo(() =>
    [...ingresosDeporte, ...ingresosTalleres].reduce((s, r) => s + r.ingEst2025, 0),
    [ingresosDeporte, ingresosTalleres]);

  const sumEstimated2026 = useMemo(() =>
    [...ingresosDeporte, ...ingresosTalleres].reduce((s, r) => s + r.ingEst2026, 0),
    [ingresosDeporte, ingresosTalleres]);

  // Scale factors: multiply each estimated income to make grand total = real total
  const scale2025 = realTotal2025 > 0 && sumEstimated2025 > 0 ? realTotal2025 / sumEstimated2025 : 1;
  const scale2026 = realTotal2026 > 0 && sumEstimated2026 > 0 ? realTotal2026 / sumEstimated2026 : 1;

  const renderIngresosTable = (
    title: string,
    accentColor: string,
    preRows: Array<ReturnType<typeof ingresosDeporte>[number]>
  ) => {
    if (preRows.length === 0) return <EmptyState title={title} />;

    const formatCOP = (n: number) =>
      n > 0
        ? new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 }).format(n)
        : '—';

    // Apply scale factors to each modality
    const rows = preRows.map(row => ({
      ...row,
      ing2025: row.ingEst2025 * scale2025,
      ing2026: row.ingEst2026 * scale2026,
    }));

    const totalIng2025 = rows.reduce((s, r) => s + r.ing2025, 0);
    const totalIng2026 = rows.reduce((s, r) => s + r.ing2026, 0);
    const diffTotal = totalIng2026 - totalIng2025;
    const pctTotal = totalIng2025 > 0 ? (diffTotal / totalIng2025) * 100 : 0;

    return (
      <div className="mb-10 last:mb-0">
        <h3 className={`text-sm font-bold mb-3 ${accentColor}`}>{title}</h3>
        <div className="overflow-x-auto rounded-xl border border-slate-200">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b-2 border-slate-300 text-center bg-slate-50">
                <th className="py-2.5 px-4 text-left text-slate-600 font-semibold border-r border-slate-200">
                  Modalidad Deportiva
                </th>
                {/* 2025 */}
                <th className="py-2.5 px-3 bg-slate-100 text-slate-700 font-bold border-r border-slate-200">
                  Ingresos 2025
                </th>
                <th className="py-2.5 px-3 bg-slate-100 text-slate-600 font-semibold border-r border-slate-300">
                  % Participación
                </th>
                {/* 2026 */}
                <th className="py-2.5 px-3 bg-blue-50 text-blue-900 font-bold border-r border-blue-100">
                  Ingresos 2026
                </th>
                <th className="py-2.5 px-3 bg-blue-50 text-blue-700 font-semibold border-r border-blue-100">
                  % Participación
                </th>
                {/* Var */}
                <th className="py-2.5 px-3 text-slate-600 font-semibold">
                  Var. YoY
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, idx) => {
                // % participation calculated over the REAL total (entire deporte+talleres)
                const pct25 = realTotal2025 > 0 ? (row.ing2025 / realTotal2025) * 100 : 0;
                const pct26 = realTotal2026 > 0 ? (row.ing2026 / realTotal2026) * 100 : 0;
                const diff = row.ing2026 - row.ing2025;
                const yoy = row.ing2025 > 0 ? (diff / row.ing2025) * 100 : row.ing2026 > 0 ? 100 : 0;
                const hasData = row.ing2025 > 0 || row.ing2026 > 0;
                return (
                  <tr key={idx} className={`border-b border-slate-100 hover:bg-slate-50/60 transition-colors ${!hasData ? 'opacity-40' : ''}`}>
                    <td className="py-2 px-4 border-r border-slate-200 text-slate-700 font-medium whitespace-nowrap">
                      {row.name}
                      {!hasData && <span className="ml-2 text-[10px] text-slate-400 italic">(sin tarifa)</span>}
                    </td>
                    {/* 2025 */}
                    <td className="py-2 px-3 text-right font-mono text-slate-600 border-r border-slate-200 bg-slate-50/40">
                      {formatCOP(row.ing2025)}
                    </td>
                    <td className="py-2 px-3 text-center text-slate-500 border-r border-slate-300 bg-slate-50/20">
                      {row.ing2025 > 0 ? `${pct25.toFixed(1)}%` : '—'}
                    </td>
                    {/* 2026 */}
                    <td className="py-2 px-3 text-right font-mono font-bold text-blue-900 border-r border-blue-100 bg-blue-50/30">
                      {formatCOP(row.ing2026)}
                    </td>
                    <td className="py-2 px-3 text-center font-semibold text-blue-700 border-r border-blue-100 bg-blue-50/20">
                      {row.ing2026 > 0 ? `${pct26.toFixed(1)}%` : '—'}
                    </td>
                    {/* YoY */}
                    <td className="py-2 px-3 text-center">
                      {row.ing2025 === 0 && row.ing2026 === 0 ? (
                        <span className="text-slate-300 text-xs italic">—</span>
                      ) : row.ing2025 === 0 ? (
                        <span className="text-slate-400 text-xs italic">Nuevo</span>
                      ) : (
                        <span className={`inline-flex items-center gap-0.5 font-semibold text-xs ${pctColor(yoy)}`}>
                          {pctIcon(yoy)}{Math.abs(yoy).toFixed(1)}%
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {/* TOTAL ROW */}
              <tr className="bg-slate-100/80 border-t-2 border-slate-300 font-bold">
                <td className="py-2.5 px-4 border-r border-slate-300 text-slate-800">SUBTOTAL</td>
                <td className="py-2.5 px-3 text-right font-mono text-slate-700 border-r border-slate-300 bg-slate-100">
                  {formatCOP(totalIng2025)}
                </td>
                <td className="py-2.5 px-3 text-center text-slate-600 border-r border-slate-300 bg-slate-100">
                  {realTotal2025 > 0 ? `${(totalIng2025 / realTotal2025 * 100).toFixed(1)}%` : '100%'}
                </td>
                <td className="py-2.5 px-3 text-right font-mono text-blue-900 border-r border-blue-200 bg-blue-100/60">
                  {formatCOP(totalIng2026)}
                </td>
                <td className="py-2.5 px-3 text-center text-blue-800 border-r border-blue-200 bg-blue-100/40">
                  {realTotal2026 > 0 ? `${(totalIng2026 / realTotal2026 * 100).toFixed(1)}%` : '100%'}
                </td>
                <td className="py-2.5 px-3 text-center">
                  <span className={`inline-flex items-center gap-0.5 font-bold ${pctColor(pctTotal)}`}>
                    {pctIcon(pctTotal)}{Math.abs(pctTotal).toFixed(1)}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <p className="mt-2 text-[10px] text-slate-400 italic">
          * Ingresos distribuidos proporcionalmente según tarifas oficiales y cobertura por categoría (A/B/C/D). Total consolidado igual al ingreso real del sistema.
        </p>
      </div>
    );
  };



  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-5 gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 font-display">
            Comparativo de Usuarios por Modalidad: 2025 vs 2026
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            {viewMode === 'resumen'
              ? 'Detalle mensual 2026 + total acumulado vs mismo período 2025'
              : viewMode === 'mes_a_mes'
              ? 'Comparativo mes a mes lado a lado: 2025 | 2026 | Variación %'
              : viewMode === 'categorias'
              ? 'Cobertura estimada por categoría de afiliación (A-B-C-D) aplicada a cada modalidad'
              : 'Ingresos estimados por modalidad según tarifas 2026 y cobertura por categoría'}
          </p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* ── Vista Toggle ── */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1 gap-1">
            <button
              onClick={() => setViewMode('resumen')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                viewMode === 'resumen'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Table className="h-3.5 w-3.5" />
              Resumen
            </button>
            <button
              onClick={() => setViewMode('mes_a_mes')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                viewMode === 'mes_a_mes'
                  ? 'bg-white text-slate-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <BarChart2 className="h-3.5 w-3.5" />
              Mes a Mes
            </button>
            <button
              onClick={() => setViewMode('categorias')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                viewMode === 'categorias'
                  ? 'bg-purple-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Users className="h-3.5 w-3.5" />
              Categorías
            </button>
            <button
              onClick={() => setViewMode('ingresos')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                viewMode === 'ingresos'
                  ? 'bg-emerald-600 text-white shadow-sm'
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <DollarSign className="h-3.5 w-3.5" />
              Ingresos $
            </button>
          </div>

          {/* ── Sede Filter ── */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
            <span className="text-xs font-semibold text-slate-500">Sede:</span>
            <select
              className="bg-transparent text-sm font-bold text-slate-700 outline-none"
              value={sedeFilter}
              onChange={e => setSedeFilter(e.target.value)}
            >
              {availableSedes.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* ── Legend ── */}
      {viewMode === 'mes_a_mes' && (
        <div className="flex items-center gap-4 mb-5 text-xs text-slate-500 bg-slate-50 rounded-lg px-4 py-2 border border-slate-200">
          <span className="font-semibold text-slate-600">Leyenda:</span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm bg-slate-200"></span> Valor 2025
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-3 h-3 rounded-sm bg-blue-300"></span> Valor 2026
          </span>
          <span className="flex items-center gap-1.5">
            <ArrowUpRight className="h-3 w-3 text-emerald-500" /> Crecimiento
          </span>
          <span className="flex items-center gap-1.5">
            <ArrowDownRight className="h-3 w-3 text-rose-500" /> Decrecimiento
          </span>
        </div>
      )}

      {viewMode === 'categorias' && (
        <div className="flex items-center gap-3 mb-5 text-xs bg-purple-50 border border-purple-200 rounded-lg px-4 py-2.5">
          <Users className="h-4 w-4 text-purple-600 shrink-0" />
          <span className="text-purple-800">
            <strong>Desglose estimado:</strong> El número de usuarios por categoría se calcula aplicando el % de cobertura global de cada año al total de la modalidad.
            Categorías 2026: A={CATEGORY_ALLOC[2026].A}% · B={CATEGORY_ALLOC[2026].B}% · C={CATEGORY_ALLOC[2026].C}% · D={CATEGORY_ALLOC[2026].D}%
          </span>
        </div>
      )}

      {viewMode === 'ingresos' && (
        <div className="flex items-center gap-3 mb-5 text-xs bg-emerald-50 border border-emerald-200 rounded-lg px-4 py-2.5">
          <DollarSign className="h-4 w-4 text-emerald-600 shrink-0" />
          <span className="text-emerald-800">
            <strong>Método de cálculo:</strong> Total usuarios × % cobertura por categoría × tarifa oficial por categoría.
            Categorías 2026: A={CATEGORY_ALLOC[2026].A}% · B={CATEGORY_ALLOC[2026].B}% · C={CATEGORY_ALLOC[2026].C}% · D={CATEGORY_ALLOC[2026].D}%
          </span>
        </div>
      )}

      {/* ── Tables ── */}
      {viewMode === 'resumen' ? (
        <>
          {renderResumenTable('🏅 Escuelas Deportivas', 'text-blue-800', deportesData)}
          {renderResumenTable('🎨 Talleres y Actividades de Recreación', 'text-emerald-700', talleresData)}
        </>
      ) : viewMode === 'mes_a_mes' ? (
        <>
          {renderMesAMesTable('🏅 Escuelas Deportivas', 'text-blue-800', deportesData)}
          {renderMesAMesTable('🎨 Talleres y Actividades de Recreación', 'text-emerald-700', talleresData)}
        </>
      ) : viewMode === 'categorias' ? (
        <>
          {renderCategoriasTable('🏅 Escuelas Deportivas', 'text-blue-800', deportesData)}
          {renderCategoriasTable('🎨 Talleres y Actividades de Recreación', 'text-emerald-700', talleresData)}
        </>
      ) : (
        <>
          {renderIngresosTable('🏅 Escuelas Deportivas', 'text-blue-800', ingresosDeporte)}
          {renderIngresosTable('🎨 Talleres y Actividades de Recreación', 'text-emerald-700', ingresosTalleres)}
        </>
      )}
    </div>
  );
}

// ── Helper component ──────────────────────────────────────────────────────────
function EmptyState({ title }: { title: string }) {
  return (
    <div className="mb-8">
      <h3 className="text-sm font-semibold text-slate-700 mb-3">{title}</h3>
      <p className="text-sm text-slate-400 italic">No hay datos reportados para esta sede.</p>
    </div>
  );
}
