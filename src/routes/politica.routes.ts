import express from "express";
import politicaController from "../controllers/politica.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { actualizarPoliticaSchema, crearPoliticaSchema } from "../schemas/politica.schema.js";

const router = express.Router();

router.post("/", validate(crearPoliticaSchema), politicaController.crearPolitica);
router.get("/", politicaController.obtenerPoliticas);
router.get("/actual", politicaController.obtenerPoliticaActual);

export default router;