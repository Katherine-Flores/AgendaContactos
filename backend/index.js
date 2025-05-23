const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

// Middlewares
app.use(cors({
  origin: 'http://127.0.0.1:5500'
}));
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

// Importar rutas
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

const dashboardRoutes = require('./routes/dashboard');
app.use('/api/dashboard', dashboardRoutes);

const categoriasRoutes = require('./routes/categorias');
app.use('/api/categorias', categoriasRoutes);

const usuariosRoutes = require('./routes/usuarioActual');
app.use('/api', usuariosRoutes);

const reunionesRoutes = require('./routes/reuniones');
app.use('/api', reunionesRoutes);

// Puerto
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
