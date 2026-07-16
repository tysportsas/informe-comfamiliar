import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, LabelList } from 'recharts';
import { DollarSign, Layers, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { LineAllocation } from '../types';
import { MONTHS } from '../data';
import { usePrintMode } from '../hooks/usePrintMode';

interface RevenuesModuleProps {
  data2025: any;
  data2026: any;
  lineAllocation: LineAllocation;
  periodOption: 'jan_may' | 'jan_jun';
  selectedMunicipality: string;
}

export default function RevenuesModule({
  data2025,
  data2026,
  lineAllocation,
  periodOption,
  selectedMunicipality
}: RevenuesModuleProps) {
  
  // Months of interest
  const monthsLimit = periodOption === 'jan_may' ? 5 : 6;
  const filteredMonths = MONTHS.slice(0, monthsLimit);
  const isPrinting = usePrintMode();

  // Helper to format currency
  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatMillions = (val: number) => {
    return `$${(val / 1000000).toFixed(1)}M`;
  };

  const formatLabelMillions = (val: any) => {
    if (val === null || val === undefined || val === 0) return '';
    return `$${(val / 1000000).toFixed(0)}M`;
  };

  // Build month-by-month chart data
  const chartData = filteredMonths.map((month, idx) => {
    let sum2025 = 0;
    let sum2026 = 0;

    Object.keys(data2025).forEach(key => {
      // If we filtered by municipality
      if (selectedMunicipality !== 'ALL' && !key.includes(selectedMunicipality)) {
        return;
      }
      sum2025 += (data2025[key]?.totals?.[idx] || 0);
    });

    Object.keys(data2026).forEach(key => {
      if (selectedMunicipality !== 'ALL' && !key.includes(selectedMunicipality)) {
        return;
      }
      sum2026 += (data2026[key]?.totals?.[idx] || 0);
    });

    return {
      name: month,
      '2025': sum2025,
      '2026': sum2026
    };
  });

  // Calculate totals by line
  const calculateLineTotals = (yearData: any, is2026 = false) => {
    let deporteSum = 0;
    let recreacionSum = 0;

    Object.keys(yearData).forEach(key => {
      if (selectedMunicipality !== 'ALL' && !key.includes(selectedMunicipality)) {
        return;
      }
      const itemTotals = yearData[key]?.totals || [];
      const sum = itemTotals.slice(0, monthsLimit).reduce((acc: number, curr: number) => acc + curr, 0);

      if (key.includes('DEPORTES')) {
        deporteSum += sum;
      } else if (key.includes('RECREACION')) {
        recreacionSum += sum;
      }
    });

    const deporteVal = deporteSum * (lineAllocation.deporte / 100);
    const recreacionVal = recreacionSum * (lineAllocation.recreacion / 100);
    const actividadFisicaVal = recreacionSum * (lineAllocation.actividadFisica / 100);
    const eventosVal = recreacionSum * (lineAllocation.eventos / 100);

    return {
      deporte: deporteVal,
      recreacion: recreacionVal,
      actividadFisica: actividadFisicaVal,
      eventos: eventosVal,
      total: deporteVal + recreacionVal + actividadFisicaVal + eventosVal
    };
  };

  const totals2025 = calculateLineTotals(data2025);
  const totals2026 = calculateLineTotals(data2026, true);

  // Grouped Municipalities Table Data
  const getMunicipalityData = () => {
    const munNames = ['PEREIRA', 'DOSQUEBRADAS', 'SANTA ROSA', 'QUINCHIA'];
    return munNames.map(mun => {
      let dep2025 = 0;
      let dep2026 = 0;
      let rec2025 = 0;
      let rec2026 = 0;

      // 2025
      Object.keys(data2025).forEach(key => {
        if (!key.includes(mun)) return;
        const sum = data2025[key]?.totals?.slice(0, monthsLimit).reduce((a: number, b: number) => a + b, 0) || 0;
        if (key.includes('DEPORTES')) dep2025 = sum;
        else if (key.includes('RECREACION')) rec2025 = sum;
      });

      // 2026
      Object.keys(data2026).forEach(key => {
        if (!key.includes(mun)) return;
        const sum = data2026[key]?.totals?.slice(0, monthsLimit).reduce((a: number, b: number) => a + b, 0) || 0;
        if (key.includes('DEPORTES')) dep2026 = sum;
        else if (key.includes('RECREACION')) rec2026 = sum;
      });

      // Split 2025 Recreacion
      const r2025 = rec2025 * (lineAllocation.recreacion / 100);
      const act2025 = rec2025 * (lineAllocation.actividadFisica / 100);
      const eve2025 = rec2025 * (lineAllocation.eventos / 100);

      // Split 2026 Recreacion
      const r2026 = rec2026 * (lineAllocation.recreacion / 100);
      const act2026 = rec2026 * (lineAllocation.actividadFisica / 100);
      const eve2026 = rec2026 * (lineAllocation.eventos / 100);

      const tot2025 = dep2025 + rec2025;
      const tot2026 = dep2026 + rec2026;
      const diff = tot2026 - tot2025;
      const pct = tot2025 > 0 ? (diff / tot2025) * 100 : 0;

      return {
        name: mun.charAt(0) + mun.slice(1).toLowerCase(),
        dep2025,
        dep2026,
        r2025,
        r2026,
        act2025,
        act2026,
        eve2025,
        eve2026,
        tot2025,
        tot2026,
        diff,
        pct
      };
    });
  };

  const municipalityReport = getMunicipalityData();

  // Categories definition
  const linesList = [
    { key: 'deporte', name: 'Deporte', color: 'bg-blue-600', val2025: totals2025.deporte, val2026: totals2026.deporte },
    { key: 'recreacion', name: 'Recreación', color: 'bg-emerald-600', val2025: totals2025.recreacion, val2026: totals2026.recreacion },
    { key: 'actividadFisica', name: 'Actividad Física', color: 'bg-amber-500', val2025: totals2025.actividadFisica, val2026: totals2026.actividadFisica },
    { key: 'eventos', name: 'Eventos', color: 'bg-rose-500', val2025: totals2025.eventos, val2026: totals2026.eventos }
  ];

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      
      {/* Chart: Month by Month */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-2">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="font-display text-lg font-bold text-slate-800">
              Tendencia Mensual de Ingresos {periodOption === 'jan_may' ? '(Ene-May)' : '(Ene-Jun)'}
            </h3>
            <p className="text-xs text-slate-400">Comparativo histórico entre el año 2025 y el año 2026</p>
          </div>
        </div>
        <div className="h-72 w-full">
          <ResponsiveContainer width={isPrinting ? 700 : '99%'} height={288}>
            <BarChart data={chartData} margin={{ top: 20, right: 40, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
              <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} tickLine={false} />
              <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} tickFormatter={formatMillions} />
              <Tooltip 
                formatter={(value: any) => [formatCOP(Number(value)), 'Ingresos']}
                contentStyle={{ borderRadius: '12px', borderColor: '#e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="top" height={36} iconType="circle" />
              <Bar dataKey="2025" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Año 2025" isAnimationActive={false}>
                <LabelList dataKey="2025" position="top" formatter={formatLabelMillions} style={{ fontSize: 9, fill: '#64748b', fontWeight: 'bold' }} />
              </Bar>
              <Bar dataKey="2026" fill="#2563eb" radius={[4, 4, 0, 0]} name="Año 2026" isAnimationActive={false}>
                <LabelList dataKey="2026" position="top" formatter={formatLabelMillions} style={{ fontSize: 9, fill: '#1e40af', fontWeight: 'bold' }} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Breakdowns by Line (Categorization) */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-4">
          <h3 className="font-display text-lg font-bold text-slate-800 flex items-center gap-2">
            <Layers className="h-5 w-5 text-blue-600" />
            Ingresos por Línea de Servicio
          </h3>
          <p className="text-xs text-slate-400">Distribución porcentual por categoría del área</p>
        </div>

        <div className="flex flex-col gap-4">
          {linesList.map((line) => {
            const pctShare = totals2026.total > 0 ? (line.val2026 / totals2026.total) * 100 : 0;
            const diff = line.val2026 - line.val2025;
            const yoyPct = line.val2025 > 0 ? (diff / line.val2025) * 100 : 0;

            return (
              <div key={line.key} className="rounded-xl border border-slate-100 p-3 hover:border-slate-200 transition-all bg-slate-50/50">
                <div className="flex items-center justify-between text-xs font-semibold">
                  <div className="flex items-center gap-2">
                    <span className={`h-3 w-3 rounded-full ${line.color}`} />
                    <span className="text-slate-700">{line.name}</span>
                  </div>
                  <span className="text-slate-500 font-mono">{pctShare.toFixed(1)}% de part.</span>
                </div>

                <div className="mt-2.5 flex items-baseline justify-between">
                  <span className="font-display text-base font-bold text-slate-800">
                    {formatCOP(line.val2026)}
                  </span>
                  <div className="flex items-center gap-1">
                    <span className="text-2xs text-slate-400 font-medium">YoY:</span>
                    <span className={`inline-flex items-center text-2xs font-bold ${
                      diff >= 0 ? 'text-emerald-600' : 'text-rose-600'
                    }`}>
                      {diff >= 0 ? '+' : ''}{yoyPct.toFixed(1)}%
                    </span>
                  </div>
                </div>

                {/* Progress bar */}
                <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
                  <div 
                    className={`h-1.5 rounded-full ${line.color}`} 
                    style={{ width: `${pctShare}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* General Comparative Table by Municipality */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-3">
        <div className="mb-4">
          <h3 className="font-display text-lg font-bold text-slate-800">
            Cuadro de Mandos: Comparativo de Ingresos por Sede / Municipio
          </h3>
          <p className="text-xs text-slate-400">
            Detalle financiero completo agrupado por sedes territoriales ({periodOption === 'jan_may' ? 'Ene-May' : 'Ene-Jun'})
          </p>
        </div>

        <div className="overflow-x-auto print:overflow-visible">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              {/* Row 1: Group headers */}
              <tr className="border-b border-slate-200 text-center">
                <th className="py-2 px-3 text-left text-slate-500 font-semibold uppercase tracking-wider" rowSpan={2}>Municipio / Sede</th>
                <th colSpan={2} className="py-2 px-3 bg-blue-50 text-blue-800 font-bold border-x border-blue-200">Línea Deporte</th>
                <th colSpan={2} className="py-2 px-3 bg-emerald-50 text-emerald-800 font-bold border-x border-emerald-200">Línea Recreación</th>
                <th colSpan={2} className="py-2 px-3 bg-amber-50 text-amber-800 font-bold border-x border-amber-200">Línea Act. Física</th>
                <th colSpan={2} className="py-2 px-3 bg-rose-50 text-rose-800 font-bold border-x border-rose-200">Línea Eventos</th>
                <th colSpan={2} className="py-2 px-3 bg-slate-100 text-slate-700 font-bold border-x border-slate-200">Total Ingresos</th>
                <th className="py-2 px-3 text-slate-500 font-semibold uppercase tracking-wider" rowSpan={2}>YoY</th>
              </tr>
              {/* Row 2: Year sub-headers */}
              <tr className="border-b-2 border-slate-300 text-center text-slate-500 font-semibold uppercase tracking-wider">
                <th className="py-2 px-3 bg-blue-50/60 border-l border-blue-200">2025</th>
                <th className="py-2 px-3 bg-blue-100/60 text-blue-900 border-r border-blue-200">2026</th>
                <th className="py-2 px-3 bg-emerald-50/60 border-l border-emerald-200">2025</th>
                <th className="py-2 px-3 bg-emerald-100/60 text-emerald-900 border-r border-emerald-200">2026</th>
                <th className="py-2 px-3 bg-amber-50/60 border-l border-amber-200">2025</th>
                <th className="py-2 px-3 bg-amber-100/60 text-amber-900 border-r border-amber-200">2026</th>
                <th className="py-2 px-3 bg-rose-50/60 border-l border-rose-200">2025</th>
                <th className="py-2 px-3 bg-rose-100/60 text-rose-900 border-r border-rose-200">2026</th>
                <th className="py-2 px-3 bg-slate-100 border-l border-slate-200">2025</th>
                <th className="py-2 px-3 bg-slate-200 text-slate-900 border-r border-slate-200">2026</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {municipalityReport.map((mun) => {
                const isUp = mun.diff >= 0;
                return (
                  <tr key={mun.name} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-3 font-semibold text-slate-900 whitespace-nowrap">{mun.name}</td>
                    {/* Deporte */}
                    <td className="py-3 px-3 text-right font-mono text-slate-500 bg-blue-50/30">{formatCOP(mun.dep2025)}</td>
                    <td className="py-3 px-3 text-right font-mono text-blue-900 font-semibold bg-blue-50/60">{formatCOP(mun.dep2026)}</td>
                    {/* Recreación */}
                    <td className="py-3 px-3 text-right font-mono text-slate-500 bg-emerald-50/30">{formatCOP(mun.r2025)}</td>
                    <td className="py-3 px-3 text-right font-mono text-emerald-900 font-semibold bg-emerald-50/60">{formatCOP(mun.r2026)}</td>
                    {/* Act. Física */}
                    <td className="py-3 px-3 text-right font-mono text-slate-500 bg-amber-50/30">{formatCOP(mun.act2025)}</td>
                    <td className="py-3 px-3 text-right font-mono text-amber-900 font-semibold bg-amber-50/60">{formatCOP(mun.act2026)}</td>
                    {/* Eventos */}
                    <td className="py-3 px-3 text-right font-mono text-slate-500 bg-rose-50/30">{formatCOP(mun.eve2025)}</td>
                    <td className="py-3 px-3 text-right font-mono text-rose-900 font-semibold bg-rose-50/60">{formatCOP(mun.eve2026)}</td>
                    {/* Totals */}
                    <td className="py-3 px-3 text-right font-mono text-slate-500 bg-slate-50">{formatCOP(mun.tot2025)}</td>
                    <td className="py-3 px-3 text-right font-mono text-slate-900 font-bold bg-slate-100">{formatCOP(mun.tot2026)}</td>
                    {/* YoY */}
                    <td className="py-3 px-3 text-right">
                      <span className={`inline-flex items-center font-bold text-xs ${isUp ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {isUp ? <ArrowUpRight className="inline h-3 w-3" /> : <ArrowDownRight className="inline h-3 w-3" />}
                        {mun.pct.toFixed(1)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
              {/* Total Row */}
              <tr className="bg-slate-50 font-bold border-t-2 border-slate-300 text-xs">
                <td className="py-3 px-3 text-slate-900">Total Consolidado</td>
                {/* Deporte */}
                <td className="py-3 px-3 text-right font-mono text-slate-600 bg-blue-50/30">{formatCOP(totals2025.deporte)}</td>
                <td className="py-3 px-3 text-right font-mono text-blue-900 bg-blue-50/60">{formatCOP(totals2026.deporte)}</td>
                {/* Recreación */}
                <td className="py-3 px-3 text-right font-mono text-slate-600 bg-emerald-50/30">{formatCOP(totals2025.recreacion)}</td>
                <td className="py-3 px-3 text-right font-mono text-emerald-900 bg-emerald-50/60">{formatCOP(totals2026.recreacion)}</td>
                {/* Act. Física */}
                <td className="py-3 px-3 text-right font-mono text-slate-600 bg-amber-50/30">{formatCOP(totals2025.actividadFisica)}</td>
                <td className="py-3 px-3 text-right font-mono text-amber-900 bg-amber-50/60">{formatCOP(totals2026.actividadFisica)}</td>
                {/* Eventos */}
                <td className="py-3 px-3 text-right font-mono text-slate-600 bg-rose-50/30">{formatCOP(totals2025.eventos)}</td>
                <td className="py-3 px-3 text-right font-mono text-rose-900 bg-rose-50/60">{formatCOP(totals2026.eventos)}</td>
                {/* Totals */}
                <td className="py-3 px-3 text-right font-mono text-slate-600 bg-slate-100">{formatCOP(totals2025.total)}</td>
                <td className="py-3 px-3 text-right font-mono text-blue-800 bg-blue-50/50">{formatCOP(totals2026.total)}</td>
                {/* YoY */}
                <td className="py-3 px-3 text-right">
                  <span className={`inline-flex items-center font-bold ${totals2026.total >= totals2025.total ? 'text-emerald-700' : 'text-rose-700'}`}>
                    {totals2026.total >= totals2025.total ? '+' : ''}
                    {(((totals2026.total - totals2025.total) / totals2025.total) * 100).toFixed(1)}%
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
