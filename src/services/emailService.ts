import nodemailer from "nodemailer";
import QRCode from "qrcode";

export const sendTicketEmail = async (
    email: string,
    ticketInfo: {
        evento: string;
        fecha: string;
        usuario: string;
        precio: number;
        nroTicket: number;
        qrData: string; // The token to generate QR
    }
) => {
    try {
        // Generate QR as Buffer
        // Generate QR as Buffer
        // const qrBuffer = await QRCode.toDataURL(ticketInfo.qrData);

        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false, // true for 465, false for other ports
            auth: {
                user: process.env.SMTP_USER,
                pass: process.env.SMTP_PASS,
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        const mailOptions = {
            from: `"Ticketera QR" <${process.env.SMTP_USER}>`,
            to: email,
            subject: `¡Tu entrada para ${ticketInfo.evento} está lista!`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #4F46E5; text-align: center;">¡Compra Confirmada!</h2>
          <p>Hola <strong>${ticketInfo.usuario}</strong>,</p>
          <p>Gracias por tu compra. Aquí tienes los detalles de tu entrada:</p>
          
          <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 5px 0;"><strong>Evento:</strong> ${ticketInfo.evento}</p>
            <p style="margin: 5px 0;"><strong>Fecha:</strong> ${ticketInfo.fecha}</p>
            <p style="margin: 5px 0;"><strong>Precio:</strong> $${ticketInfo.precio}</p>
            <p style="margin: 5px 0;"><strong>Nro. Ticket:</strong> #${ticketInfo.nroTicket}</p>
          </div>

          <div style="text-align: center; margin-top: 30px; margin-bottom: 20px;">
             <p style="color: #4b5563; margin-bottom: 20px;">Puedes ver y descargar tu código QR accediendo a tu cuenta:</p>
             <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/clientes/mis-tickets" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Ver Mis Tickets</a>
          </div>
        </div>
      `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Correo enviado: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error al enviar correo:", error);
        return false;
    }
};
