const express = require('express');
const app = express();
const cors = require('cors');
const bodyParser = require('body-parser');

// Middlewares
app.use(cors());
app.use(bodyParser.json());

app.get('/', (req, res) => {
  res.send('Servidor funcionando correctamente');
});

// Importar rutas
const authRoutes = require('./routes/auth');
app.use('/api/auth', authRoutes);

// Puerto
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
