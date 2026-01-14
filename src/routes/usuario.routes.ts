import express from 'express';
import usuarioController from '../controllers/usuario.controller';

const router = express.Router();

router.post('/', usuarioController.crearUsuario);
router.get('/', usuarioController.obtenerUsuario);
router.post('/login', usuarioController.loginUsuario);

export default router;