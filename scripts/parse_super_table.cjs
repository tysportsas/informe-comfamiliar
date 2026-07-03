const XLSX = require('xlsx');
const fs = require('fs');

const months = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO'];

const files = {
  Deporte: '../data_2026.xlsx',
  Recreación: '../data_2026_recreacion.xlsx'
};

const outputData = {
  Deporte: {},
  Recreación: {}
};

function parseSuperTable(filePath, groupName) {
  const workbook = XLSX.readFile(filePath);

  months.forEach(month => {
    outputData[groupName][month] = [];
    
    if (!workbook.Sheets[month]) return;
    
    const ws = workbook.Sheets[month];
    const json = XLSX.utils.sheet_to_json(ws, { header: 1 });
    
    let inSuperBlock = false;
    
    for (let i = 0; i < json.length; i++) {
      const row = json[i];
      if (!row) continue;
      
      const cell0 = typeof row[0] === 'string' ? row[0].trim() : '';
      
      if (cell0.includes('INFORMACION SUPER')) {
        inSuperBlock = true;
        i += 2; // Skip headers (ACTIVIDAD SUPER, PERSONAS/USOS)
        continue;
      }
      
      if (inSuperBlock) {
        if (!cell0 || cell0 === '' || cell0.includes('Total general')) {
          inSuperBlock = false; // End of block
          break;
        }
        
        let rowData;
        if (groupName === 'Deporte') {
          // Deporte doesn't have Empresas
          rowData = {
            modality: cell0,
            a_per: row[1] || 0,
            a_uso: row[2] || 0,
            b_per: row[3] || 0,
            b_uso: row[4] || 0,
            c_per: row[5] || 0,
            c_uso: row[6] || 0,
            d_per: row[7] || 0,
            d_uso: row[8] || 0,
            emp_per: 0,
            emp_uso: 0,
            total_per: row[9] || 0,
            total_uso: row[10] || 0,
          };
        } else {
          // Recreacion has Empresas
          rowData = {
            modality: cell0,
            a_per: row[1] || 0,
            a_uso: row[2] || 0,
            b_per: row[3] || 0,
            b_uso: row[4] || 0,
            c_per: row[5] || 0,
            c_uso: row[6] || 0,
            d_per: row[7] || 0,
            d_uso: row[8] || 0,
            emp_per: row[9] || 0,
            emp_uso: row[10] || 0,
            total_per: row[11] || 0,
            total_uso: row[12] || 0,
          };
        }
        
        outputData[groupName][month].push(rowData);
      }
    }
  });
}

parseSuperTable(files.Deporte, 'Deporte');
parseSuperTable(files.Recreación, 'Recreación');

fs.writeFileSync('../src/data/super_table_data.json', JSON.stringify(outputData, null, 2));
console.log('Successfully generated src/data/super_table_data.json');
