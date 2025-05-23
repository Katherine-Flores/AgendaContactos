const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/authMiddleware');
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./database.sqlite');
const nodemailer = require('nodemailer');

router.post('/reportes/enviar', verificarToken, async (req, res) => {
  const usuarioId = req.usuario.id;
  const correoDestino = req.body.correo;

  db.all('SELECT * FROM contactos WHERE usuario_id = ? ORDER BY primer_nombre', [usuarioId], async (err, rows) => {
    if (err) return res.status(500).json({ message: 'Error al obtener contactos' });

    const html = `
      <h2 style="text-align:center;">Reporte de Contactos</h2>
      <table style="width:100%; border-collapse: collapse;" border="1">
        <tr style="background-color:#f2f2f2;">
          <th>Nombre</th>
          <th>Correo</th>
          <th>Teléfono</th>
        </tr>
        ${rows.map(c => `
          <tr>
            <td>${c.primer_nombre} ${c.primer_apellido}</td>
            <td>${c.correo_electronico || '-'}</td>
            <td>${c.telefono || '-'}</td>
          </tr>
        `).join('')}
      </table>
    `;

    // Enviar correo
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'kfloresf1@miumg.edu.gt',
        pass: 'picp gfvr qsbv vjpp'
      }
    });

    try {
      await transporter.sendMail({
        from: '"Agenda KF" <kfloresf1@miumg.edu.gt>',
        to: correoDestino,
        subject: 'Reporte de contactos',
        html
      });

      res.json({ message: 'Reporte enviado exitosamente' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Error al enviar el reporte' });
    }
  });
});

module.exports = router;