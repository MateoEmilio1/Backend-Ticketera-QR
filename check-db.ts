import { prisma } from "./src/prisma.js";

async function checkDatabase() {
  try {
    console.log("🔍 Intentando conectar a la base de datos...");
    const user = await prisma.usuario.findFirst();
    console.log("✅ Base de datos conectada correctamente");
    console.log("📊 Total de usuarios:", user ? "Hay datos" : "Base de datos vacía");
  } catch (error) {
    console.error("❌ Error de conexión a BD:", (error as Error).message);
    console.error("\n📝 Verifica:");
    console.error("- ¿PostgreSQL está corriendo?");
    console.error("- ¿El archivo .env tiene la URL correcta?");
    console.error("- ¿La contraseña de PostgreSQL es correcta?");
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabase();
