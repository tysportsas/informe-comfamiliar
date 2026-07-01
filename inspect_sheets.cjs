const XLSX = require('xlsx');

function inspectFile(filename) {
    const workbook = XLSX.readFile(filename);
    const ws = workbook.Sheets['ENERO'];
    const json = XLSX.utils.sheet_to_json(ws, {header: 1});
    console.log(`\n--- Inspecting ${filename} (ENERO) ---`);
    let tableType = "Unknown";
    for (let i = 0; i < json.length; i++) {
        const row = json[i];
        if (typeof row[0] === 'string' && row[0].includes('NUMERO DE SERVICIOS FACTURADOS')) {
            console.log(`[Line ${i}] Found NUMERO DE SERVICIOS FACTURADOS`);
            tableType = "SERVICIOS";
        }
        if (typeof row[0] === 'string' && row[0].includes('INFORMACION SUPER')) {
            console.log(`[Line ${i}] Found INFORMACION SUPER`);
            tableType = "SUPER";
        }
        if (row[0] === 'TOTAL GENERAL' || row[0] === 'Total general') {
            console.log(`[Line ${i}] Found ${row[0]} inside ${tableType}: Usuarios=${row[1]}, Usos=${row[2]}`);
        }
    }
}

inspectFile('data_2026.xlsx');
inspectFile('data_2026_recreacion.xlsx');
