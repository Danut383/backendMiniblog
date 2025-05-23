const { execSync } = require('child_process');
const path = require('path');

async function setupDatabase() {
  try {
    console.log('🔄 Iniciando configuración de base de datos...');
    
    // Cambiar al directorio correcto
    process.chdir(path.join(__dirname, '..'));
    
    // Generar cliente Prisma
    console.log('📦 Generando cliente Prisma...');
    execSync('node_modules/.bin/prisma generate', { 
      stdio: 'inherit',
      env: { ...process.env, PATH: process.env.PATH + ':./node_modules/.bin' }
    });
    
    // Sincronizar base de datos
    console.log('🗄️  Sincronizando base de datos...');
    execSync('node_modules/.bin/prisma db push --accept-data-loss', { 
      stdio: 'inherit',
      env: { ...process.env, PATH: process.env.PATH + ':./node_modules/.bin' }
    });
    
    console.log('✅ Base de datos configurada correctamente');
  } catch (error) {
    console.error('❌ Error configurando base de datos:', error.message);
    // No fallar el proceso, continuar con la app
  }
}

// Ejecutar si es llamado directamente
if (require.main === module) {
  setupDatabase();
}

module.exports = { setupDatabase };
