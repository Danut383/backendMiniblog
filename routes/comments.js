const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const authenticate = require('../utils/authenticate');

// Obtener comentarios de una reseña
router.get('/:reviewId', async (req, res) => {
  const { reviewId } = req.params;
  try {
    const comments = await prisma.comment.findMany({
      where: { reviewId: Number(reviewId) },
      include: { user: true }
    });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener comentarios' });
  }
});

// Crear comentario (requiere login)
router.post('/:reviewId', authenticate, async (req, res) => {
  const { reviewId } = req.params;
  const { content } = req.body;
  try {
    const comment = await prisma.comment.create({
      data: {
        content,
        reviewId: Number(reviewId),
        userId: req.userId
      }
    });
    res.status(201).json(comment);
  } catch (err) {
    res.status(500).json({ error: 'Error al crear comentario' });
  }
});

// Obtener todos los comentarios del usuario autenticado
router.get('/user/all', authenticate, async (req, res) => {
  try {
    const comments = await prisma.comment.findMany({
      where: { userId: req.userId },
      include: { review: true }
    });
    res.json(comments);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener tus comentarios' });
  }
});

// Editar comentario propio
router.put('/:commentId', authenticate, async (req, res) => {
  const { commentId } = req.params;
  const { content } = req.body;
  try {
    const comment = await prisma.comment.update({
      where: { id: Number(commentId), userId: req.userId },
      data: { content }
    });
    res.json(comment);
  } catch (err) {
    res.status(500).json({ error: 'Error al editar comentario' });
  }
});

// Eliminar comentario propio
router.delete('/:commentId', authenticate, async (req, res) => {
  const { commentId } = req.params;
  try {
    await prisma.comment.delete({ where: { id: Number(commentId), userId: req.userId } });
    res.json({ message: 'Comentario eliminado' });
  } catch (err) {
    res.status(500).json({ error: 'Error al eliminar comentario' });
  }
});

module.exports = router;
