const XLSX = require('xlsx');

function inspectRows(filename) {
    const workbook = XLSX.readFile(filename);
    const ws = workbook.Sheets['ENERO'];
    const json = XLSX.utils.sheet_to_json(ws, {header: 1});
    console.log(`\n--- Inspecting ${filename} (ENERO) ---`);
    let tableType = "SERVICIOS"; // assume first table is SERVICIOS until we hit INFORMACION SUPER
    
    for (let i = 0; i < json.length; i++) {
        const row = json[i];
        if (typeof row[0] === 'string' && row[0].includes('INFORMACION SUPER')) {
            tableType = "SUPER";
            console.log(`[Line ${i}] --- SWITCHING TO INFORMACION SUPER ---`);
            continue;
        }
        if (row[0] === 'TOTAL GENERAL' || row[0] === 'Total general' || row[0] === 'TOTAL GENERAL SUPER') {
            console.log(`[Line ${i}] FOUND TOTAL: ${row[0]} in ${tableType}`);
            continue;
        }
        
        // Let's print non-empty string rows that look like modalities
        if (typeof row[0] === 'string' && row[0].trim().length > 0 && typeof row[1] === 'number') {
            console.log(`[${tableType}] ${row[0].trim()} -> ${row[1]}`);
        }
    }
}

inspectRows('data_2026.xlsx');
inspectRows('data_2026_recreacion.xlsx');
