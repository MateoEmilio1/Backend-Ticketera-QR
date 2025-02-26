import express from 'express';
import politicaController from '../controllers/politica.controller.js';

const router = express.Router();

router.post('/', politicaController.crearPolitica);
router.get('/', politicaController.obtenerPoliticas);

export default router;