import React, { useState, useMemo } from 'react';
import { usePrintMode } from '../hooks/usePrintMode';
import modalitiesData from '../data/modalities_trend.json';

interface ModalitiesTableModuleProps {
  selectedMunicipality: string;
}

export default function ModalitiesTableModule({ selectedMunicipality }: ModalitiesTableModuleProps) {
  // Manejo de la sede seleccionada en el filtro local, por defecto la global
  const availableSedes = ['Todas', 'Pereira', 'Dosquebradas', 'Santa Rosa', 'Quinchía'];
  
  const [sedeFilter, setSedeFilter] = useState<string>(
    selectedMunicipality === 'ALL' ? 'Todas' : selectedMunicipality
  );

  // Helper para extraer la data según la sede filtrada
  const getTableData = (linea: 'Deporte' | 'Recreación') => {
    let rawData: Record<string, { Enero: number; Febrero: number; Marzo: number; Abril: number; Mayo: number }> = {};
    
    // @ts-ignore
    const lineaData = modalitiesData[linea] || {};

    if (sedeFilter === 'Todas') {
      // Sumar todas las sedes
      Object.keys(lineaData).forEach(sede => {
        Object.keys(lineaData[sede]).forEach(modality => {
          if (!rawData[modality]) {
            rawData[modality] = { Enero: 0, Febrero: 0, Marzo: 0, Abril: 0, Mayo: 0 };
          }
          const months = lineaData[sede][modality];
          rawData[modality].Enero += months.Enero || 0;
          rawData[modality].Febrero += months.Febrero || 0;
          rawData[modality].Marzo += months.Marzo || 0;
          rawData[modality].Abril += months.Abril || 0;
          rawData[modality].Mayo += months.Mayo || 0;
        });
      });
    } else {
      // Filtrar por sede específica
      if (lineaData[sedeFilter]) {
        rawData = lineaData[sedeFilter];
      }
    }

    // Convert to array and add totals
    const rows = Object.keys(rawData).map(modality => {
      const d = rawData[modality];
      const total = d.Enero + d.Febrero + d.Marzo + d.Abril + d.Mayo;
      return {
        name: modality,
        enero: d.Enero,
        febrero: d.Febrero,
        marzo: d.Marzo,
        abril: d.Abril,
        mayo: d.Mayo,
        total
      };
    });

    // Ordenar de mayor a menor por total
    return rows.sort((a, b) => b.total - a.total);
  };

  const deportesData = useMemo(() => getTableData('Deporte'), [sedeFilter]);
  const talleresData = useMemo(() => getTableData('Recreación'), [sedeFilter]);

  const renderTable = (title: string, data: any[]) => {
    if (data.length === 0) {
      return (
        <div className="mb-8">
          <h3 className="text-sm font-semibold text-slate-700 mb-3">{title}</h3>
          <p className="text-sm text-slate-400 italic">No hay datos reportados para esta sede.</p>
        </div>
      );
    }

    const colTotals = data.reduce(
      (acc, row) => ({
        enero: acc.enero + row.enero,
        febrero: acc.febrero + row.febrero,
        marzo: acc.marzo + row.marzo,
        abril: acc.abril + row.abril,
        mayo: acc.mayo + row.mayo,
        total: acc.total + row.total,
      }),
      { enero: 0, febrero: 0, marzo: 0, abril: 0, mayo: 0, total: 0 }
    );

    return (
      <div className="mb-8 last:mb-0 page-break-inside-avoid">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">{title}</h3>
        <div className="overflow-x-auto rounded-lg border border-slate-300">
          <table className="w-full text-left text-sm border-collapse">
            <thead>
              <tr className="bg-slate-100/80 border-b border-slate-300">
                <th className="py-2 px-3 border-r border-slate-300 font-semibold text-slate-700 w-1/4">Modalidad</th>
                <th className="py-2 px-2 border-r border-slate-300 font-semibold text-slate-700 text-center">Enero</th>
                <th className="py-2 px-2 border-r border-slate-300 font-semibold text-slate-700 text-center">Febrero</th>
                <th className="py-2 px-2 border-r border-slate-300 font-semibold text-slate-700 text-center">Marzo</th>
                <th className="py-2 px-2 border-r border-slate-300 font-semibold text-slate-700 text-center">Abril</th>
                <th className="py-2 px-2 border-r border-slate-300 font-semibold text-slate-700 text-center">Mayo</th>
                <th className="py-2 px-3 font-semibold text-slate-700 text-center bg-slate-200/50">Total</th>
              </tr>
            </thead>
            <tbody>
              {data.map((row, idx) => (
                <tr key={idx} className="border-b border-slate-200 hover:bg-slate-50">
                  <td className="py-1.5 px-3 border-r border-slate-200 text-slate-600 font-medium text-xs">{row.name}</td>
                  <td className="py-1.5 px-2 border-r border-slate-200 text-slate-600 text-center">{row.enero.toLocaleString('es-CO')}</td>
                  <td className="py-1.5 px-2 border-r border-slate-200 text-slate-600 text-center">{row.febrero.toLocaleString('es-CO')}</td>
                  <td className="py-1.5 px-2 border-r border-slate-200 text-slate-600 text-center">{row.marzo.toLocaleString('es-CO')}</td>
                  <td className="py-1.5 px-2 border-r border-slate-200 text-slate-600 text-center">{row.abril.toLocaleString('es-CO')}</td>
                  <td className="py-1.5 px-2 border-r border-slate-200 text-slate-600 text-center">{row.mayo.toLocaleString('es-CO')}</td>
                  <td className="py-1.5 px-3 text-emerald-700 text-center font-bold bg-slate-50/50">{row.total.toLocaleString('es-CO')}</td>
                </tr>
              ))}
              {/* Row Total */}
              <tr className="bg-slate-100/50 border-t-2 border-slate-300 font-semibold">
                <td className="py-2 px-3 border-r border-slate-300 text-slate-800">TOTAL</td>
                <td className="py-2 px-2 border-r border-slate-300 text-slate-800 text-center">{colTotals.enero.toLocaleString('es-CO')}</td>
                <td className="py-2 px-2 border-r border-slate-300 text-slate-800 text-center">{colTotals.febrero.toLocaleString('es-CO')}</td>
                <td className="py-2 px-2 border-r border-slate-300 text-slate-800 text-center">{colTotals.marzo.toLocaleString('es-CO')}</td>
                <td className="py-2 px-2 border-r border-slate-300 text-slate-800 text-center">{colTotals.abril.toLocaleString('es-CO')}</td>
                <td className="py-2 px-2 border-r border-slate-300 text-slate-800 text-center">{colTotals.mayo.toLocaleString('es-CO')}</td>
                <td className="py-2 px-3 text-slate-800 text-center bg-slate-200/50">{colTotals.total.toLocaleString('es-CO')}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <div>
          <h2 className="text-lg font-bold text-slate-800 font-display">Comparativo de Usuarios por Modalidad (2026)</h2>
          <p className="text-xs text-slate-400 mt-1">Tendencia mes a mes de los usuarios en Deportes y Recreación</p>
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
      
      {renderTable('Escuelas deportivas:', deportesData)}
      {renderTable('Talleres y Actividades de Recreación:', talleresData)}
      
    </div>
  );
}
