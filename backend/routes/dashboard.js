const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/authMiddleware');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');

router.get('/contactos', verificarToken, (req, res) => {
  const usuarioId = req.user.id;   
  const sql = `SELECT * FROM contactos WHERE usuario_id = ?`;
  db.all(sql, [req.usuario.id], (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

module.exports = router;
