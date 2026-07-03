import React, { useState, useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LabelList } from 'recharts';
import { CoverageSource } from '../types';
import modalitiesData2026Raw from '../data/modalities_data.json';
import modalitiesData2025Raw from '../data/modalities_data_2025.json';

interface ComparativeChartModuleProps {
  selectedMunicipality: string;
  coverageSource?: CoverageSource;
}

const MONTHS = [
  { key: 'Enero', label: 'Ene' },
  { key: 'Febrero', label: 'Feb' },
  { key: 'Marzo', label: 'Mar' },
  { key: 'Abril', label: 'Abr' },
  { key: 'Mayo', label: 'May' },
  { key: 'Junio', label: 'Jun' },
  { key: 'Julio', label: 'Jul' },
  { key: 'Agosto', label: 'Ago' },
  { key: 'Septiembre', label: 'Sep' },
  { key: 'Octubre', label: 'Oct' },
  { key: 'Noviembre', label: 'Nov' },
];

const COLORS = [
  '#4285F4', '#34A853', '#FBBC05', '#EA4335', '#8E24AA', '#00ACC1', '#FF9800', '#F06292'
];

export default function ComparativeChartModule({ selectedMunicipality, coverageSource = 'servicios_facturados' }: ComparativeChartModuleProps) {
  const [activeTab, setActiveTab] = useState<'Deporte' | 'Recreación'>('Deporte');
  
  const sedeFilter = selectedMunicipality === 'ALL' ? 'Todas' : selectedMunicipality;

  // Extract data for both years
  const getModalityData = (yearData: any, linea: 'Deporte' | 'Recreación') => {
    let rawData: Record<string, Record<string, number>> = {};
    const sourceData = yearData[coverageSource] || {};
    const lineaData = sourceData[linea] || {};

    if (sedeFilter === 'Todas') {
      Object.keys(lineaData).forEach(sede => {
        Object.keys(lineaData[sede]).forEach(modality => {
          if (!rawData[modality]) {
            rawData[modality] = {};
            MONTHS.forEach(m => rawData[modality][m.key] = 0);
          }
          const months = lineaData[sede][modality];
          MONTHS.forEach(m => {
             rawData[modality][m.key] += (months[m.key] || 0);
          });
        });
      });
    } else {
      if (lineaData[sedeFilter]) {
        Object.keys(lineaData[sedeFilter]).forEach(modality => {
           rawData[modality] = { ...lineaData[sedeFilter][modality] };
        });
      }
    }
    return rawData;
  };

  const data2026 = useMemo(() => getModalityData(modalitiesData2026Raw, activeTab), [activeTab, sedeFilter, coverageSource]);
  const data2025 = useMemo(() => getModalityData(modalitiesData2025Raw, activeTab), [activeTab, sedeFilter, coverageSource]);

  const allModalities = useMemo(() => {
    const set = new Set([...Object.keys(data2025), ...Object.keys(data2026)]);
    return Array.from(set).sort();
  }, [data2025, data2026]);

  const [selectedModalities, setSelectedModalities] = useState<string[]>([]);

  // Update selected modality when tab changes if current is not in the list
  useMemo(() => {
    if (allModalities.length > 0 && selectedModalities.length === 0) {
      setSelectedModalities([allModalities[0]]);
    }
    // Si cambias de tab, limpiamos si no existen en el nuevo tab
    const validSelections = selectedModalities.filter(m => allModalities.includes(m));
    if (validSelections.length !== selectedModalities.length) {
      setSelectedModalities(validSelections.length > 0 ? validSelections : (allModalities.length > 0 ? [allModalities[0]] : []));
    }
  }, [allModalities, selectedModalities]);

  const toggleModality = (mod: string) => {
    setSelectedModalities(prev => 
      prev.includes(mod) 
        ? prev.filter(m => m !== mod) 
        : [...prev, mod]
    );
  };

  const selectAll = () => {
    setSelectedModalities(allModalities);
  };

  const deselectAll = () => {
    setSelectedModalities([]);
  };

  const chartData = useMemo(() => {
    if (selectedModalities.length === 0) return [];

    return MONTHS.map(m => {
       const row: any = { month: m.label };
       
       selectedModalities.forEach(mod => {
         const mod2025 = data2025[mod] || {};
         const mod2026 = data2026[mod] || {};
         
         const is2026Available = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'].includes(m.key);
         
         row[`${mod} (2025)`] = mod2025[m.key] || 0;
         row[`${mod} (2026)`] = is2026Available ? (mod2026[m.key] || 0) : null;
       });

       return row;
    });
  }, [selectedModalities, data2025, data2026]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden page-break-inside-avoid my-6">
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row md:justify-between md:items-center bg-slate-50">
        <div>
          <h2 className="text-lg font-bold text-slate-800 font-display">Tendencia Comparativa por Modalidad (2025 vs 2026)</h2>
          <p className="text-sm text-slate-500 mt-1">
            Análisis de usuarios mes a mes (Permite selección múltiple)
          </p>
        </div>
        
        <div className="flex bg-slate-200 p-1 rounded-lg mt-4 md:mt-0 self-start md:self-auto">
          <button
            onClick={() => setActiveTab('Deporte')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'Deporte' 
                ? 'bg-white text-[#4285F4] shadow-sm' 
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Escuelas Deportivas
          </button>
          <button
            onClick={() => setActiveTab('Recreación')}
            className={`px-4 py-1.5 text-sm font-medium rounded-md transition-colors ${
              activeTab === 'Recreación' 
                ? 'bg-white text-[#4285F4] shadow-sm' 
                : 'text-slate-600 hover:text-slate-800'
            }`}
          >
            Talleres y Recreación
          </button>
        </div>
      </div>

      <div className="p-6">
        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
             <label className="text-sm font-semibold text-slate-700">Seleccionar Modalidades:</label>
             <div className="space-x-2">
               <button onClick={selectAll} className="text-xs text-[#4285F4] hover:underline">Seleccionar Todas</button>
               <span className="text-slate-300">|</span>
               <button onClick={deselectAll} className="text-xs text-slate-500 hover:underline">Limpiar</button>
             </div>
          </div>
          <div className="flex flex-wrap gap-2">
            {allModalities.map(mod => {
              const isSelected = selectedModalities.includes(mod);
              return (
                <button 
                  key={mod}
                  onClick={() => toggleModality(mod)}
                  className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors ${
                    isSelected 
                      ? 'bg-[#4285F4] text-white border-[#4285F4]' 
                      : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {mod}
                </button>
              )
            })}
          </div>
        </div>

        {selectedModalities.length > 0 ? (
          <div className="h-[450px] w-full mt-8">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={chartData}
                margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                <XAxis 
                  dataKey="month" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  dy={10}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: '#64748B', fontSize: 12 }}
                  dx={-10}
                  tickFormatter={(value) => value >= 1000 ? `${(value/1000).toFixed(1)}k` : value}
                />
                <Tooltip 
                   contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)' }}
                   formatter={(value: any, name: string) => [value?.toLocaleString('es-CO') || '0', name]}
                />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px' }} />
                
                {selectedModalities.map((mod, index) => {
                  const color = COLORS[index % COLORS.length];
                  return (
                    <React.Fragment key={mod}>
                      <Line 
                        name={`${mod} (2025)`}
                        type="monotone" 
                        dataKey={`${mod} (2025)`} 
                        stroke={color} 
                        strokeDasharray="5 5"
                        strokeWidth={2}
                        dot={{ r: 3, strokeWidth: 1 }}
                        activeDot={{ r: 5 }} 
                      >
                         <LabelList dataKey={`${mod} (2025)`} position="top" style={{ fontSize: '10px', fill: '#94a3b8' }} formatter={(val: number) => val > 0 ? val : ''} />
                      </Line>
                      <Line 
                        name={`${mod} (2026)`}
                        type="monotone" 
                        dataKey={`${mod} (2026)`} 
                        stroke={color} 
                        strokeWidth={3}
                        dot={{ r: 4, strokeWidth: 2 }}
                        activeDot={{ r: 6 }} 
                        connectNulls={false}
                      >
                         <LabelList dataKey={`${mod} (2026)`} position="top" style={{ fontSize: '11px', fill: color, fontWeight: 'bold' }} formatter={(val: number) => val > 0 ? val : ''} />
                      </Line>
                    </React.Fragment>
                  )
                })}
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-80 flex items-center justify-center text-slate-400">
            Selecciona al menos una modalidad para ver el gráfico.
          </div>
        )}
      </div>
    </div>
  );
}
