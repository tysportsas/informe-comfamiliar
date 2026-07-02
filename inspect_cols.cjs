const XLSX = require('xlsx');

function inspectColumns(filename) {
    const workbook = XLSX.readFile(filename);
    const ws = workbook.Sheets['ENERO'];
    const json = XLSX.utils.sheet_to_json(ws, {header: 1});
    console.log(`\n--- Columns in ${filename} (ENERO) ---`);
    for (let i = 0; i < 15; i++) {
        if (json[i] && json[i].length > 0) {
            console.log(`[Line ${i}] ${JSON.stringify(json[i])}`);
        }
    }
}
inspectColumns('data_2026.xlsx');
