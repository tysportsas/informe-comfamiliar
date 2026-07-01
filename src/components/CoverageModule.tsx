import React, { useState, useMemo, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Users, Loader2 } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface CoverageModuleProps {
  selectedMunicipality: string;
}

export default function CoverageModule({ selectedMunicipality }: CoverageModuleProps) {
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
            <Bar dataKey="A" name="Cat. A (Subsidio Alto)" stackId="a" fill="#2563eb" radius={[0, 0, 0, 0]} />
            <Bar dataKey="B" name="Cat. B (Subsidio Medio)" stackId="a" fill="#10b981" radius={[0, 0, 0, 0]} />
            <Bar dataKey="C" name="Cat. C (No Subsidia)" stackId="a" fill="#f59e0b" radius={[0, 0, 0, 0]} />
            <Bar dataKey="D" name="Cat. D (Particular)" stackId="a" fill="#f43f5e" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
