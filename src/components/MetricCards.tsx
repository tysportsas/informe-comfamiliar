import React from 'react';
import { DollarSign, Users, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, AlertCircle } from 'lucide-react';

interface MetricCardsProps {
  total2025: number;
  total2026: number;
  coverage2025: number;
  coverage2026: number;
  periodLabel: string;
  hasIncompleteJune: boolean;
}

export default function MetricCards({
  total2025,
  total2026,
  coverage2025,
  coverage2026,
  periodLabel,
  hasIncompleteJune
}: MetricCardsProps) {
  
  // Format currency
  const formatCOP = (val: number) => {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      maximumFractionDigits: 0
    }).format(val);
  };

  // Format integer
  const formatInt = (val: number) => {
    return new Intl.NumberFormat('es-CO').format(val);
  };

  // Calculations for Incomes
  const diffIncome = total2026 - total2025;
  const pctIncome = total2025 > 0 ? (diffIncome / total2025) * 100 : 0;
  const isIncomeUp = diffIncome >= 0;

  // Calculations for Coverage
  const diffCoverage = coverage2026 - coverage2025;
  const pctCoverage = coverage2025 > 0 ? (diffCoverage / coverage2025) * 100 : 0;
  const isCoverageUp = diffCoverage >= 0;

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        
        {/* Card 1: Ingresos 2025 */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">Ingresos Totales 2025</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-100 text-slate-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-display text-2xl font-bold text-slate-900">{formatCOP(total2025)}</h3>
            <p className="mt-1 text-xs text-slate-500 font-medium">Acumulado {periodLabel}</p>
          </div>
          <div className="absolute right-0 bottom-0 h-1.5 w-full bg-slate-300" />
        </div>

        {/* Card 2: Ingresos 2026 */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all hover:shadow-md">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-display">Ingresos Totales 2026</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-blue-600">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <h3 className="font-display text-2xl font-bold text-slate-900">{formatCOP(total2026)}</h3>
            <div className="mt-1 flex items-center gap-1.5">
              <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-2xs font-bold ${
                isIncomeUp ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}>
                {isIncomeUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {pctIncome.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-500 font-medium">vs 2025</span>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 h-1.5 w-full bg-blue-600" />
        </div>

        {/* Card 3: Cobertura (Beneficiarios) */}
        <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xs transition-all hover:shadow-md sm:col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-display">Cobertura de Beneficiarios</span>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <Users className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4">
            <div className="flex items-baseline gap-2">
              <h3 className="font-display text-2xl font-bold text-slate-900">{formatInt(coverage2026)}</h3>
              <span className="text-xs text-slate-400 font-semibold">vs {formatInt(coverage2025)} (2025)</span>
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <span className={`inline-flex items-center gap-0.5 rounded-full px-1.5 py-0.5 text-2xs font-bold ${
                isCoverageUp ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'
              }`}>
                {isCoverageUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                {pctCoverage.toFixed(1)}%
              </span>
              <span className="text-xs text-slate-500 font-medium">Incremento de Cobertura</span>
            </div>
          </div>
          <div className="absolute right-0 bottom-0 h-1.5 w-full bg-emerald-500" />
        </div>

      </div>

      {/* Info Footnote for June discrepancy */}
      {hasIncompleteJune && (
        <div className="flex items-start gap-2 rounded-xl bg-amber-50/70 border border-amber-200 p-3 text-xs text-amber-800 no-print">
          <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
          <div>
            <p className="font-semibold">Nota sobre comparación de Junio:</p>
            <p className="text-amber-700">
              El año 2026 solo cuenta con información reportada de Enero a Mayo. Al seleccionar "Enero - Junio", la suma de 2026 no contiene datos para el mes de junio, lo que puede reflejar una variación negativa ficticia. Se recomienda usar <strong>"Enero - Mayo (Período Homólogo)"</strong> para una comparación simétrica y equitativa.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
