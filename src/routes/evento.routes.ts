import express from "express";
import eventoController from "../controllers/evento.controller";

const router = express.Router();

router.post("/", eventoController.crearEvento);
router.get("/", eventoController.obtenerEventos);
router.get("/:id", eventoController.obtenerEventosPorId);
router.put("/:id", eventoController.actualizarEvento);
router.delete("/:id", eventoController.eliminarEvento);

export default router;
