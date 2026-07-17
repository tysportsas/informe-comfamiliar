import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LabelList } from 'recharts';
import { Users, Loader2, BarChart2, Calendar } from 'lucide-react';
import { supabase } from '../lib/supabase';
import modalitiesData2025Raw from '../data/modalities_data_2025.json';

import { CoverageSource } from '../types';

interface CoverageModuleProps {
  selectedMunicipality: string;
  coverageSource?: CoverageSource;
}

const CATEGORY_ALLOC = {
  2025: { A: 45, B: 30, C: 15, D: 10 },
  2026: { A: 51, B: 32, C: 6,  D: 11 },
};

export default function CoverageModule({ selectedMunicipality, coverageSource = 'servicios_facturados' }: CoverageModuleProps) {
  const availableSedes = ['Todas', 'Pereira', 'Dosquebradas', 'Santa Rosa', 'Quinchía'];
  
  const [sedeFilter, setSedeFilter] = useState<string>(
    selectedMunicipality === 'ALL' ? 'Todas' : selectedMunicipality
  );
  
  const [yearMode, setYearMode] = useState<'2025' | '2026' | 'Ambos'>('Ambos');
  
  const [categoriesData, setCategoriesData] = useState<any>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      const { data, error } = await supabase.from('categories_trend').select('*');
      
      if (!error && data) {
        // Transform array into nested object { Sede: { Month: { A, B, C, D } } }
        const formattedData: any = {};
        data.forEach((row) => {
          if (!formattedData[row.sede]) formattedData[row.sede] = {};
          formattedData[row.sede][row.month] = {
            A: row.cat_a,
            B: row.cat_b,
            C: row.cat_c,
            D: row.cat_d
          };
        });
        setCategoriesData(formattedData);
      }
      setIsLoading(false);
    };

    fetchCategories();
  }, []);

  const formatInt = (val: number) => {
    return new Intl.NumberFormat('es-CO').format(val);
  };

  const chartData = useMemo(() => {
    const dataForSede2026 = categoriesData[sedeFilter] || categoriesData['Todas'] || {};
    
    // Calculate 2025 totals
    const raw2025: any = (modalitiesData2025Raw as any)[coverageSource] || modalitiesData2025Raw;
    const monthlyTotals25 = [0, 0, 0, 0, 0];
    const lines = ['Deporte', 'Recreación'];
    lines.forEach(linea => {
      const lineaData = raw2025[linea] || {};
      const sedesToProcess = sedeFilter === 'Todas' ? Object.keys(lineaData) : [sedeFilter];
      sedesToProcess.forEach(sedeKey => {
        const sedeData = lineaData[sedeKey] || {};
        Object.values(sedeData).forEach((mod: any) => {
          ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'].forEach((m, i) => {
            monthlyTotals25[i] += (mod[m] || 0);
          });
        });
      });
    });

    // Convert to array for Recharts
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'];
    return months.map((m, i) => {
      const tot25 = monthlyTotals25[i];
      const a25 = Math.round(tot25 * CATEGORY_ALLOC[2025].A / 100);
      const b25 = Math.round(tot25 * CATEGORY_ALLOC[2025].B / 100);
      const c25 = Math.round(tot25 * CATEGORY_ALLOC[2025].C / 100);
      const d25 = tot25 > 0 ? tot25 - a25 - b25 - c25 : 0;

      return {
        name: m,
        A_25: a25, B_25: b25, C_25: c25, D_25: d25,
        A_26: dataForSede2026[m]?.A || 0,
        B_26: dataForSede2026[m]?.B || 0,
        C_26: dataForSede2026[m]?.C || 0,
        D_26: dataForSede2026[m]?.D || 0,
      };
    });
  }, [sedeFilter, categoriesData, coverageSource]);

  // Calculate totals for quick metrics (shows either 2025, 2026, or combined if Ambos)
  const totals = useMemo(() => {
    return chartData.reduce((acc, curr) => {
      const aVal = yearMode === 'Ambos' ? curr.A_25 + curr.A_26 : (yearMode === '2025' ? curr.A_25 : curr.A_26);
      const bVal = yearMode === 'Ambos' ? curr.B_25 + curr.B_26 : (yearMode === '2025' ? curr.B_25 : curr.B_26);
      const cVal = yearMode === 'Ambos' ? curr.C_25 + curr.C_26 : (yearMode === '2025' ? curr.C_25 : curr.C_26);
      const dVal = yearMode === 'Ambos' ? curr.D_25 + curr.D_26 : (yearMode === '2025' ? curr.D_25 : curr.D_26);
      return {
        A: acc.A + aVal,
        B: acc.B + bVal,
        C: acc.C + cVal,
        D: acc.D + dVal,
      };
    }, { A: 0, B: 0, C: 0, D: 0 });
  }, [chartData, yearMode]);

  const totalUsers = totals.A + totals.B + totals.C + totals.D;

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 shadow-sm mb-6 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Cargando base de datos...</p>
      </div>
    );
  }

  // Common label component for bars
  const renderLabel = (props: any, dataKey: string) => {
    const { x, y, width, height, index } = props;
    const data = chartData[index];
    const val = data[dataKey];
    if (!data || !val || val === 0 || height < 15) return null;
    
    let total = 0;
    if (dataKey.endsWith('_25')) {
      total = data.A_25 + data.B_25 + data.C_25 + data.D_25;
    } else {
      total = data.A_26 + data.B_26 + data.C_26 + data.D_26;
    }
    
    return (
      <text x={x + width / 2} y={y + height / 2} fill="#ffffff" textAnchor="middle" dominantBaseline="middle" fontSize={11}>
        {`${formatInt(val)} (${((val / total) * 100).toFixed(1)}%)`}
      </text>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 font-display">Cobertura por Categorías</h2>
            <p className="text-xs text-slate-400 mt-0.5">
              {yearMode === '2026' ? 'Tendencia mensual real según base de datos (2026)' : 'Comparativo mensual estimado (2025) vs real (2026)'}
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Year Toggle */}
          <div className="flex items-center bg-slate-100 rounded-lg p-1 gap-1">
            <button
              onClick={() => setYearMode('2025')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                yearMode === '2025' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              2025
            </button>
            <button
              onClick={() => setYearMode('2026')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                yearMode === '2026' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <Calendar className="h-3.5 w-3.5" />
              2026
            </button>
            <button
              onClick={() => setYearMode('Ambos')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold transition-all duration-200 ${
                yearMode === 'Ambos' ? 'bg-emerald-600 text-white shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              <BarChart2 className="h-3.5 w-3.5" />
              Comparativo
            </button>
          </div>

          {/* Filtro de Sede */}
          <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-lg px-3 py-1.5">
            <span className="text-xs font-semibold text-slate-500">Sede:</span>
            <select 
              className="bg-transparent text-sm font-bold text-slate-700 outline-none"
              value={sedeFilter}
              onChange={(e) => setSedeFilter(e.target.value)}
            >
              {availableSedes.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className={`mb-6 rounded-xl bg-amber-50/70 border border-amber-200 p-4 text-sm text-amber-800 transition-all ${coverageSource === 'informacion_super' ? 'block' : 'hidden'}`}>
        <p className="font-semibold mb-1">Aviso sobre Información Súper</p>
        <p className="text-amber-700 text-xs">
          La base de datos mensual en tiempo real aún no cuenta con el desglose de Información Súper. Las gráficas inferiores mostrarán la proporción mensual de Servicios Facturados hasta que se habilite el módulo en la base de datos central.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <p className="text-xs text-slate-500 font-medium mb-1">Total Categoría A {yearMode !== 'Ambos' && `(${yearMode})`}</p>
          <div className="text-2xl font-bold text-blue-600">{formatInt(totals.A)}</div>
          <p className="text-[10px] text-slate-400 mt-1">{((totals.A / totalUsers) * 100 || 0).toFixed(1)}% del total</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <p className="text-xs text-slate-500 font-medium mb-1">Total Categoría B {yearMode !== 'Ambos' && `(${yearMode})`}</p>
          <div className="text-2xl font-bold text-emerald-600">{formatInt(totals.B)}</div>
          <p className="text-[10px] text-slate-400 mt-1">{((totals.B / totalUsers) * 100 || 0).toFixed(1)}% del total</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <p className="text-xs text-slate-500 font-medium mb-1">Total Categoría C {yearMode !== 'Ambos' && `(${yearMode})`}</p>
          <div className="text-2xl font-bold text-amber-500">{formatInt(totals.C)}</div>
          <p className="text-[10px] text-slate-400 mt-1">{((totals.C / totalUsers) * 100 || 0).toFixed(1)}% del total</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <p className="text-xs text-slate-500 font-medium mb-1">Total Categoría D {yearMode !== 'Ambos' && `(${yearMode})`}</p>
          <div className="text-2xl font-bold text-rose-500">{formatInt(totals.D)}</div>
          <p className="text-[10px] text-slate-400 mt-1">{((totals.D / totalUsers) * 100 || 0).toFixed(1)}% del total</p>
        </div>
      </div>

      <div className="h-[450px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => formatInt(val)} />
            <Tooltip 
              formatter={(value: number, name: string) => [formatInt(value), name]}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            
            {(yearMode === '2025' || yearMode === 'Ambos') && (
              <>
                <Bar dataKey="A_25" name="Cat A (2025)" stackId="2025" fill="#93c5fd" radius={[0, 0, 0, 0]}>
                  <LabelList content={(p: any) => renderLabel(p, 'A_25')} />
                </Bar>
                <Bar dataKey="B_25" name="Cat B (2025)" stackId="2025" fill="#6ee7b7" radius={[0, 0, 0, 0]}>
                  <LabelList content={(p: any) => renderLabel(p, 'B_25')} />
                </Bar>
                <Bar dataKey="C_25" name="Cat C (2025)" stackId="2025" fill="#fcd34d" radius={[0, 0, 0, 0]}>
                  <LabelList content={(p: any) => renderLabel(p, 'C_25')} />
                </Bar>
                <Bar dataKey="D_25" name="Cat D (2025)" stackId="2025" fill="#fda4af" radius={[4, 4, 0, 0]}>
                  <LabelList content={(p: any) => renderLabel(p, 'D_25')} />
                </Bar>
              </>
            )}

            {(yearMode === '2026' || yearMode === 'Ambos') && (
              <>
                <Bar dataKey="A_26" name="Cat A (2026)" stackId="2026" fill="#2563eb" radius={[0, 0, 0, 0]}>
                  <LabelList content={(p: any) => renderLabel(p, 'A_26')} />
                </Bar>
                <Bar dataKey="B_26" name="Cat B (2026)" stackId="2026" fill="#10b981" radius={[0, 0, 0, 0]}>
                  <LabelList content={(p: any) => renderLabel(p, 'B_26')} />
                </Bar>
                <Bar dataKey="C_26" name="Cat C (2026)" stackId="2026" fill="#f59e0b" radius={[0, 0, 0, 0]}>
                  <LabelList content={(p: any) => renderLabel(p, 'C_26')} />
                </Bar>
                <Bar dataKey="D_26" name="Cat D (2026)" stackId="2026" fill="#f43f5e" radius={[4, 4, 0, 0]}>
                  <LabelList content={(p: any) => renderLabel(p, 'D_26')} />
                </Bar>
              </>
            )}
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
