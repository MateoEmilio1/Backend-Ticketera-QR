import express from 'express';
import usuarioController from '../controllers/usuario.controller.js';
import { checkSession } from '../middleware/session.js';
import { validate } from '../middleware/validate.middleware.js';
import { crearUsuarioSchema, forgotPasswordSchema, loginSchema, resetPasswordSchema } from '../schemas/usuario.schema.js';

const router = express.Router();

router.post('/', validate(crearUsuarioSchema), usuarioController.crearUsuario);
router.get('/', usuarioController.obtenerUsuario);
router.post('/login', validate(loginSchema), usuarioController.loginUsuario);
router.post('/forgot-password', validate(forgotPasswordSchema), usuarioController.forgotPassword);
router.post('/reset-password', validate(resetPasswordSchema), usuarioController.resetPassword);
router.post('/logout', usuarioController.logoutUsuario);
router.get('/me', checkSession, usuarioController.getUsuarioLogueado);

export default router;