const XLSX = require('xlsx');
const workbook = XLSX.readFile('data.xlsx');
console.log("Sheet names:", workbook.SheetNames);
for (const sheet of workbook.SheetNames) {
    const ws = workbook.Sheets[sheet];
    const json = XLSX.utils.sheet_to_json(ws, {header: 1});
    console.log(`\nSheet: ${sheet} (rows: ${json.length})`);
    if (json.length > 0) {
        // print last 5 rows to see total general
        console.log("Last 5 rows:");
        console.log(json.slice(Math.max(0, json.length - 5)));
    }
}
