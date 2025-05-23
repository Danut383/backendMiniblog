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
    const { PrismaClient } = require('@prisma/client');
    const prisma = new PrismaClient();
    
    // Verificar conexión y crear tablas si no existen
    await prisma.$connect();
    console.log('✅ Base de datos conectada correctamente');
    
    // Intentar crear las tablas usando raw SQL si no existen
    try {
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "users" (
          "id" SERIAL NOT NULL,
          "email" TEXT NOT NULL,
          "password" TEXT NOT NULL,
          "name" TEXT,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "users_email_key" UNIQUE ("email")
        );
      `;
      
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "reviews" (
          "id" SERIAL NOT NULL,
          "title" TEXT NOT NULL,
          "content" TEXT NOT NULL,
          "rating" INTEGER NOT NULL DEFAULT 0,
          "movieId" INTEGER NOT NULL,
          "movieTitle" TEXT,
          "posterPath" TEXT,
          "userId" INTEGER NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "reviews_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "reviews_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE
        );
      `;
      
      await prisma.$executeRaw`
        CREATE TABLE IF NOT EXISTS "comments" (
          "id" SERIAL NOT NULL,
          "content" TEXT NOT NULL,
          "userId" INTEGER NOT NULL,
          "reviewId" INTEGER NOT NULL,
          "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
          CONSTRAINT "comments_pkey" PRIMARY KEY ("id"),
          CONSTRAINT "comments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE,
          CONSTRAINT "comments_reviewId_fkey" FOREIGN KEY ("reviewId") REFERENCES "reviews"("id") ON DELETE CASCADE
        );
      `;
      
      console.log('✅ Tablas verificadas/creadas correctamente');
    } catch (tableError) {
      console.log('⚠️  Las tablas probablemente ya existen:', tableError.message);
    }
    
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
