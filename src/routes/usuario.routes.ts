import express from 'express';
import usuarioController from '../controllers/usuario.controller.js';
import { checkSession } from '../middleware/session.js';

const router = express.Router();

router.post('/', usuarioController.crearUsuario);
router.get('/', usuarioController.obtenerUsuario);
router.post('/login', usuarioController.loginUsuario);
router.get('/me', checkSession, usuarioController.checkSession);

export default router;