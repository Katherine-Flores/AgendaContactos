const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

exports.listarCategorias = (req, res) => {
    console.log('Petición GET a /api/categorias');
  db.all('SELECT * FROM categorias', [], (err, filas) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(filas);
  });
};

exports.crearCategoria = (req, res) => {
  const { nombre } = req.body;
  db.run('INSERT INTO categorias (nombre) VALUES (?)', [nombre], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    res.status(201).json({ id: this.lastID, nombre });
  });
};

exports.editarCategoria = (req, res) => {
  const { id } = req.params;
  const { nombre } = req.body;

  db.run('UPDATE categorias SET nombre = ? WHERE id = ?', [nombre, id], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    if (this.changes === 0) return res.status(404).json({ mensaje: 'No encontrado' });

    res.json({ id, nombre });
  });
};

exports.eliminarCategoria = (req, res) => {
  const { id } = req.params;

  db.run('DELETE FROM categorias WHERE id = ?', [id], function (err) {
    if (err) return res.status(500).json({ error: err.message });

    if (this.changes === 0) return res.status(404).json({ mensaje: 'No encontrado' });

    res.status(204).end();
  });
};
