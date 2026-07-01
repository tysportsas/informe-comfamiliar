export interface SubAccounts {
  [accountName: string]: number[];
}

export interface GroupData {
  name: string;
  totalByMonth?: { [month: string]: number };
  subAccounts: SubAccounts;
  totals: number[];
}

export interface YearData {
  [groupName: string]: GroupData;
}

export interface ReportData {
  years: {
    '2025': YearData;
    '2026': YearData;
  };
}

export interface ModalityAllocation {
  name: string;
  share: number; // Percentage (e.g. 50 for 50%)
}

export interface LineAllocation {
  deporte: number; // percentage of DEPORTES rows (100)
  recreacion: number; // percentage of RECREACION rows (default 60)
  actividadFisica: number; // percentage of RECREACION rows (default 25)
  eventos: number; // percentage of RECREACION rows (default 15)
}

export interface CoverageAllocation {
  A: number; // percentage
  B: number; // percentage
  C: number; // percentage
  D: number; // percentage
}

export interface ProgramModality {
  id: string;
  name: string;
  line: 'deporte' | 'recreacion' | 'actividadFisica' | 'eventos';
  share2025: number; // share of the line's income
  share2026: number; // share of the line's income
}
