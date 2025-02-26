import {prisma} from "../prisma.js"
import { Request, Response } from "express";

// Crear un cliente
const crearCliente = async (req: Request, res: Response) => {
  try {
    const cliente = await prisma.cliente.create({
      data: req.body,
    });

    res.status(200).json({
      message: "Cliente creado con éxito",
      data: cliente,
      error: false,
    });
  } catch (error) {
    console.error("Error en crearCliente", error);
    res.status(500).json({
      message: "Error al crear el cliente",
      error: true,
      details: (error as Error).message, 
    });
  }
}

const obtenerClientes = async (req: Request, res: Response) => {
  try {
    const clientes = await prisma.cliente.findMany();
    res.status(200).json({
      message: "Clientes obtenidos con éxito",
      data: clientes,
      error: false,
    });
  } catch (error) {
    console.error("Error en obtenerClientes:", error);
    res.status(500).json({
      message: "Error al obtener los clientes",
      error: true,
      details: (error as Error).message,
    });
  }
}

const obtenerClientePorId = async (req: Request, res: Response):Promise<void> => {
  try {
    const { id } = req.params;
    const cliente = await prisma.cliente.findUnique({
      where: { idCliente: parseInt(id) },
    });

    if (!cliente) {
      res.status(404).json({
        message: "Cliente no encontrado",
        error: true,
      });
      return; 
    }

    res.status(200).json({
      message: "Cliente obtenido con éxito",
      data: cliente,
      error: false,
    });

  } catch (error) {
    console.error("Error en obtenerClientePorId:", error);
    res.status(500).json({
      message: "Error al obtener el cliente",
      error: true,
      details: (error as Error).message,
    });
  }
};

const eliminarCliente = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const clienteEliminado = await prisma.cliente.delete({
      where: { idCliente: parseInt(id) },
    });
    if (!clienteEliminado) {
      res.status(404).json({
        message: "Cliente no encontrado",
        error: true,
      });
      return;
    }
    res.status(200).json({
      message: "Cliente eliminado con éxito",
      error: false,
    });
  } catch (error) {
    res.status(500).json({
      message: "Error al eliminar el cliente",
      error: true,
      details: (error as Error).message,
    });
  }
}

const actualizarCliente = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const clienteData = req.body;
    const clienteActualizado = await prisma.cliente.update({
      where: { idCliente: parseInt(id) },
      data: clienteData,
    });

    res.status(200).json({
      message: "Cliente actualizado con éxito",
      data: clienteActualizado,
      error: false,
    });
  }catch (error) { 
    res.status(500).json({
      message: "Error al actualizar el cliente",
      error: true,
      details: (error as Error).message,
    });
  }
}
export default { crearCliente, obtenerClientes, obtenerClientePorId, eliminarCliente, actualizarCliente };