import express from 'express';
import usuarioController from '../controllers/usuario.controller';

const router = express.Router();

router.post('/', usuarioController.crearUsuario);

export default router;