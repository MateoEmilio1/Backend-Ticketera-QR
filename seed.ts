import { prisma } from "./src/prisma.js";
import { Rol } from "@prisma/client";

async function main() {
  try {
    // Eliminar usuario si existe
    await prisma.usuario.deleteMany({
      where: {
        mail: "prueba@test.com"
      }
    });

    // Crear usuario de prueba
    const usuario = await prisma.usuario.create({
      data: {
        mail: "prueba@test.com",
        contraseña: "123456",
        rol: Rol.ADMIN
      }
    });

    console.log("✅ Usuario creado exitosamente:");
    console.log("Email:", usuario.mail);
    console.log("Contraseña:", usuario.contraseña);
    console.log("ID:", usuario.idUsuario);
    console.log("\n📝 Usa estas credenciales para probar el login");
  } catch (error) {
    console.error("❌ Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
