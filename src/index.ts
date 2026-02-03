import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { prisma } from "./prisma.js";
import mainRouter from "./routes/app.routes.js";
import usuarioRoutes from "./routes/usuario.routes.js";

// Cargar variables de entorno
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.use("/api", mainRouter);
app.use("/api/usuario", usuarioRoutes);

const server = app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

// Manejo de cierre para liberar la conexión de Prisma
const shutdown = async () => {
  console.log("Closing Prisma connection...");
  await prisma.$disconnect();
  server.close(() => {
    console.log("Server closed.");
    process.exit(0);
  });
};

// Capturar señales para cierre seguro
process.on("SIGINT", shutdown);
process.on("SIGTERM", shutdown);

