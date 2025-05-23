const express = require('express');
const router = express.Router();
const verificarToken = require('../middleware/authMiddleware');
const nodemailer = require('nodemailer');

router.post('/reuniones/enviar', verificarToken, async (req, res) => {
  const { asunto, mensaje, contactos } = req.body;

  if (!asunto || !mensaje || !Array.isArray(contactos) || contactos.length === 0) {
    return res.status(400).json({ message: 'Datos incompletos para enviar correo' });
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: 'kfloresf1@miumg.edu.gt',
      pass: 'picp gfvr qsbv vjpp'
    }
  });

  try {
    for (let correo of contactos) {
      await transporter.sendMail({
        from: '"Agenda de Contactos" <kfloresf1@miumg.edu.gt>',
        to: correo,
        subject: asunto,
        html: mensaje
      });
    }

    res.json({ message: 'Correos enviados correctamente' });
    console.log('Correos enviados correctamente');
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Error al enviar correos' });
    console.log('Error al enviar correos');
  }
});

module.exports = router;