
import { prisma } from "../prisma.js";

const updateEmail = async () => {
    const emailReal = process.argv[2]; // Gets email from command line arg

    if (!emailReal) {
        console.error("❌ Por favor especifica tu email real.");
        console.log("Uso: npx tsx src/scripts/update_email.ts tu@email.com");
        return;
    }

    try {
        console.log(`🔄 Actualizando email de test_cliente@ticketera.com a ${emailReal}...`);

        const updated = await prisma.usuario.updateMany({
            where: { mail: "test_cliente@ticketera.com" },
            data: { mail: emailReal }
        });

        if (updated.count > 0) {
            console.log("✅ ¡Email actualizado con éxito!");
            console.log(`Ahora puedes loguearte con: ${emailReal} y password123`);
        } else {
            console.log("⚠️ No se encontró al usuario 'test_cliente@ticketera.com'.");
            console.log("Intenta crear primero el usuario de prueba.");
        }

    } catch (error) {
        console.error("Error actualizando:", error);
    }
};

updateEmail();
