import express from 'express';
import organizacionController from '../controllers/organizacion.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { actualizarOrganizacionSchema } from '../schemas/perfil.schema.js';
import { crearOrganizacionSchema } from '../schemas/registro.schema.js';

import { idParamSchema } from "../schemas/common.schema.js";

const router = express.Router();

router.get('/', organizacionController.obtenerOrganizaciones);
router.get('/usuario/:idUsuario', organizacionController.obtenerOrganizacionPorIdUsuario);
router.get('/:id', validate(idParamSchema), organizacionController.obtenerOrganizacionPorId);
router.delete('/:id', validate(idParamSchema), organizacionController.eliminarOrganizacion);
router.put('/:id', validate(actualizarOrganizacionSchema), organizacionController.actualizarOrganizacion);
router.post('/', validate(crearOrganizacionSchema), organizacionController.crearOrganizacion);

export default router;