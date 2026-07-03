const fs = require('fs');
const XLSX = require('xlsx');

function parseFiles() {
    const months = ['ENERO', 'FEBRERO', 'MARZO', 'ABRIL', 'MAYO', 'JUNIO', 'JULIO', 'AGOSTO', 'SEPTIEMBRE', 'OCTUBRE', 'NOVIEMBRE'];
    const files = [
        { file: '../data_2025.xlsx', linea: 'Deporte' },
        { file: '../data_2025_recreacion.xlsx', linea: 'Recreación' }
    ];

    const data = {
        servicios_facturados: { Deporte: {}, Recreación: {} },
        informacion_super: { Deporte: { Todas: {} }, Recreación: { Todas: {} } }
    };

    files.forEach(({ file, linea }) => {
        try {
            const workbook = XLSX.readFile(file);
            
            months.forEach(month => {
                const mKey = month.charAt(0) + month.slice(1).toLowerCase(); // Enero
                const ws = workbook.Sheets[month];
                if (!ws) {
                    console.warn(`No se encontró la hoja ${month} en ${file}`);
                    return;
                }
                const json = XLSX.utils.sheet_to_json(ws, { header: 1 });
                
                let isSuper = false;
                let superTotalIndex = -1;

                for (let i = 0; i < json.length; i++) {
                    const row = json[i];
                    if (!row || row.length === 0) continue;
                    
                    const firstCell = typeof row[0] === 'string' ? row[0].trim() : '';
                    
                    if (firstCell.includes('INFORMACION SUPER')) {
                        isSuper = true;
                        continue;
                    }
                    
                    if (firstCell.includes('TOTAL GENERAL') || firstCell.includes('Total general')) {
                        continue; // Skip total rows
                    }
                    
                    if (isSuper && firstCell === 'ACTIVIDAD SUPER') {
                        // Find index of Total PERSONAS
                        superTotalIndex = row.findIndex(col => typeof col === 'string' && (col.includes('Total PERSONAS') || col === 'Total PERSON'));
                        if (superTotalIndex === -1) {
                            superTotalIndex = row.findIndex(col => typeof col === 'string' && col.includes('Total PERSONAS'));
                        }
                        continue;
                    }
                    
                    // Skip header rows like 'ESCUELAS DEPORTIVAS' which have no number in column 1 (for servicios) or superTotalIndex (for super)
                    if (isSuper) {
                        if (superTotalIndex > -1 && typeof row[superTotalIndex] === 'number') {
                            const val = row[superTotalIndex];
                            if (!data.informacion_super[linea].Todas[firstCell]) {
                                data.informacion_super[linea].Todas[firstCell] = { Enero:0, Febrero:0, Marzo:0, Abril:0, Mayo:0, Junio:0, Julio:0, Agosto:0, Septiembre:0, Octubre:0, Noviembre:0 };
                            }
                            data.informacion_super[linea].Todas[firstCell][mKey] += val;
                        }
                    } else {
                        // SERVICIOS FACTURADOS
                        if (firstCell !== '' && firstCell !== 'ACTIVIDAD' && typeof row[1] === 'number') {
                            const val = row[1];
                            let sede = 'Pereira';
                            const upperCell = firstCell.toUpperCase();
                            if (upperCell.includes('DOSQUEBRADAS')) sede = 'Dosquebradas';
                            else if (upperCell.includes('STA ROSA') || upperCell.includes('SANTA ROSA') || upperCell.includes('SANTAROSA')) sede = 'Santa Rosa';
                            else if (upperCell.includes('QUINCHIA') || upperCell.includes('QUINCHÍA')) sede = 'Quinchía';
                            
                            if (!data.servicios_facturados[linea][sede]) {
                                data.servicios_facturados[linea][sede] = {};
                            }
                            if (!data.servicios_facturados[linea][sede][firstCell]) {
                                data.servicios_facturados[linea][sede][firstCell] = { Enero:0, Febrero:0, Marzo:0, Abril:0, Mayo:0, Junio:0, Julio:0, Agosto:0, Septiembre:0, Octubre:0, Noviembre:0 };
                            }
                            data.servicios_facturados[linea][sede][firstCell][mKey] += val;
                        }
                    }
                }
            });
        } catch (e) {
            console.error(`Error procesando ${file}:`, e);
        }
    });

    fs.writeFileSync('../src/data/modalities_data_2025.json', JSON.stringify(data, null, 2));
    console.log('Saved to src/data/modalities_data_2025.json');
}

parseFiles();
