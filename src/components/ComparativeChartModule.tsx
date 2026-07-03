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

  const [selectedModality, setSelectedModality] = useState<string>('');

  // Update selected modality when tab changes if current is not in the list
  useMemo(() => {
    if (allModalities.length > 0 && (!selectedModality || !allModalities.includes(selectedModality))) {
      setSelectedModality(allModalities[0]);
    }
  }, [allModalities, selectedModality]);

  const chartData = useMemo(() => {
    if (!selectedModality) return [];
    
    const mod2025 = data2025[selectedModality] || {};
    const mod2026 = data2026[selectedModality] || {};

    return MONTHS.map(m => {
       // Only show 2026 up to Junio (since data is incomplete after that for now)
       const is2026Available = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio'].includes(m.key);
       return {
         month: m.label,
         '2025': mod2025[m.key] || 0,
         '2026': is2026Available ? (mod2026[m.key] || 0) : null
       };
    });
  }, [selectedModality, data2025, data2026]);

  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden page-break-inside-avoid my-6">
      <div className="px-6 py-5 border-b border-slate-100 flex flex-col md:flex-row md:justify-between md:items-center bg-slate-50">
        <div>
          <h2 className="text-lg font-bold text-slate-800 font-display">Tendencia Comparativa por Modalidad (2025 vs 2026)</h2>
          <p className="text-sm text-slate-500 mt-1">
            Análisis de usuarios mes a mes
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
        <div className="mb-6 flex flex-col md:flex-row md:items-center gap-4">
          <label htmlFor="modality-select" className="text-sm font-semibold text-slate-700 whitespace-nowrap">
            Seleccionar Modalidad:
          </label>
          <select
            id="modality-select"
            value={selectedModality}
            onChange={(e) => setSelectedModality(e.target.value)}
            className="w-full md:w-96 rounded-lg border-slate-300 py-2 pl-3 pr-8 text-sm focus:border-[#4285F4] focus:ring-[#4285F4] bg-slate-50 shadow-sm"
          >
            {allModalities.map(mod => (
              <option key={mod} value={mod}>{mod}</option>
            ))}
          </select>
        </div>

        {selectedModality ? (
          <div className="h-[450px] w-full mt-4">
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
                
                <Line 
                  name="Año 2025"
                  type="monotone" 
                  dataKey="2025" 
                  stroke="#94a3b8" 
                  strokeDasharray="5 5"
                  strokeWidth={2}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }} 
                >
                   <LabelList dataKey="2025" position="top" style={{ fontSize: '11px', fill: '#94a3b8' }} formatter={(val: number) => val > 0 ? val : ''} />
                </Line>
                <Line 
                  name="Año 2026"
                  type="monotone" 
                  dataKey="2026" 
                  stroke="#4285F4" 
                  strokeWidth={3}
                  dot={{ r: 4, strokeWidth: 2 }}
                  activeDot={{ r: 6 }} 
                  connectNulls={false}
                >
                   <LabelList dataKey="2026" position="top" style={{ fontSize: '12px', fill: '#4285F4', fontWeight: 'bold' }} formatter={(val: number) => val > 0 ? val : ''} />
                </Line>
              </LineChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="h-[450px] flex items-center justify-center text-slate-400">
            No hay datos disponibles para la sede seleccionada.
          </div>
        )}
      </div>
    </div>
  );
}
