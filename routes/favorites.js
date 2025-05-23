const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authenticate = require('../utils/authenticate');

// Obtener favoritos del usuario
router.get('/user', authenticate, async (req, res) => {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    });
    
    res.json(favorites);
  } catch (error) {
    console.error('Error obteniendo favoritos:', error);
    res.status(500).json({ 
      error: 'Error al obtener favoritos',
      message: error.message 
    });
  }
});

// Verificar si una película es favorita
router.get('/check/:movieId', authenticate, async (req, res) => {
  try {
    const { movieId } = req.params;
    
    const favorite = await prisma.favorite.findFirst({
      where: {
        userId: req.userId,
        movieId: parseInt(movieId)
      }
    });
    
    res.json({ isFavorite: !!favorite });
  } catch (error) {
    console.error('Error verificando favorito:', error);
    res.status(500).json({ 
      error: 'Error al verificar favorito',
      message: error.message 
    });
  }
});

// Agregar/quitar favorito (toggle)
router.post('/toggle', authenticate, async (req, res) => {
  try {
    const { movieId, movieTitle, posterPath } = req.body;
    
    if (!movieId) {
      return res.status(400).json({ error: 'movieId es requerido' });
    }

    // Verificar si ya es favorito
    const existingFavorite = await prisma.favorite.findFirst({
      where: {
        userId: req.userId,
        movieId: parseInt(movieId)
      }
    });

    if (existingFavorite) {
      // Remover de favoritos
      await prisma.favorite.delete({
        where: { id: existingFavorite.id }
      });
      
      res.json({ 
        isFavorite: false, 
        message: 'Removido de favoritos' 
      });
    } else {
      // Agregar a favoritos
      const favorite = await prisma.favorite.create({
        data: {
          userId: req.userId,
          movieId: parseInt(movieId),
          movieTitle: movieTitle || '',
          posterPath: posterPath || ''
        }
      });
      
      res.json({ 
        isFavorite: true, 
        message: 'Agregado a favoritos',
        favorite 
      });
    }
  } catch (error) {
    console.error('Error toggle favorito:', error);
    res.status(500).json({ 
      error: 'Error al cambiar favorito',
      message: error.message 
    });
  }
});

module.exports = router;
