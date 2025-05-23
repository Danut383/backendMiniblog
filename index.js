require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const authRoutes = require('./routes/auth');
const reviewRoutes = require('./routes/reviews');
const commentRoutes = require('./routes/comments');

app.use(cors({
  origin: [
    'http://localhost:3000',
    'http://localhost:5173',
    'https://cinemablog-frontend.onrender.com',
    /\.onrender\.com$/
  ],
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/reviews', reviewRoutes);
app.use('/api/comments', commentRoutes);

app.get('/', (req, res) => {
  res.send('API Miniblog funcionando');
});

// Inicializar Prisma y base de datos al arrancar
async function initializeApp() {
  try {
    // Generar cliente Prisma si no existe
    const { execSync } = require('child_process');
    try {
      execSync('npx prisma generate', { stdio: 'inherit' });
      console.log('✅ Cliente Prisma generado');
    } catch (error) {
      console.log('⚠️  Cliente Prisma ya existe o error menor:', error.message);
    }

    // Ejecutar db push si es necesario
    try {
      execSync('npx prisma db push --accept-data-loss', { stdio: 'inherit' });
      console.log('✅ Base de datos sincronizada');
    } catch (error) {
      console.log('⚠️  Base de datos ya sincronizada o error menor:', error.message);
    }

    // Verificar conexión
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.$connect();
    console.log('✅ Base de datos conectada correctamente');
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error en inicialización:', error);
    // No fallar la app por errores de inicialización
  }
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  await initializeApp();
});
