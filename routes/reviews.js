const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authenticate = require('../utils/authenticate');

// Obtener o crear reseña
router.post('/get-or-create', authenticate, async (req, res) => {
  const { movieId, posterPath, movieTitle } = req.body;
  if (!movieId) return res.status(400).json({ error: 'movieId requerido' });
  try {
    let review = await prisma.review.findFirst({
      where: { movieId: Number(movieId), userId: req.userId },
    });
    if (!review) {
      review = await prisma.review.create({
        data: {
          movieId: Number(movieId),
          posterPath: posterPath || null,
          title: 'Sin título',
          content: '',
          rating: 0,
          movieTitle: movieTitle || null,
          userId: req.userId,
        },
      });
    }
    res.json(review);
  } catch (err) {
    console.error('❌ Error en get-or-create:', err);
    res.status(500).json({ error: 'Error interno', message: err.message });
  }
});

// Obtener reseñas por movieId
router.get('/m/:movieId', async (req, res) => {
  const { movieId } = req.params;
  try {
    const reviews = await prisma.review.findMany({
      where: { movieId: Number(movieId) },
      include: { user: true },
    });
    res.json(reviews);
  } catch (err) {
    console.error('❌ Error en GET /m/:movieId:', err);
    res.status(500).json({ error: 'Error al obtener reseñas por película', message: err.message });
  }
});

// Redirección /movie/:id a /m/:id
router.get('/movie/:movieId', (req, res) => {
  try {
    res.redirect(`/api/reviews/m/${req.params.movieId}`);
  } catch (err) {
    console.error('❌ Error redireccionando:', err);
    res.status(500).json({ error: 'Error en redirección', message: err.message });
  }
});

// Crear o actualizar reseña
router.post('/', authenticate, async (req, res) => {
  const { movieId, title, content, rating, posterPath, movieTitle } = req.body;
  try {
    if (!movieId || isNaN(Number(movieId))) return res.status(400).json({ error: 'movieId inválido' });
    if (!title || !content) return res.status(400).json({ error: 'Título y contenido son requeridos' });

    const existing = await prisma.review.findFirst({
      where: { movieId: Number(movieId), userId: req.userId },
    });

    if (existing) {
      const updated = await prisma.review.update({
        where: { id: existing.id },
        data: {
          title,
          content,
          rating: Number(rating) || 0,
          posterPath: posterPath || existing.posterPath,
          movieTitle: movieTitle || existing.movieTitle,
        },
      });
      return res.json(updated);
    }

    const review = await prisma.review.create({
      data: {
        movieId: Number(movieId),
        title,
        content,
        rating: Number(rating) || 0,
        posterPath: posterPath || null,
        movieTitle: movieTitle || null,
        userId: req.userId,
      },
    });

    res.status(201).json(review);
  } catch (err) {
    console.error('🛑 ERROR AL CREAR RESEÑA:', err);
    res.status(500).json({
      error: 'Error al crear reseña',
      message: err.message,
    });
  }
});

// Editar reseña
router.put('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  const { title, content, rating } = req.body;
  try {
    const review = await prisma.review.update({
      where: { id: Number(id), userId: req.userId },
      data: { title, content, rating },
    });
    res.json(review);
  } catch (err) {
    res.status(500).json({ error: 'Error al editar reseña', message: err.message });
  }
});

// Eliminar reseña
router.delete('/:id', authenticate, async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.review.delete({
      where: { id: Number(id), userId: req.userId },
    });
    res.json({ message: 'Reseña eliminada' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar reseña', message: err.message });
  }
});

// Obtener reseñas del usuario autenticado
router.get('/user/all', authenticate, async (req, res) => {
  try {
    const reviews = await prisma.review.findMany({
      where: { userId: req.userId },
      include: { comments: true },
    });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener tus reseñas', message: err.message });
  }
});
// Obtener reseñas públicas de un usuario por userId (sin autenticación)
router.get('/', async (req, res) => {
  const { userId } = req.query;
  if (!userId) return res.status(400).json({ error: 'userId requerido' });

  try {
    const reviews = await prisma.review.findMany({
      where: { userId: Number(userId) },
      include: { user: true },
    });
    res.json(reviews);
  } catch (err) {
    console.error('❌ Error en GET /reviews?userId=:', err);
    res.status(500).json({ error: 'Error al obtener reseñas públicas', message: err.message });
  }
});

module.exports = router;
