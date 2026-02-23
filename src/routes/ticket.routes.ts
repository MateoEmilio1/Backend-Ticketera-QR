import ticketController from "../controllers/ticket.controller.js";
import express from "express";

const router = express.Router();

router.post("/", ticketController.crearTicket);
router.get("/", ticketController.obtenerTickets);
router.get("/:id", ticketController.obtenerTicketPorId);
router.delete("/:id", ticketController.eliminarTicket);
router.put("/:id", ticketController.actualizarTicket);
router.post("/validar/:tokenQr", ticketController.validarTicket);
router.post("/consumir/:tokenQr", ticketController.consumirTicket);
router.get("/cliente/:idCliente", ticketController.obtenerTicketsPorIdCliente);
router.post("/webhook", ticketController.recibirWebhook);
router.post("/transferir", ticketController.transferirTicket);
router.post("/reembolsar", ticketController.reembolsarTicket);

export default router;        
