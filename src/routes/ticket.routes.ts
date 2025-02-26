import ticketController from "../controllers/ticket.controller";
import express from "express";

const router = express.Router();

router.post("/", ticketController.crearTicket);
router.get("/", ticketController.obtenerTickets);
router.get("/:id", ticketController.obtenerTicketPorId);
router.delete("/:id", ticketController.eliminarTicket);
router.put("/:id", ticketController.actualizarTicket);

export default router;        
