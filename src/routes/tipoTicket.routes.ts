import tipoTicketController from "../controllers/tipoTicket.controller.js";
import express from "express";
import { validate } from "../middleware/validate.middleware.js";
import { actualizarTipoTicketSchema } from "../schemas/tipoTicket.schema.js";

const router = express.Router();

router.put("/:id", validate(actualizarTipoTicketSchema), tipoTicketController.editarTipoTicket);

export default router;