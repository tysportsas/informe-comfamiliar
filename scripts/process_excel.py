import pandas as pd
import json
import math

# Mapping specific to file1.xlsx (Deporte)
DEPORTE_CODES = {
    '3734': 'Pereira',
    '3753': 'Dosquebradas',
    '3754': 'Santa Rosa',
    '3755': 'Quinchía'
}

# Mapping specific to file2.xlsx (Recreación)
RECREACION_CODES = {
    '3792': 'Pereira',
    '3791': 'Dosquebradas',
    '3794': 'Santa Rosa',
    '3795': 'Quinchía'
}

MONTHS_MAP = {
    'ENERO': 'Enero',
    'FEBRERO': 'Febrero',
    'MARZO': 'Marzo',
    'ABRIL': 'Abril',
    'MAYO': 'Mayo',
    'JUNIO': 'Junio'
}

def process_file(filepath, codes_map, line_name):
    # This will return a dictionary: {Sede: {Modality: {Month: Users}}}
    line_data = {sede: {} for sede in codes_map.values()}
    
    xls = pd.ExcelFile(filepath)
    for sheet in xls.sheet_names:
        if sheet not in MONTHS_MAP:
            continue
        
        month_label = MONTHS_MAP[sheet]
        df = pd.read_excel(filepath, sheet_name=sheet, header=None)
        
        current_sede = None
        
        for idx, row in df.iterrows():
            col0 = row[0]
            if pd.isna(col0):
                continue
            
            val0 = str(col0).strip()
            
            # Remove '.0' if it was parsed as float string (e.g. '3734.0')
            if val0.endswith('.0'):
                val0 = val0[:-2]
                
            # Check if this row is a municipality header code
            if val0 in codes_map:
                current_sede = codes_map[val0]
                continue
            
            # If we are under a valid municipality header, try parsing modality data
            if current_sede and isinstance(val0, str) and not val0.isdigit():
                # Filter out grand total rows or header rows
                if val0.startswith('NÚMERO DE SERVICIOS') or val0.startswith('ACTIVIDAD') or val0.startswith('ESCUELAS DEPORTIVAS'):
                    continue
                
                modality_name = val0.strip()
                usuarios = row[1]
                
                # Check if 'usuarios' is a valid number
                if pd.notna(usuarios) and isinstance(usuarios, (int, float)):
                    if modality_name not in line_data[current_sede]:
                        line_data[current_sede][modality_name] = {m: 0 for m in MONTHS_MAP.values()}
                        
                    line_data[current_sede][modality_name][month_label] = int(usuarios)
                    
    return line_data

def main():
    file1 = "../data_2026.xlsx"
    file2 = "../data_2026_recreacion.xlsx"
    
    print("Processing Deportes...")
    deporte_data = process_file(file1, DEPORTE_CODES, 'Deporte')
    
    print("Processing Recreación...")
    recreacion_data = process_file(file2, RECREACION_CODES, 'Recreación')
    
    final_data = {
        'Deporte': deporte_data,
        'Recreación': recreacion_data
    }
    
    out_path = '../src/data/modalities_trend.json'
    with open(out_path, 'w', encoding='utf-8') as f:
        json.dump(final_data, f, ensure_ascii=False, indent=2)
        
    print(f"Data successfully exported to {out_path}")

if __name__ == '__main__':
    main()
