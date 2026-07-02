const XLSX = require('xlsx');

function inspectSuper(filename) {
    console.log(`\n--- Inspecting SUPER in ${filename} ---`);
    const workbook = XLSX.readFile(filename);
    const ws = workbook.Sheets['ENERO'];
    const json = XLSX.utils.sheet_to_json(ws, {header: 1});
    let foundSuper = false;
    for (let i = 0; i < json.length; i++) {
        if (typeof json[i][0] === 'string' && json[i][0].includes('INFORMACION SUPER')) {
            foundSuper = true;
        }
        if (foundSuper && json[i] && json[i].length > 0) {
            console.log(`[Line ${i}] ${JSON.stringify(json[i])}`);
        }
    }
}
inspectSuper('data_2026.xlsx');
inspectSuper('data_2026_recreacion.xlsx');
