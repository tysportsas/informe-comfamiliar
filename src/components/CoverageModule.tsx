import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell, LabelList } from 'recharts';
import { Users, Loader2, PieChart as PieChartIcon } from 'lucide-react';
import { supabase } from '../lib/supabase';

import { CoverageSource } from '../types';

interface CoverageModuleProps {
  selectedMunicipality: string;
  coverageSource?: CoverageSource;
}

export default function CoverageModule({ selectedMunicipality, coverageSource = 'servicios_facturados' }: CoverageModuleProps) {
  const availableSedes = ['Todas', 'Pereira', 'Dosquebradas', 'Santa Rosa', 'Quinchía'];
  
  const [sedeFilter, setSedeFilter] = useState<string>(
    selectedMunicipality === 'ALL' ? 'Todas' : selectedMunicipality
  );
  
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
    const dataForSede = categoriesData[sedeFilter] || categoriesData['Todas'] || {};
    
    // Convert to array for Recharts
    const months = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo'];
    return months.map(m => ({
      name: m,
      A: dataForSede[m]?.A || 0,
      B: dataForSede[m]?.B || 0,
      C: dataForSede[m]?.C || 0,
      D: dataForSede[m]?.D || 0,
    }));
  }, [sedeFilter, categoriesData]);

  // Calculate totals for quick metrics
  const totals = useMemo(() => {
    return chartData.reduce((acc, curr) => ({
      A: acc.A + curr.A,
      B: acc.B + curr.B,
      C: acc.C + curr.C,
      D: acc.D + curr.D,
    }), { A: 0, B: 0, C: 0, D: 0 });
  }, [chartData]);

  const totalUsers = totals.A + totals.B + totals.C + totals.D;

  if (isLoading) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-12 shadow-sm mb-6 flex flex-col items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin mb-4" />
        <p className="text-slate-500 font-medium">Cargando base de datos...</p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm mb-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600">
            <Users className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 font-display">Cobertura por Categorías (2026)</h2>
            <p className="text-xs text-slate-400 mt-0.5">Tendencia mensual real según base de datos</p>
          </div>
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

      <div className={`mb-6 rounded-xl bg-amber-50/70 border border-amber-200 p-4 text-sm text-amber-800 transition-all ${coverageSource === 'informacion_super' ? 'block' : 'hidden'}`}>
        <p className="font-semibold mb-1">Aviso sobre Información Súper</p>
        <p className="text-amber-700 text-xs">
          La base de datos mensual en tiempo real aún no cuenta con el desglose de Información Súper. Las gráficas inferiores mostrarán la proporción mensual de Servicios Facturados hasta que se habilite el módulo en la base de datos central.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <p className="text-xs text-slate-500 font-medium mb-1">Total Categoría A</p>
          <div className="text-2xl font-bold text-blue-600">{formatInt(totals.A)}</div>
          <p className="text-[10px] text-slate-400 mt-1">{((totals.A / totalUsers) * 100 || 0).toFixed(1)}% del total</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <p className="text-xs text-slate-500 font-medium mb-1">Total Categoría B</p>
          <div className="text-2xl font-bold text-emerald-600">{formatInt(totals.B)}</div>
          <p className="text-[10px] text-slate-400 mt-1">{((totals.B / totalUsers) * 100 || 0).toFixed(1)}% del total</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <p className="text-xs text-slate-500 font-medium mb-1">Total Categoría C</p>
          <div className="text-2xl font-bold text-amber-500">{formatInt(totals.C)}</div>
          <p className="text-[10px] text-slate-400 mt-1">{((totals.C / totalUsers) * 100 || 0).toFixed(1)}% del total</p>
        </div>
        <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
          <p className="text-xs text-slate-500 font-medium mb-1">Total Categoría D</p>
          <div className="text-2xl font-bold text-rose-500">{formatInt(totals.D)}</div>
          <p className="text-[10px] text-slate-400 mt-1">{((totals.D / totalUsers) * 100 || 0).toFixed(1)}% del total</p>
        </div>
      </div>

      <div className="h-[400px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} dy={10} />
            <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12, fill: '#64748b' }} tickFormatter={(val) => formatInt(val)} />
            <Tooltip 
              formatter={(value: number) => [formatInt(value), 'Usuarios']}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
            />
            <Legend wrapperStyle={{ paddingTop: '20px' }} />
            <Bar dataKey="A" name="Categoría A (Subsidio Alto)" stackId="a" fill="#2563eb" radius={[0, 0, 0, 0]}>
              <LabelList content={(props: any) => {
                const { x, y, width, height, index } = props;
                const data = chartData[index];
                if (!data || data.A === 0) return null;
                const total = data.A + data.B + data.C + data.D;
                return (
                  <text x={x + width / 2} y={y + height / 2} fill="#ffffff" textAnchor="middle" dominantBaseline="middle" fontSize={11}>
                    {`${formatInt(data.A)} (${((data.A / total) * 100).toFixed(1)}%)`}
                  </text>
                );
              }} />
            </Bar>
            <Bar dataKey="B" name="Categoría B (Subsidio Medio)" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]}>
              <LabelList content={(props: any) => {
                const { x, y, width, height, index } = props;
                const data = chartData[index];
                if (!data || data.B === 0) return null;
                const total = data.A + data.B + data.C + data.D;
                return (
                  <text x={x + width / 2} y={y + height / 2} fill="#ffffff" textAnchor="middle" dominantBaseline="middle" fontSize={11}>
                    {`${formatInt(data.B)} (${((data.B / total) * 100).toFixed(1)}%)`}
                  </text>
                );
              }} />
            </Bar>
            <Bar dataKey="C" name="Categoría C (No subsidiado)" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]}>
              <LabelList content={(props: any) => {
                const { x, y, width, height, index } = props;
                const data = chartData[index];
                if (!data || data.C === 0) return null;
                const total = data.A + data.B + data.C + data.D;
                return (
                  <text x={x + width / 2} y={y + height / 2} fill="#ffffff" textAnchor="middle" dominantBaseline="middle" fontSize={11}>
                    {`${formatInt(data.C)} (${((data.C / total) * 100).toFixed(1)}%)`}
                  </text>
                );
              }} />
            </Bar>
            <Bar dataKey="D" name="Categoría D (Particulares)" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]}>
              <LabelList content={(props: any) => {
                const { x, y, width, height, index } = props;
                const data = chartData[index];
                if (!data || data.D === 0) return null;
                const total = data.A + data.B + data.C + data.D;
                return (
                  <text x={x + width / 2} y={y + height / 2} fill="#ffffff" textAnchor="middle" dominantBaseline="middle" fontSize={11}>
                    {`${formatInt(data.D)} (${((data.D / total) * 100).toFixed(1)}%)`}
                  </text>
                );
              }} />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
      
      <div className="mt-12 mb-4 border-t border-slate-200 pt-8">
        <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2 mb-6">
          <PieChartIcon className="text-indigo-600 h-5 w-5" />
          Total Usos por Categoría
        </h3>
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={[
                  { name: 'Categoría A', value: totals.A },
                  { name: 'Categoría B', value: totals.B },
                  { name: 'Categoría C', value: totals.C },
                  { name: 'Categoría D', value: totals.D },
                ]}
                cx="50%"
                cy="50%"
                innerRadius={70}
                outerRadius={110}
                paddingAngle={5}
                dataKey="value"
                label={({ cx, cy, midAngle, innerRadius, outerRadius, percent, value }) => {
                  const radius = innerRadius + (outerRadius - innerRadius) * 1.6;
                  const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                  const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                  if (value === 0) return null;
                  return (
                    <text x={x} y={y} fill="#64748b" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11} fontWeight={600}>
                      {`${formatInt(value)} (${(percent * 100).toFixed(1)}%)`}
                    </text>
                  );
                }}
                labelLine={{ stroke: '#cbd5e1', strokeWidth: 1 }}
              >
                <Cell fill="#2563eb" />
                <Cell fill="#10b981" />
                <Cell fill="#f59e0b" />
                <Cell fill="#f43f5e" />
              </Pie>
              <Tooltip 
                formatter={(value: number) => [formatInt(value), 'Usos']}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend verticalAlign="bottom" height={36} />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
