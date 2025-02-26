import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";

// Cargar variables de entorno
dotenv.config();

// Determinar la URL de conexión según el entorno
const databaseUrl =
  process.env.NODE_ENV === "development"
    ? process.env.DATABASE_URL_DEV: process.env.DATABASE_URL;

const globalForPrisma = global as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    datasources: {
      db: {
        url: databaseUrl,
      },
    },
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
