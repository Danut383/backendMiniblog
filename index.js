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

// Inicializar base de datos al arrancar
async function initializeApp() {
  try {
    // Ejecutar setup de base de datos
    const { setupDatabase } = require('./scripts/setup-db');
    await setupDatabase();
    
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Verificar conexión
    await prisma.$connect();
    console.log('✅ Base de datos conectada correctamente');
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('❌ Error en inicialización:', error);
    // Continuar sin fallar la app
  }
}

const PORT = process.env.PORT || 4000;
app.listen(PORT, async () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
  await initializeApp();
});
