import express from 'express';
import clienteController from '../controllers/cliente.controller.js';

const router = express.Router();

router.post('/', clienteController.crearCliente);
router.get('/', clienteController.obtenerClientes);
router.get('/:id', clienteController.obtenerClientePorId);
router.put('/:id', clienteController.actualizarCliente);
router.delete('/:id', clienteController.eliminarCliente);

export default router;