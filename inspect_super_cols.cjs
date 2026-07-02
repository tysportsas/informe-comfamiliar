const XLSX = require('xlsx');
const workbook = XLSX.readFile('data_2026_recreacion.xlsx');
const ws = workbook.Sheets['ENERO'];
const json = XLSX.utils.sheet_to_json(ws, {header: 1});

for (let i = 0; i < json.length; i++) {
    if (json[i][0] === 'Recreación dirigida') {
        console.log(`Row index: ${i}`);
        console.log(JSON.stringify(json[i]));
    }
}
