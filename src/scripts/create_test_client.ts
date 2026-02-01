import { PrismaClient, Rol } from "@prisma/client";
import { encrypt } from "../utils/handleCrypt.js";

const prisma = new PrismaClient();

async function createTestClient() {
    try {
        const email = "test_cliente@ticketera.com";
        const password = "password123";
        const hashedPassword = await encrypt(password);

        console.log(`Checking if user ${email} exists...`);

        let user = await prisma.usuario.findUnique({
            where: { mail: email },
            include: { cliente: true },
        });

        if (!user) {
            console.log("Creating new user...");
            user = await prisma.usuario.create({
                data: {
                    mail: email,
                    contraseña: hashedPassword,
                    rol: Rol.CLIENTE,
                },
                include: { cliente: true },
            });
            console.log("User created.");
        } else {
            console.log("User already exists.");
            // Optional: Update password to ensure it matches
            await prisma.usuario.update({
                where: { idUsuario: user.idUsuario },
                data: { contraseña: hashedPassword }
            });
            console.log("Password updated to ensure access.");
        }

        if (!user.cliente) {
            console.log("Creating client profile for user...");
            const cliente = await prisma.cliente.create({
                data: {
                    idUsuario: user.idUsuario,
                    nombre: "Test",
                    apellido: "Cliente",
                    tipoDoc: "DNI",
                    nroDoc: "12345678",
                    fechaNacimiento: new Date("1990-01-01"),
                },
            });
            console.log("Client profile created:", cliente);
        } else {
            console.log("User already has a client profile:", user.cliente);
        }

        console.log("\n============================================");
        console.log("✅ TEST USER READY");
        console.log("Use these credentials to login:");
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        console.log("============================================");

    } catch (error) {
        console.error("Error creating test client:", error);
    } finally {
        await prisma.$disconnect();
    }
}

createTestClient();
