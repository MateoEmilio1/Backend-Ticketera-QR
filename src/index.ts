import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { prisma } from "./prisma.js";
import mainRouter from "./routes/app.routes.js";
import 'dotenv/config';

// Cargar variables de entorno
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

app.use(cors({
  origin: "http://localhost:3000",
  credentials: true
}));
app.use(express.json());
app.use(cookieParser());

app.use("/api", mainRouter);

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

