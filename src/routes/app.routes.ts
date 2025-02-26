import { Router } from "express";

import organizacionRouter from "./organizacion.routes.js";
import clienteRouter from "./cliente.routes.js";
import politicaRouter from "./politica.routes.js";
import categoriaRouter from "./categoria.routes.js";
import eventoRouter from './evento.routes.js';
import tipoTicketRouter from './tipoTicket.routes.js';
import ticketRouter from './ticket.routes.js';

const router = Router();

router.use("/organizaciones", organizacionRouter);
router.use("/clientes", clienteRouter);
router.use("/politicas", politicaRouter);
router.use("/categorias", categoriaRouter);
router.use("/eventos", eventoRouter);
router.use("/tipoTickets", tipoTicketRouter);
router.use("/tickets", ticketRouter);

export default router;