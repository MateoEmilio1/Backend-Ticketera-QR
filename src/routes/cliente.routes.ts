import express from 'express';
import clienteController from '../controllers/cliente.controller.js';
import { validate } from '../middleware/validate.middleware.js';
import { actualizarClienteSchema } from '../schemas/perfil.schema.js';
import { crearClienteSchema } from '../schemas/registro.schema.js';

import { idParamSchema } from "../schemas/common.schema.js";

const router = express.Router();

router.get('/', clienteController.obtenerClientes);
router.get('/usuario/:idUsuario', clienteController.obtenerClientePorIdUsuario);
router.get('/:id', validate(idParamSchema), clienteController.obtenerClientePorId);
router.delete('/:id', validate(idParamSchema), clienteController.eliminarCliente);
router.put('/:id', validate(actualizarClienteSchema), clienteController.actualizarCliente);
router.post('/', validate(crearClienteSchema), clienteController.crearCliente);

export default router;
