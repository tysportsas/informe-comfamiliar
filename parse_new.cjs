const XLSX = require('xlsx');
const workbook = XLSX.readFile('data_2026.xlsx');
console.log("Sheet names:", workbook.SheetNames);
let totalUsuarios = 0;
let cats = { A: 0, B: 0, C: 0, D: 0 };
for (const sheet of workbook.SheetNames) {
    const ws = workbook.Sheets[sheet];
    const json = XLSX.utils.sheet_to_json(ws, {header: 1});
    let monthUsuarios = 0;
    for (const row of json) {
        if (row[0] === 'TOTAL GENERAL') {
            monthUsuarios = row[1] || 0;
            totalUsuarios += monthUsuarios;
            cats.A += row[3] || 0;
            cats.B += row[4] || 0;
            cats.C += row[5] || 0;
            cats.D += row[6] || 0;
        }
    }
    console.log(`Sheet: ${sheet}, Month Total: ${monthUsuarios}`);
}
console.log('\nTotal 2026 Usuarios (Sum):', totalUsuarios);
console.log('Categories Total:', cats);

let totalCats = cats.A + cats.B + cats.C + cats.D;
console.log('Cat A %:', ((cats.A / totalCats) * 100).toFixed(1));
console.log('Cat B %:', ((cats.B / totalCats) * 100).toFixed(1));
console.log('Cat C %:', ((cats.C / totalCats) * 100).toFixed(1));
console.log('Cat D %:', ((cats.D / totalCats) * 100).toFixed(1));
