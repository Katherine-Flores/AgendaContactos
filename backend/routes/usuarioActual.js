const express = require('express');
const router = express.Router();
const usuariosController = require('../controllers/datosUsuarioController');

router.get('/usuario-actual', usuariosController.obtenerUsuarioActual);
router.put('/usuario-actual', usuariosController.actualizarUsuarioActual);

module.exports = router;
