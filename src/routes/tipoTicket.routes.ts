import tipoTicketController from "../controllers/tipoTicket.controller.js";
import express from "express";

const router = express.Router();

router.put("/:id", tipoTicketController.editarTipoTicket);

export default router;