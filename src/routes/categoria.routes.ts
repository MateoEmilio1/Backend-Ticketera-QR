import express from "express";
import categoriaController from "../controllers/categoria.controller.js";
import { validate } from "../middleware/validate.middleware.js";
import { actualizarCategoriaSchema, crearCategoriaSchema } from "../schemas/categoria.schema.js";

import { idParamSchema } from "../schemas/common.schema.js";

const router = express.Router();

router.post("/", validate(crearCategoriaSchema), categoriaController.crearCategoria);
router.get("/", categoriaController.obtenerCategorias);
router.get("/:id", validate(idParamSchema), categoriaController.obtenerCategoriaPorId);
router.delete("/:id", validate(idParamSchema), categoriaController.eliminarCategoria);
router.put("/:id", validate(actualizarCategoriaSchema), categoriaController.actualizarCategoria);

export default router;
