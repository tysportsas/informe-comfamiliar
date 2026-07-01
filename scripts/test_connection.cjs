require('dotenv').config();
const { createClient } = require('@supabase/supabase-js');

const supabase = createClient(process.env.VITE_SUPABASE_URL, process.env.VITE_SUPABASE_ANON_KEY);

async function testConnection() {
  console.log("Testeando conexión a Supabase...");
  
  const start = Date.now();
  const { data: catData, error: catError } = await supabase.from('categories_trend').select('id').limit(1);
  const { data: modData, error: modError } = await supabase.from('modalities_trend').select('id').limit(1);
  const duration = Date.now() - start;

  if (catError || modError) {
    console.error("❌ Error de conectividad:", catError || modError);
  } else {
    console.log("✅ Conexión a Supabase exitosa!");
    console.log(`⏱️  Tiempo de respuesta: ${duration}ms`);
    console.log(`📊 Tabla Categories: OK (${catData.length} registros obtenidos)`);
    console.log(`📊 Tabla Modalities: OK (${modData.length} registros obtenidos)`);
  }
}

testConnection();
