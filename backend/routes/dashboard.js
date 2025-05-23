const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/authMiddleware');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

router.get('/contactos', verificarToken, (req, res) => {
  const usuarioId = req.usuario.id;

  const sql = `
    SELECT c.id, c.primer_nombre, c.segundo_nombre, c.primer_apellido, c.segundo_apellido,
           c.telefono, c.correo_electronico,
           GROUP_CONCAT(cat.nombre) AS categorias
    FROM contactos c
    LEFT JOIN contacto_categorias cc ON c.id = cc.contacto_id
    LEFT JOIN categorias cat ON cc.categoria_id = cat.id
    WHERE c.usuario_id = ?
    GROUP BY c.id
  `;

  db.all(sql, [usuarioId], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error al obtener contactos' });

    const contactos = rows.map(row => ({
      ...row,
      categorias: row.categorias ? row.categorias.split(',') : []
    }));

    res.json(contactos);
  });
});

// Crear un nuevo contacto
router.post('/contactos', verificarToken, (req, res) => {
  const usuarioId = req.usuario.id;
  const {
    primer_nombre,
    segundo_nombre,
    primer_apellido,
    segundo_apellido,
    telefono,
    correo_electronico,
    categorias = [] // Array de IDs de categorías
  } = req.body;

  const sql = `
    INSERT INTO contactos (
      primer_nombre, segundo_nombre, primer_apellido, segundo_apellido,
      telefono, correo_electronico, usuario_id
    ) VALUES (?, ?, ?, ?, ?, ?, ?)
  `;

  db.run(sql, [
    primer_nombre,
    segundo_nombre || '',
    primer_apellido,
    segundo_apellido || '',
    telefono,
    correo_electronico,
    usuarioId
  ], function (err) {
    if (err) return res.status(500).json({ message: 'Error al crear contacto' });

    const contactoId = this.lastID;

    // Insertar en contacto_categorias si hay categorías
    if (categorias.length > 0) {
      const insertSQL = `INSERT INTO contacto_categorias (contacto_id, categoria_id) VALUES (?, ?)`;
      const stmt = db.prepare(insertSQL);
      categorias.forEach(catId => stmt.run(contactoId, catId));
      stmt.finalize();
    }

    res.status(201).json({ message: 'Contacto creado con categorías', id: contactoId });
  });
});

// Actualizar un contacto
router.put('/contactos/:id', verificarToken, (req, res) => {
  const usuarioId = req.usuario.id;
  const contactoId = req.params.id;
  const {
    primer_nombre,
    segundo_nombre,
    primer_apellido,
    segundo_apellido,
    telefono,
    correo_electronico,
    categorias = [] // puede venir vacío si no selecciona ninguna
  } = req.body;

  db.serialize(() => {
    const updateContacto = `
      UPDATE contactos
      SET primer_nombre = ?, segundo_nombre = ?, primer_apellido = ?, segundo_apellido = ?,
          telefono = ?, correo_electronico = ?
      WHERE id = ? AND usuario_id = ?
    `;

    db.run(updateContacto, [
      primer_nombre,
      segundo_nombre || '',
      primer_apellido,
      segundo_apellido || '',
      telefono,
      correo_electronico,
      contactoId,
      usuarioId
    ], function (err) {
      if (err) return res.status(500).json({ message: 'Error al actualizar contacto' });
      if (this.changes === 0) return res.status(404).json({ message: 'Contacto no encontrado' });

      // Primero eliminamos las categorías anteriores
      db.run(`DELETE FROM contacto_categorias WHERE contacto_id = ?`, [contactoId], (err) => {
        if (err) return res.status(500).json({ message: 'Error al limpiar categorías previas' });

        // Si hay nuevas categorías, las insertamos
        if (categorias.length > 0) {
          const insert = db.prepare(`INSERT INTO contacto_categorias (contacto_id, categoria_id) VALUES (?, ?)`);
          categorias.forEach(catId => insert.run(contactoId, catId));
          insert.finalize();
        }

        res.json({ message: 'Contacto actualizado con categorías' });
      });
    });
  });
});

// Eliminar un contacto
router.delete('/contactos/:id', verificarToken, (req, res) => {
  const usuarioId = req.usuario.id;
  const contactoId = req.params.id;

  const sql = `
    DELETE FROM contactos
    WHERE id = ? AND usuario_id = ?
  `;

  db.run(sql, [contactoId, usuarioId], function (err) {
    if (err) return res.status(500).json({ message: 'Error al eliminar contacto' });
    if (this.changes === 0) return res.status(404).json({ message: 'Contacto no encontrado' });
    res.json({ message: 'Contacto eliminado' });
  });
});

router.post('/contactos/filtro', verificarToken, (req, res) => {
  const usuarioId = req.usuario.id;
  const categorias = req.body.categorias;

  // Si no hay categorías seleccionadas, devolver todos los contactos del usuario
  if (!Array.isArray(categorias) || categorias.length === 0) {
    const sql = `
      SELECT c.id, c.primer_nombre, c.segundo_nombre, c.primer_apellido, c.segundo_apellido,
             c.telefono, c.correo_electronico,
             GROUP_CONCAT(cat.nombre) AS categorias
      FROM contactos c
      LEFT JOIN contacto_categorias cc ON c.id = cc.contacto_id
      LEFT JOIN categorias cat ON cc.categoria_id = cat.id
      WHERE c.usuario_id = ?
      GROUP BY c.id
    `;

    return db.all(sql, [usuarioId], (err, rows) => {
      if (err) return res.status(500).json({ message: 'Error al obtener todos los contactos' });

      const contactos = rows.map(row => ({
        ...row,
        categorias: row.categorias ? row.categorias.split(',') : []
      }));

      res.json(contactos);
    });
  }

  // Si hay filtros seleccionados
  const placeholders = categorias.map(() => '?').join(',');
  const sql = `
    SELECT DISTINCT c.id, c.primer_nombre, c.segundo_nombre, c.primer_apellido, c.segundo_apellido,
           c.telefono, c.correo_electronico,
           GROUP_CONCAT(cat.nombre) AS categorias
    FROM contactos c
    JOIN contacto_categorias cc ON c.id = cc.contacto_id
    JOIN categorias cat ON cc.categoria_id = cat.id
    WHERE c.usuario_id = ?
      AND cc.categoria_id IN (${placeholders})
    GROUP BY c.id
  `;

  db.all(sql, [usuarioId, ...categorias], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error al filtrar contactos' });

    const contactos = rows.map(row => ({
      ...row,
      categorias: row.categorias ? row.categorias.split(',') : []
    }));

    res.json(contactos);
  });
});

router.get('/contactos/con-correo', verificarToken, (req, res) => {
  const usuarioId = req.usuario.id;
  const sql = `
    SELECT id, primer_nombre, correo_electronico 
    FROM contactos 
    WHERE usuario_id = ? 
      AND correo_electronico IS NOT NULL 
      AND correo_electronico != ''
  `;

  db.all(sql, [usuarioId], (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error al obtener contactos' });
    res.json(rows);
  });
});

module.exports = router;
