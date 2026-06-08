import mongoose from "mongoose";
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';

export const connectDB = async () => {
  try {
    if (!process.env.MONGO_URI) {
      const examplePath = path.resolve(process.cwd(), 'env.example');
      if (fs.existsSync(examplePath)) {
        dotenv.config({ path: examplePath });
        console.warn(`Se cargaron variables desde ${examplePath} como fallback.`);
      }
    }

    const uri = process.env.MONGO_URI || process.env.MONGO_URL;

    if (!uri) {
      throw new Error('La variable de entorno MONGO_URI no está definida. Crea un archivo .env con MONGO_URI o copia env.example a .env');
    }

    await mongoose.connect(uri);

    console.log("Base de datos conectada correctamente");

    mongoose.connection.on("error", (err) => {
      console.error("Error en la base de datos:", err.message);
    });

    mongoose.connection.on("disconnected", () => {
      console.log("Base de datos desconectada");
    });

  } catch (error) {
    console.error("Error al conectar a la base de datos:", error.message);
    process.exit(1);
  }
};