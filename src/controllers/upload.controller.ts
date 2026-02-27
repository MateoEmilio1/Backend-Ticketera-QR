import { Request, Response } from "express";
import { createClient } from "@supabase/supabase-js";

// Asegúrate de tener estas variables en tu archivo .env
// SUPABASE_URL="https://tu-proyecto.supabase.co"
// SUPABASE_KEY="tu-anon-key-o-service-role-key"

export const uploadFile = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ error: true, message: "No file provided" });
      return;
    }

    const supabaseUrl = process.env.SUPABASE_URL;
    const supabaseKey = process.env.SUPABASE_KEY;

    if (!supabaseUrl || !supabaseKey) {
      res.status(500).json({ error: true, message: "Faltan las credenciales de Supabase en el .env" });
      return;
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Generamos un nombre único para evitar sobreescribir archivos con el mismo nombre
    const uniqueFilename = `${Date.now()}-${file.originalname}`;

    const bucketName = "imagenes_eventos"; // Reemplaza esto con el nombre de tu bucket en Supabase

    // Subimos el archivo a Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(uniqueFilename, file.buffer, {
        contentType: file.mimetype,
        upsert: false // Cambiar a true si quieres sobreescribir archivos existentes
      });

    if (uploadError) {
      console.error("Error al subir a Supabase:", uploadError);
      res.status(500).json({ error: true, message: "Error al subir la imagen a Supabase Storage" });
      return;
    }

    // Obtenemos la URL pública del archivo subido
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(uploadData.path);

    res.status(200).json({
      error: false,
      message: "Archivo subido exitosamente a Supabase Storage",
      url: publicUrlData.publicUrl,
    });

  } catch (error) {
    console.error("Error en uploadFile:", error);
    res.status(500).json({ error: true, message: "Error interno del servidor al subir el archivo" });
  }
};
