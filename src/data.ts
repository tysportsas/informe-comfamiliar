import { LineAllocation, ProgramModality, CoverageAllocation } from './types';

export const DEFAULT_LINE_ALLOCATION: LineAllocation = {
  deporte: 100, // 100% of DEPORTES goes to Deporte
  recreacion: 60, // 60% of RECREACION goes to Recreación
  actividadFisica: 25, // 25% of RECREACION goes to Actividad Física
  eventos: 15 // 15% of RECREACION goes to Eventos
};

export const DEFAULT_MODALITIES: ProgramModality[] = [
  // Deporte Modalities
  { id: 'dep-1', name: 'Fútbol', line: 'deporte', share2025: 50, share2026: 48 },
  { id: 'dep-2', name: 'Baloncesto', line: 'deporte', share2025: 25, share2026: 27 },
  { id: 'dep-3', name: 'Natación', line: 'deporte', share2025: 15, share2026: 15 },
  { id: 'dep-4', name: 'Patinaje', line: 'deporte', share2025: 10, share2026: 10 },

  // Recreación Modalities
  { id: 'rec-1', name: 'Vacaciones Recreativas', line: 'recreacion', share2025: 45, share2026: 40 },
  { id: 'rec-2', name: 'Talleres Creativos', line: 'recreacion', share2025: 35, share2026: 38 },
  { id: 'rec-3', name: 'Salidas Recreativas', line: 'recreacion', share2025: 20, share2026: 22 },

  // Actividad Física Modalities
  { id: 'act-1', name: 'Gimnasio y Fitness', line: 'actividadFisica', share2025: 40, share2026: 45 },
  { id: 'act-2', name: 'Clases de Aeróbicos', line: 'actividadFisica', share2025: 35, share2026: 30 },
  { id: 'act-3', name: 'Spinning', line: 'actividadFisica', share2025: 25, share2026: 25 },

  // Eventos Modalities
  { id: 'eve-1', name: 'Chef Infantil (Talleres)', line: 'eventos', share2025: 40, share2026: 42 },
  { id: 'eve-2', name: 'Festivales Temáticos', line: 'eventos', share2025: 35, share2026: 33 },
  { id: 'eve-3', name: 'Eventos Corporativos', line: 'eventos', share2025: 25, share2026: 25 }
];

export const DEFAULT_COVERAGE_ALLOCATION_2025: CoverageAllocation = {
  A: 45,
  B: 30,
  C: 15,
  D: 10
};

export const DEFAULT_COVERAGE_ALLOCATION_2026: CoverageAllocation = {
  A: 47,
  B: 29,
  C: 15,
  D: 9
};

// Default annual target beneficiaries (Cobertura)
export const DEFAULT_COVERAGE_TOTALS = {
  2025: 28450, // total beneficiaries
  2026: 31200  // total beneficiaries (to date)
};

export const MONTHS = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

export const MUNICIPALITIES = [
  { id: 'PEREIRA', name: 'Pereira', color: '#1E3A8A' },
  { id: 'DOSQUEBRADAS', name: 'Dosquebradas', color: '#10B981' },
  { id: 'SANTA ROSA', name: 'Santa Rosa', color: '#F59E0B' },
  { id: 'QUINCHIA', name: 'Quinchía', color: '#EF4444' }
];
