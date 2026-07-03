const XLSX = require('xlsx');

function getMonthlyData(filename) {
    const workbook = XLSX.readFile(filename);
    let monthlyFacturados = [];
    let monthlySuper = [];
    
    // We expect months in order, or we can just iterate the sheets
    for (const sheet of ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO']) {
        if (!workbook.Sheets[sheet]) {
            monthlyFacturados.push(0);
            monthlySuper.push(0);
            continue;
        }
        const ws = workbook.Sheets[sheet];
        const json = XLSX.utils.sheet_to_json(ws, {header: 1});
        let fMonth = 0;
        let sMonth = 0;
        let isSuper = false;
        for (const row of json) {
            if (row[0] && typeof row[0] === 'string' && row[0].includes('INFORMACION SUPER')) {
                isSuper = true;
            }
            if (row[0] === 'TOTAL GENERAL' || row[0] === 'Total general' || row[0] === 'TOTAL GENERAL SUPER') {
                if (!isSuper) {
                    fMonth += row[1] || 0;
                } else {
                    sMonth += row[1] || 0;
                }
            }
        }
        monthlyFacturados.push(fMonth);
        monthlySuper.push(sMonth);
    }
    return { monthlyFacturados, monthlySuper };
}

const dep = getMonthlyData('data_2026.xlsx');
const rec = getMonthlyData('data_2026_recreacion.xlsx');

const facturadosTotals = dep.monthlyFacturados.map((val, idx) => val + rec.monthlyFacturados[idx]);
const superTotals = dep.monthlySuper.map((val, idx) => val + rec.monthlySuper[idx]);

console.log("Facturados mes a mes:", facturadosTotals);
console.log("Super mes a mes:", superTotals);
