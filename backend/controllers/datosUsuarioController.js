const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

// Obtener datos del usuario actual
exports.obtenerUsuarioActual = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Token no proporcionado' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, 'KatherineFlores_0909_22_1883');

    const data = db.get('SELECT nombre_usuario FROM usuarios WHERE id = ?', [decoded.id], (err, row) => {
      if (err) return res.status(500).json({ message: 'Error en la base de datos' });
      if (!row) return res.status(404).json({ message: 'Usuario no encontrado' });
      res.json(row);
    });

  } catch (error) {
    return res.status(403).json({ message: 'Token inválido' });
  }
};

// Actualizar usuario actual (nombre y/o contraseña)
exports.actualizarUsuarioActual = (req, res) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) return res.status(401).json({ message: 'Token no proporcionado' });

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, 'KatherineFlores_0909_22_1883');
    const { usuario, contrasena } = req.body;

    if (!usuario) return res.status(400).json({ message: 'Usuario requerido' });

    // Verificar si el nuevo nombre ya está en uso por otro
    db.get(
      'SELECT id FROM usuarios WHERE nombre_usuario = ? AND id != ?',
      [usuario, decoded.id],
      async (err, row) => {
        if (err) return res.status(500).json({ message: 'Error en la base de datos' });
        if (row) return res.status(409).json({ message: 'Ese nombre de usuario ya está en uso' });

        let query, params;
        if (contrasena && contrasena.trim() !== '') {
          const hashed = await bcrypt.hash(contrasena, 10);
          query = 'UPDATE usuarios SET nombre_usuario = ?, contrasena_hash = ? WHERE id = ?';
          params = [usuario, hashed, decoded.id];
        } else {
          query = 'UPDATE usuarios SET nombre_usuario = ? WHERE id = ?';
          params = [usuario, decoded.id];
        }

        db.run(query, params, function (err) {
          if (err) return res.status(500).json({ message: 'Error al actualizar' });
          res.json({ message: 'Usuario actualizado correctamente' });
        });
      }
    );
  } catch (error) {
    return res.status(403).json({ message: 'Token inválido' });
  }
};
