import mongoose from "mongoose";

export const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

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