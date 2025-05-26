const express = require('express');
const router = express.Router();
const categoriasController = require('../controllers/categoriasController');
const verificarToken = require('../middleware/authMiddleware');

router.get('/', verificarToken, categoriasController.listarCategorias);
router.post('/', verificarToken, categoriasController.crearCategoria);
router.put('/:id', verificarToken, categoriasController.editarCategoria);
router.delete('/:id', verificarToken, categoriasController.eliminarCategoria);

module.exports = router;