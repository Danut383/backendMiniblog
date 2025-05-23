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

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en puerto ${PORT}`);
});
