const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Registro
router.post('/register', async (req, res) => {
  const { email, password, name } = req.body;
  try {
    const userExists = await prisma.user.findUnique({ where: { email } });
    if (userExists) return res.status(400).json({ error: 'Usuario ya existe' });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, password: hashedPassword, name }
    });
    res.status(201).json({ message: 'Usuario creado', user: { id: user.id, email: user.email, name: user.name } });
  } catch (err) {
    res.status(500).json({ error: 'Error en el registro' });
  }
});

// Login
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return res.status(400).json({ error: 'Credenciales inválidas' });
    const valid = await bcrypt.compare(password, user.password);
    if (!valid) return res.status(400).json({ error: 'Credenciales inválidas' });
    
    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    // 🍪 COOKIES SEGURAS: Configurar cookie HttpOnly y Secure
    const cookieOptions = {
      httpOnly: true, // Previene acceso desde JavaScript (XSS)
      secure: process.env.NODE_ENV === 'production', // HTTPS en producción
      sameSite: 'strict', // Protección CSRF
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 días
    };
    
    res.cookie('auth_token', token, cookieOptions);
    res.json({ 
      token, // También enviamos en response para compatibilidad
      user: { id: user.id, email: user.email, name: user.name },
      message: 'Login exitoso con cookie segura'
    });
  } catch (err) {
    res.status(500).json({ error: 'Error en el login' });
  }
});

// Obtener datos públicos de un usuario por id
router.get('/user/:userId', async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await prisma.user.findUnique({
      where: { id: Number(userId) },
      select: { id: true, email: true, name: true }
    });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });
    res.json(user);
  } catch (err) {
    res.status(500).json({ error: 'Error al obtener usuario' });
  }
});

// Logout seguro
router.post('/logout', (req, res) => {
  // Limpiar cookie de autenticación
  res.clearCookie('auth_token', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict'
  });
  
  res.json({ message: 'Logout exitoso' });
});

module.exports = router;
