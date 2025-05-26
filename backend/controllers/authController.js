const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const db = new sqlite3.Database('./database.sqlite');

exports.register = (req, res) => {
  const { nombre_usuario, contrasena } = req.body;

  // Validar con regex
  const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{6,}$/;
  if (!regex.test(contrasena)) {
    return res.status(400).json({ error: 'La contraseña debe contener al menos una mayúscula, una minúscula, un número y un símbolo.' });
  }

  const hash = bcrypt.hashSync(contrasena, 10);
  const sql = `INSERT INTO usuarios (nombre_usuario, contrasena_hash) VALUES (?, ?)`;

  db.run(sql, [nombre_usuario, hash], function(err) {
    if (err) return res.status(500).json({ error: err.message });

    const nuevoUsuarioId = this.lastID;

    // Categorías por defecto
    const categorias = ['Trabajo', 'Amigos', 'Familia'];
    const placeholders = categorias.map(() => '(?, ?)').join(', ');
    const values = categorias.flatMap(nombre => [nombre, nuevoUsuarioId]);

    const sqlCategorias = `INSERT INTO categorias (nombre, usuario_id) VALUES ${placeholders}`;

    db.run(sqlCategorias, values, function (err2) {
      if (err2) {
        return res.status(500).json({
          error: 'Usuario creado, pero ocurrió un error al crear las categorías por defecto',
          usuario_id: nuevoUsuarioId,
        });
      }

      res.json({
        message: 'Usuario registrado correctamente con categorías por defecto',
        usuario_id: nuevoUsuarioId,
        categorias_creadas: categorias,
      });
    });
  });
};

const jwt = require('jsonwebtoken');

exports.login = (req, res) => {
  const { nombre_usuario, contrasena } = req.body;

  const sql = `SELECT * FROM usuarios WHERE nombre_usuario = ?`;
  db.get(sql, [nombre_usuario], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const valido = bcrypt.compareSync(contrasena, user.contrasena_hash);
    if (!valido) return res.status(401).json({ error: 'Contraseña incorrecta' });

    const token = jwt.sign(
      { id: user.id, nombre_usuario: user.nombre_usuario },
      'KatherineFlores_0909_22_1883',
      { expiresIn: '2h' }
    );

    res.json({
      message: 'Login exitoso', 
      usuario_id: user.id,
      token});
  });
};
