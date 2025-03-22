import express from "express";
import categoriaController from "../controllers/categoria.controller.js";

const router = express.Router();

router.post("/", categoriaController.crearCategoria);
router.get("/", categoriaController.obtenerCategorias);
router.put("/:id", categoriaController.updateCategoria);
router.delete("/:id", categoriaController.eliminarCategoria);

export default router;
