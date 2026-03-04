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

export const sendPasswordResetEmail = async (
    email: string,
    resetUrl: string
) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false,
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
            subject: "Recuperación de contraseña",
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #4F46E5; text-align: center;">Recuperación de Contraseña</h2>
          <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente botón para continuar:</p>
          
          <div style="text-align: center; margin-top: 30px; margin-bottom: 20px;">
             <a href="${resetUrl}" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Restablecer Contraseña</a>
          </div>
          <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
          <p>Este enlace expirará en 1 hora.</p>
        </div>
      `,
        };

        await transporter.sendMail(mailOptions);
        return true;
    } catch (error) {
        console.error("Error al enviar correo de recuperación:", error);
        return false;
    }
};

export const sendEventCancellationEmail = async (
    email: string,
    notificationInfo: {
        evento: string;
        fecha: string;
        usuario: string;
    }
) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false,
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
            subject: `IMPORTANTE: Cancelación de evento ${notificationInfo.evento}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #ef4444; text-align: center;">Evento Cancelado</h2>
          <p>Hola <strong>${notificationInfo.usuario}</strong>,</p>
          <p>Lamentamos informarte que el evento <strong>${notificationInfo.evento}</strong>, programado para el <strong>${notificationInfo.fecha}</strong>, ha sido cancelado.</p>
          
          <div style="background-color: #fef2f2; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #ef4444;">
            <p style="margin: 5px 0;"><strong>Motivo:</strong> Cancelación por parte del organizador.</p>
            <p style="margin: 5px 0;"><strong>Reembolso:</strong> Tu entrada ha sido marcada como "reembolsada". El proceso de devolución de dinero se realizará a través del mismo medio de pago utilizado.</p>
          </div>

          <p style="color: #4b5563;">Si tienes alguna duda, puedes contactarnos respondiendo a este correo.</p>
          
          <div style="text-align: center; margin-top: 30px; margin-bottom: 20px;">
             <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/clientes/mis-tickets" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Ver mis tickets</a>
          </div>
        </div>
      `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Correo de cancelación enviado: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error al enviar correo de cancelación:", error);
        return false;
    }
};

export const sendEventDateChangeEmail = async (
    email: string,
    notificationInfo: {
        evento: string;
        fechaAntigua: string;
        fechaNueva: string;
        usuario: string;
    }
) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false,
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
            subject: `IMPORTANTE: Cambio de fecha de evento ${notificationInfo.evento}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #f59e0b; text-align: center;">Cambio de Fecha de Evento</h2>
          <p>Hola <strong>${notificationInfo.usuario}</strong>,</p>
          <p>Te informamos que el evento <strong>${notificationInfo.evento}</strong> ha cambiado de fecha.</p>
          
          <div style="background-color: #fffbeb; padding: 15px; border-radius: 8px; margin-bottom: 20px; border-left: 4px solid #f59e0b;">
            <p style="margin: 5px 0;"><strong>Fecha Anterior:</strong> <del>${notificationInfo.fechaAntigua}</del></p>
            <p style="margin: 5px 0;"><strong>Nueva Fecha:</strong> ${notificationInfo.fechaNueva}</p>
          </div>

          <p style="color: #4b5563;">Tu entrada sigue siendo válida para la nueva fecha. Si no puedes asistir en esta nueva fecha, por favor, ponte en contacto con soporte.</p>
          
          <div style="text-align: center; margin-top: 30px; margin-bottom: 20px;">
             <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/clientes/mis-tickets" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Ver mis tickets</a>
          </div>
        </div>
      `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Correo de cambio de fecha enviado: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error al enviar correo de cambio de fecha:", error);
        return false;
    }
};

export const sendTransferOfferEmail = async (
    email: string,
    transferInfo: {
        evento: string;
        usuarioOrigen: string;
        nroTicket: number;
    }
) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false,
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
            subject: `Has recibido un ofrecimiento de ticket para ${transferInfo.evento}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #4F46E5; text-align: center;">Ofrecimiento de Ticket</h2>
          <p>Hola,</p>
          <p><strong>${transferInfo.usuarioOrigen}</strong> te ha enviado un ticket para el evento <strong>${transferInfo.evento}</strong> (Ticket #${transferInfo.nroTicket}).</p>
          
          <p>Para recibirlo, debes aceptar la transferencia desde tu cuenta.</p>
          
          <div style="text-align: center; margin-top: 30px; margin-bottom: 20px;">
             <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/clientes/mis-tickets" style="background-color: #4F46E5; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">Ver Mis Tickets</a>
          </div>
        </div>
      `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Correo de oferta de transferencia enviado: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error al enviar correo de oferta de transferencia:", error);
        return false;
    }
};

export const sendTransferAcceptedEmail = async (
    email: string,
    transferInfo: {
        evento: string;
        usuarioDestino: string;
        nroTicket: number;
    }
) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false,
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
            subject: `Tu ticket para ${transferInfo.evento} fue aceptado`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #4F46E5; text-align: center;">Transferencia Aceptada</h2>
          <p>Hola,</p>
          <p>Te informamos que <strong>${transferInfo.usuarioDestino}</strong> ha aceptado el ticket #${transferInfo.nroTicket} que le transferiste para el evento <strong>${transferInfo.evento}</strong>.</p>
          
          <p>El ticket ya no aparecerá en tu cuenta.</p>
        </div>
      `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Correo de transferencia aceptada enviado: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error al enviar correo de transferencia aceptada:", error);
        return false;
    }
};

export const sendRefundEmail = async (
    email: string,
    refundInfo: {
        evento: string;
        usuario: string;
        nroTicket: number;
        monto: number;
    }
) => {
    try {
        const transporter = nodemailer.createTransport({
            host: process.env.SMTP_HOST || "smtp.gmail.com",
            port: Number(process.env.SMTP_PORT) || 587,
            secure: false,
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
            subject: `Reembolso procesado para ${refundInfo.evento}`,
            html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #4F46E5; text-align: center;">Reembolso Exitoso</h2>
          <p>Hola <strong>${refundInfo.usuario}</strong>,</p>
          <p>Te informamos que se ha procesado con éxito el reembolso de tu ticket #${refundInfo.nroTicket} para el evento <strong>${refundInfo.evento}</strong> por un monto de $${refundInfo.monto}.</p>
          
          <p>El dinero será acreditado en el mismo medio de pago que utilizaste para la compra.</p>
        </div>
      `,
        };

        const info = await transporter.sendMail(mailOptions);
        console.log("Correo de reembolso enviado: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error al enviar correo de reembolso:", error);
        return false;
    }
};
