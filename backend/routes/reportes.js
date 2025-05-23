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
    const fecha = new Date().toLocaleDateString('es-ES');
    const total = rows.length;

    const html = `
      <div style="font-family: Arial, sans-serif; color: #333;">
        <h2 style="text-align: center;">Reporte de Contactos</h2>
        <p style="text-align: center;">Fecha del reporte: <strong>${fecha}</strong><br>Total de contactos: <strong>${total}</strong></p>

        <table style="width: 100%; border-collapse: separate; border-spacing: 0 12px;">
          <thead>
            <tr style="background-color:#426CC2; color:white;">
              <th style="padding: 12px; text-align: left; border-radius: 8px 0 0 0;">Nombre</th>
              <th style="padding: 12px; text-align: left;">Correo</th>
              <th style="padding: 12px; text-align: left; border-radius: 0 8px 0 0;">Teléfono</th>
            </tr>
          </thead>
          <tbody>
            ${rows.map((c, i) => `
              <tr style="background-color: #ffffff; box-shadow: 0 2px 5px rgba(0,0,0,0.1); border-radius: 12px; overflow: hidden;">
                <td style="padding: 12px; border-top-left-radius: 12px; border-bottom-left-radius: 12px;">${c.primer_nombre} ${c.primer_apellido}</td>
                <td style="padding: 12px;">${c.correo_electronico || '-'}</td>
                <td style="padding: 12px; border-top-right-radius: 12px; border-bottom-right-radius: 12px;">${c.telefono || '-'}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>
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