import express from 'express';
import usuarioController from '../controllers/usuario.controller';

const router = express.Router();

router.post('/', usuarioController.crearUsuario);
router.get('/', usuarioController.obtenerUsuario);
router.post('/login', usuarioController.loginUsuario);
<<<<<<< Updated upstream
=======
router.post('/forgot-password', usuarioController.forgotPassword);
router.post('/reset-password', usuarioController.resetPassword);
router.get('/me', checkSession, usuarioController.checkSession);
>>>>>>> Stashed changes

export default router;