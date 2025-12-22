import { prisma } from "./src/prisma.js";

async function main() {
  try {
    const usuarios = await prisma.usuario.findMany();
    console.log("\n=== USUARIOS EN LA BASE DE DATOS ===\n");
    
    if (usuarios.length === 0) {
      console.log("❌ No hay usuarios registrados");
    } else {
      usuarios.forEach((u, i) => {
        console.log(`${i + 1}. Email: ${u.mail}`);
        console.log(`   Contraseña: ${u.contraseña}`);
        console.log(`   Rol: ${u.rol}`);
        console.log(`   ID: ${u.idUsuario}\n`);
      });
    }
  } catch (error) {
    console.error("Error:", error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
