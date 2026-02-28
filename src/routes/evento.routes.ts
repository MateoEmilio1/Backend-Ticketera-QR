import express from "express";
import eventoController from "../controllers/evento.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { cambiarFechaEventoSchema, crearEventoSchema } from "../schemas/evento.schema.js";

import { idParamSchema } from "../schemas/common.schema.js";

const router = express.Router();

router.post("/", validate(crearEventoSchema), eventoController.crearEvento);
router.get("/", eventoController.obtenerEventos);
router.get("/estadisticas", eventoController.getEstadisticas);
router.get("/ventas-hora", eventoController.getVentasPorHora);
router.get("/reporte-categoria", eventoController.getEventosPorCategoria);
router.get("/:id", validate(idParamSchema), eventoController.obtenerEventosPorId);
router.delete("/:id", validate(idParamSchema), eventoController.eliminarEvento);
router.put("/:id", validate(cambiarFechaEventoSchema), eventoController.cambiarFechaEvento);
router.patch("/:id/cancelar", validate(idParamSchema), eventoController.cancelarEvento);

export default router;
