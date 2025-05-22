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

module.exports = router;
