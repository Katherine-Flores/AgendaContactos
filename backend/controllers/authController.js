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

const jwt = require('jsonwebtoken');
const SECRET_KEY = 'mi_clave_secreta_super_segura';

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
