import express from 'express';
import organizacionController from '../controllers/organizacion.controller.js';

const router = express.Router();


router.post('/', organizacionController.crearOrganizacion);
router.get('/', organizacionController.obtenerOrganizaciones);
router.get('/usuario/:idUsuario', organizacionController.obtenerOrganizacionPorIdUsuario);
router.get('/:id', organizacionController.obtenerOrganizacionPorId);
router.put('/:id', organizacionController.actualizarOrganizacion);
router.delete('/:id', organizacionController.eliminarOrganizacion);

export default router;