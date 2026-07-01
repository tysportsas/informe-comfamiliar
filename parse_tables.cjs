const XLSX = require('xlsx');

function parseBothTables(filename) {
    const workbook = XLSX.readFile(filename);
    let facturados = { total: 0, cats: { A: 0, B: 0, C: 0, D: 0 } };
    let superInfo = { total: 0, cats: { A: 0, B: 0, C: 0, D: 0 } };
    
    for (const sheet of workbook.SheetNames) {
        const ws = workbook.Sheets[sheet];
        const json = XLSX.utils.sheet_to_json(ws, {header: 1});
        for (const row of json) {
            if (row[0] === 'TOTAL GENERAL') {
                facturados.total += row[1] || 0;
                facturados.cats.A += row[3] || 0;
                facturados.cats.B += row[4] || 0;
                facturados.cats.C += row[5] || 0;
                facturados.cats.D += row[6] || 0;
            } else if (row[0] === 'Total general' || row[0] === 'TOTAL GENERAL SUPER') {
                superInfo.total += row[1] || 0;
                superInfo.cats.A += row[3] || 0;
                superInfo.cats.B += row[4] || 0;
                superInfo.cats.C += row[5] || 0;
                superInfo.cats.D += row[6] || 0;
            }
        }
    }
    return { facturados, superInfo };
}

const dep = parseBothTables('data_2026.xlsx');
const rec = parseBothTables('data_2026_recreacion.xlsx');

function agg(t1, t2) {
    const total = t1.total + t2.total;
    const cats = {
        A: t1.cats.A + t2.cats.A,
        B: t1.cats.B + t2.cats.B,
        C: t1.cats.C + t2.cats.C,
        D: t1.cats.D + t2.cats.D
    };
    const catSum = cats.A + cats.B + cats.C + cats.D;
    const percentages = {
        A: Math.round((cats.A / catSum) * 100),
        B: Math.round((cats.B / catSum) * 100),
        C: Math.round((cats.C / catSum) * 100),
        D: Math.round((cats.D / catSum) * 100)
    };
    return { total, percentages };
}

const facturadosAgg = agg(dep.facturados, rec.facturados);
const superAgg = agg(dep.superInfo, rec.superInfo);

console.log(JSON.stringify({
    servicios_facturados: facturadosAgg,
    informacion_super: superAgg
}, null, 2));

