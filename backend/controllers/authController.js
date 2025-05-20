const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');
const db = new sqlite3.Database('./database.sqlite');

exports.register = (req, res) => {
  const { nombre_usuario, contrasena } = req.body;

  const hash = bcrypt.hashSync(contrasena, 10);
  const sql = `INSERT INTO usuarios (nombre_usuario, contrasena_hash) VALUES (?, ?)`;

  db.run(sql, [nombre_usuario, hash], function(err) {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ message: 'Usuario registrado correctamente', id: this.lastID });
  });
};

exports.login = (req, res) => {
  const { nombre_usuario, contrasena } = req.body;

  const sql = `SELECT * FROM usuarios WHERE nombre_usuario = ?`;
  db.get(sql, [nombre_usuario], (err, user) => {
    if (err) return res.status(500).json({ error: err.message });
    if (!user) return res.status(404).json({ error: 'Usuario no encontrado' });

    const valido = bcrypt.compareSync(contrasena, user.contrasena_hash);
    if (!valido) return res.status(401).json({ error: 'Contraseña incorrecta' });

    res.json({ message: 'Login exitoso', usuario_id: user.id });
  });
};
