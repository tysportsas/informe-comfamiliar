require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Missing Supabase credentials in .env");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function seed() {
  console.log("Starting DB seed...");
  
  // 1. Modalities
  const modDataRaw = fs.readFileSync(path.join(__dirname, '../src/data/modalities_trend.json'), 'utf8');
  const modData = JSON.parse(modDataRaw);
  
  const modalitiesRows = [];
  for (const [linea, sedes] of Object.entries(modData)) {
    for (const [sede, modalities] of Object.entries(sedes)) {
      for (const [modality, months] of Object.entries(modalities)) {
        modalitiesRows.push({
          linea,
          sede,
          modality,
          enero: months.Enero || 0,
          febrero: months.Febrero || 0,
          marzo: months.Marzo || 0,
          abril: months.Abril || 0,
          mayo: months.Mayo || 0
        });
      }
    }
  }
  
  if (modalitiesRows.length > 0) {
    console.log(`Inserting ${modalitiesRows.length} modalities rows...`);
    const { error } = await supabase.from('modalities_trend').insert(modalitiesRows);
    if (error) console.error("Error inserting modalities:", error.message);
    else console.log("Modalities inserted successfully!");
  }

  // 2. Categories
  const catDataRaw = fs.readFileSync(path.join(__dirname, '../src/data/categories_trend.json'), 'utf8');
  const catData = JSON.parse(catDataRaw);
  
  const categoriesRows = [];
  for (const [sede, months] of Object.entries(catData)) {
    for (const [month, values] of Object.entries(months)) {
      categoriesRows.push({
        sede,
        month,
        cat_a: values.A || 0,
        cat_b: values.B || 0,
        cat_c: values.C || 0,
        cat_d: values.D || 0
      });
    }
  }
  
  if (categoriesRows.length > 0) {
    console.log(`Inserting ${categoriesRows.length} categories rows...`);
    const { error } = await supabase.from('categories_trend').insert(categoriesRows);
    if (error) console.error("Error inserting categories:", error.message);
    else console.log("Categories inserted successfully!");
  }

  console.log("Seeding complete!");
}

seed();
