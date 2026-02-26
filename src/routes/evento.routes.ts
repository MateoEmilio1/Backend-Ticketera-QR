import express from "express";
import eventoController from "../controllers/evento.controller.js";

const router = express.Router();

router.post("/", eventoController.crearEvento);
router.get("/", eventoController.obtenerEventos);
router.get("/estadisticas", eventoController.getEstadisticas);
router.get("/reportes/ventas-hora", eventoController.getVentasPorHora);
router.get("/:id", eventoController.obtenerEventosPorId);
router.put("/:id", eventoController.actualizarEvento);
router.patch("/:id/cancelar", eventoController.cancelarEvento);
router.delete("/:id", eventoController.eliminarEvento);

export default router;
