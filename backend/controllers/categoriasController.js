const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

exports.listarCategorias = (req, res) => {
  console.log('Petición GET a /api/categorias; usuario_id: ' + req.usuario.id);
  const usuarioId = req.usuario.id;

  db.all('SELECT * FROM categorias WHERE usuario_id = ?', [usuarioId], (err, filas) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(filas);
  });
};

exports.crearCategoria = (req, res) => {
  const { nombre } = req.body;
  const usuarioId = req.usuario.id;

  db.run('INSERT INTO categorias (nombre, usuario_id) VALUES (?, ?)', [nombre, usuarioId], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    res.status(201).json({ id: this.lastID, nombre, usuario_id: usuarioId });
  });
};

exports.editarCategoria = (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;
  const usuarioId = req.usuario.id;

  db.run(
    'UPDATE categorias SET nombre = ? WHERE id = ? AND usuario_id = ?',
    [nombre, id, usuarioId],
    function (err) {
      if (err) return res.status(500).json({ error: err.message });
      if (this.changes === 0) return res.status(404).json({ mensaje: 'No encontrado o no autorizado' });

      res.json({ id, nombre });
    }
  );
};

exports.eliminarCategoria = (req, res) => {
  const { id } = req.params;
  const usuarioId = req.usuario.id;

  db.run('DELETE FROM categorias WHERE id = ? AND usuario_id = ?', [id, usuarioId], function (err) {
    if (err) return res.status(500).json({ error: err.message });
    if (this.changes === 0) return res.status(404).json({ mensaje: 'No encontrado o no autorizado' });

    res.status(204).end();
  });
};
