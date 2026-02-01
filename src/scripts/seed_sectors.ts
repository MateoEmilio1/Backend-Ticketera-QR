import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
    console.log("Iniciando seed de sectores...");

    let eventos = await prisma.evento.findMany();

    if (eventos.length === 0) {
        console.log("No hay eventos. Creando datos base (Organización, Categoría, Evento)...");

        // Crear Usuario para la organización
        const usuario = await prisma.usuario.create({
            data: {
                mail: "org_test@test.com",
                contraseña: "123",
                rol: "ORGANIZACION"
            }
        });

        // Crear Organización
        const org = await prisma.organizacion.create({
            data: {
                idUsuario: usuario.idUsuario,
                nombre: "Organización Test",
                ubicacion: "Buenos Aires",
                cuit: "20-12345678-9"
            }
        });

        // Crear Categoría
        const cat = await prisma.categoria.create({
            data: {
                nombreCategoria: "Música"
            }
        });

        // Crear Evento
        const evento = await prisma.evento.create({
            data: {
                nombre: "Lollapalooza 2026",
                fechaCreacion: new Date(),
                fechaHoraEvento: new Date("2026-03-20T18:00:00"),
                capacidadMax: 50000,
                descripcion: "El festival más grande.",
                idCategoria: cat.idCategoria,
                idOrganizacion: org.idOrganizacion,
                foto: "https://images.unsplash.com/photo-1459749411177-260f11c7c858?auto=format&fit=crop&q=80&w=1200"
            }
        });

        eventos = [evento];
        console.log("Evento creado: " + evento.nombre);
    }

    const nuevosSectores = [
        { tipo: "General", precio: 5000, acceso: "Campo", sector: "Campo Trasero", cantMaxPorTipo: 500 },
        { tipo: "Platea Alta", precio: 8000, acceso: "Platea", sector: "Platea Norte", cantMaxPorTipo: 200 },
        { tipo: "Platea Baja", precio: 12000, acceso: "Platea", sector: "Platea Sur", cantMaxPorTipo: 150 },
        { tipo: "VIP Gold", precio: 25000, acceso: "VIP", sector: "Sector VIP", cantMaxPorTipo: 50 },
    ];

    for (const evento of eventos) {
        console.log(`Procesando evento: ${evento.nombre} (ID: ${evento.idEvento})`);

        // Verificar si ya tiene tickets de estos tipos para no duplicar infinitamente si se corre varias veces
        // Simplificación: Agregar siempre, o podrías chequear nombre. Vamos a agregarlos.

        for (const sector of nuevosSectores) {
            await prisma.tipoTicket.create({
                data: {
                    ...sector,
                    idEvento: evento.idEvento
                }
            });
            console.log(`  - Agregado sector: ${sector.tipo}`);
        }
    }

    console.log("Seed de sectores completado.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
