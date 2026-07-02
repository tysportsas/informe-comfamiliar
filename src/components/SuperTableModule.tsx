import React, { useMemo } from 'react';
import superData from '../data/super_table_data.json';

interface SuperTableModuleProps {
  monthsList: string[];
  sedeFilter: string;
}

interface SuperRow {
  modality: string;
  a_per: number;
  a_uso: number;
  b_per: number;
  b_uso: number;
  c_per: number;
  c_uso: number;
  d_per: number;
  d_uso: number;
  emp_per: number;
  emp_uso: number;
  total_per: number;
  total_uso: number;
}

export default function SuperTableModule({ monthsList, sedeFilter }: SuperTableModuleProps) {
  
  const aggregatedData = useMemo(() => {
    const uppercaseMonths = monthsList.map(m => m.toUpperCase());
    const result: Record<string, SuperRow> = {};

    const groups = sedeFilter === 'Todas' ? ['Deporte', 'Recreación'] : [sedeFilter];

    groups.forEach(group => {
      // @ts-ignore
      const groupData = superData[group];
      if (!groupData) return;

      uppercaseMonths.forEach(month => {
        const monthRows: SuperRow[] = groupData[month] || [];
        monthRows.forEach(row => {
          // ONLY INCLUDE Recreación dirigida and Vacaciones recreativas
          if (row.modality !== 'Recreación dirigida' && row.modality !== 'Vacaciones recreativas') {
            return;
          }

          if (!result[row.modality]) {
            result[row.modality] = {
              modality: row.modality,
              a_per: 0, a_uso: 0,
              b_per: 0, b_uso: 0,
              c_per: 0, c_uso: 0,
              d_per: 0, d_uso: 0,
              emp_per: 0, emp_uso: 0,
              total_per: 0, total_uso: 0
            };
          }
          const curr = result[row.modality];
          curr.a_per += row.a_per;
          curr.a_uso += row.a_uso;
          curr.b_per += row.b_per;
          curr.b_uso += row.b_uso;
          curr.c_per += row.c_per;
          curr.c_uso += row.c_uso;
          curr.d_per += row.d_per;
          curr.d_uso += row.d_uso;
          curr.emp_per += row.emp_per;
          curr.emp_uso += row.emp_uso;
          curr.total_per += row.total_per;
          curr.total_uso += row.total_uso;
        });
      });
    });

    return Object.values(result).sort((a, b) => b.total_per - a.total_per);
  }, [monthsList, sedeFilter]);

  const totalRow = useMemo(() => {
    return aggregatedData.reduce((acc, curr) => {
      acc.a_per += curr.a_per;
      acc.a_uso += curr.a_uso;
      acc.b_per += curr.b_per;
      acc.b_uso += curr.b_uso;
      acc.c_per += curr.c_per;
      acc.c_uso += curr.c_uso;
      acc.d_per += curr.d_per;
      acc.d_uso += curr.d_uso;
      acc.emp_per += curr.emp_per;
      acc.emp_uso += curr.emp_uso;
      acc.total_per += curr.total_per;
      acc.total_uso += curr.total_uso;
      return acc;
    }, {
      modality: 'Total general',
      a_per: 0, a_uso: 0,
      b_per: 0, b_uso: 0,
      c_per: 0, c_uso: 0,
      d_per: 0, d_uso: 0,
      emp_per: 0, emp_uso: 0,
      total_per: 0, total_uso: 0
    });
  }, [aggregatedData]);

  const formatInt = (value: number) => {
    if (!value) return '0';
    return value.toLocaleString('es-CO');
  };

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 font-display">
            Información Súper
          </h2>
          <p className="text-sm text-slate-500">
            Consolidado por categoría y usos ({monthsList.length === 1 ? monthsList[0] : `Acumulado ${monthsList[0]} - ${monthsList[monthsList.length - 1]}`})
          </p>
        </div>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-sm text-left text-slate-600">
          <thead className="bg-[#a4c2f4] text-xs uppercase font-bold text-slate-900 border-b-2 border-slate-800">
            <tr>
              <th rowSpan={2} className="px-4 py-3 border-r border-slate-300 w-[20%] text-center align-middle">
                ACTIVIDAD SUPER
              </th>
              <th colSpan={2} className="px-2 py-2 border-r border-slate-300 text-center bg-[#f4cccc]">A</th>
              <th colSpan={2} className="px-2 py-2 border-r border-slate-300 text-center bg-[#f4cccc]">B</th>
              <th colSpan={2} className="px-2 py-2 border-r border-slate-300 text-center bg-[#f4cccc]">C</th>
              <th colSpan={2} className="px-2 py-2 border-r border-slate-300 text-center bg-[#f4cccc]">D</th>
              <th colSpan={2} className="px-2 py-2 border-r border-slate-300 text-center bg-[#f4cccc]">Empresas</th>
              <th rowSpan={2} className="px-3 py-3 border-r border-slate-300 text-center bg-[#f4cccc] align-middle">Total PERSONAS</th>
              <th rowSpan={2} className="px-3 py-3 text-center bg-[#f4cccc] align-middle">Total USOS</th>
            </tr>
            <tr className="bg-[#f4cccc]">
              <th className="px-2 py-1.5 border-r border-t border-slate-300 text-center text-[10px]">PERSONAS</th>
              <th className="px-2 py-1.5 border-r border-t border-slate-300 text-center text-[10px]">USOS</th>
              <th className="px-2 py-1.5 border-r border-t border-slate-300 text-center text-[10px]">PERSONAS</th>
              <th className="px-2 py-1.5 border-r border-t border-slate-300 text-center text-[10px]">USOS</th>
              <th className="px-2 py-1.5 border-r border-t border-slate-300 text-center text-[10px]">PERSONAS</th>
              <th className="px-2 py-1.5 border-r border-t border-slate-300 text-center text-[10px]">USOS</th>
              <th className="px-2 py-1.5 border-r border-t border-slate-300 text-center text-[10px]">PERSONAS</th>
              <th className="px-2 py-1.5 border-r border-t border-slate-300 text-center text-[10px]">USOS</th>
              <th className="px-2 py-1.5 border-r border-t border-slate-300 text-center text-[10px]">PERSONAS</th>
              <th className="px-2 py-1.5 border-t border-slate-300 text-center text-[10px]">USOS</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {aggregatedData.map((row, idx) => (
              <tr key={idx} className="hover:bg-slate-50 transition-colors">
                <td className="px-4 py-2.5 font-medium text-slate-800 border-r border-slate-200 whitespace-nowrap">
                  {row.modality}
                </td>
                <td className="px-2 py-2.5 text-center border-r border-slate-100">{formatInt(row.a_per)}</td>
                <td className="px-2 py-2.5 text-center border-r border-slate-200">{formatInt(row.a_uso)}</td>
                <td className="px-2 py-2.5 text-center border-r border-slate-100">{formatInt(row.b_per)}</td>
                <td className="px-2 py-2.5 text-center border-r border-slate-200">{formatInt(row.b_uso)}</td>
                <td className="px-2 py-2.5 text-center border-r border-slate-100">{formatInt(row.c_per)}</td>
                <td className="px-2 py-2.5 text-center border-r border-slate-200">{formatInt(row.c_uso)}</td>
                <td className="px-2 py-2.5 text-center border-r border-slate-100">{formatInt(row.d_per)}</td>
                <td className="px-2 py-2.5 text-center border-r border-slate-200">{formatInt(row.d_uso)}</td>
                <td className="px-2 py-2.5 text-center border-r border-slate-100">{formatInt(row.emp_per)}</td>
                <td className="px-2 py-2.5 text-center border-r border-slate-200">{formatInt(row.emp_uso)}</td>
                <td className="px-3 py-2.5 text-center font-bold text-emerald-700 bg-emerald-50/50 border-r border-emerald-100">
                  {formatInt(row.total_per)}
                </td>
                <td className="px-3 py-2.5 text-center font-bold text-slate-800 bg-slate-50">
                  {formatInt(row.total_uso)}
                </td>
              </tr>
            ))}
            
            {/* Total Row */}
            <tr className="bg-[#f4cccc]/70 font-bold text-slate-900 border-t-2 border-slate-300">
              <td className="px-4 py-3 border-r border-slate-300">
                Total general
              </td>
              <td className="px-2 py-3 text-center border-r border-slate-300">{formatInt(totalRow.a_per)}</td>
              <td className="px-2 py-3 text-center border-r border-slate-300">{formatInt(totalRow.a_uso)}</td>
              <td className="px-2 py-3 text-center border-r border-slate-300">{formatInt(totalRow.b_per)}</td>
              <td className="px-2 py-3 text-center border-r border-slate-300">{formatInt(totalRow.b_uso)}</td>
              <td className="px-2 py-3 text-center border-r border-slate-300">{formatInt(totalRow.c_per)}</td>
              <td className="px-2 py-3 text-center border-r border-slate-300">{formatInt(totalRow.c_uso)}</td>
              <td className="px-2 py-3 text-center border-r border-slate-300">{formatInt(totalRow.d_per)}</td>
              <td className="px-2 py-3 text-center border-r border-slate-300">{formatInt(totalRow.d_uso)}</td>
              <td className="px-2 py-3 text-center border-r border-slate-300">{formatInt(totalRow.emp_per)}</td>
              <td className="px-2 py-3 text-center border-r border-slate-300">{formatInt(totalRow.emp_uso)}</td>
              <td className="px-3 py-3 text-center text-emerald-800 border-r border-slate-300">
                {formatInt(totalRow.total_per)}
              </td>
              <td className="px-3 py-3 text-center text-slate-900">
                {formatInt(totalRow.total_uso)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
