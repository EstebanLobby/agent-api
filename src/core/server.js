require("dotenv").config();
const express = require("express");
const mongoose = require("../config/database");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const swaggerDocs = require("../config/swagger");
const cookieParser = require("cookie-parser");


const app = express();
const server = http.createServer(app);

// 🚀 Configurar WebSockets después de inicializar el servidor
const io = new Server(server, {
  path: '/socket.io',
  cors: {
    origin: [
      "http://localhost:3000",
      "http://127.0.0.1:3000"
    ],
    methods: ["GET", "POST"],
    credentials: true
  },
});

const PORT = process.env.PORT || 5000;

// 🚀 Conectar a MongoDB antes de iniciar el servidor
const connectDBAndStartServer = async () => {
  try {
    if (mongoose.connection.readyState !== 1) {
      await mongoose.connect(process.env.MONGO_URI, {
        serverSelectionTimeoutMS: 20000,
      });
      console.log("✅ Conectado a MongoDB");
    }

    server.listen(process.env.PORT || 5000, "0.0.0.0", () => {
      console.log(`Server running on port ${process.env.PORT || 5000}`);
    });

    // 🔹 Inicializar el servicio de WhatsApp con `io`
    const { iniciarWhatsAppService, restaurarSesionesActivas } = require("../services/whatsapp/whatsapp.service");
    iniciarWhatsAppService(io);

    // 🔹 Restaurar sesiones activas de WhatsApp
    console.log("🔄 Iniciando restauración de sesiones de WhatsApp...");
    await restaurarSesionesActivas();
    console.log("✅ Restauración de sesiones completada");

  } catch (error) {
    console.error("❌ Error al iniciar el servidor:", error);
    process.exit(1);
  }
};

connectDBAndStartServer();

// 🚀 Configurar middlewares
app.use(
  cors({
    origin: "http://localhost:3000", // Origen específico del frontend
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH"],
    allowedHeaders: ["Content-Type", "Authorization", "Accept"],
    credentials: true, // Importante para las cookies
    exposedHeaders: ["set-cookie"],
  })
);

app.use(express.json());
app.use(cookieParser());

// 🚀 Configurar Swagger
swaggerDocs(app);

// 🚀 Importar rutas
const userRoutes = require("../routes/userRoutes");
const authRoutes = require("../routes/authRoutes");
const whatsappRoutes = require("../routes/whatsappRoutes");
const adminWhatsappRoutes = require("../routes/adminWhatsappRoutes");
const roleRoutes = require("../routes/roleRoutes");

app.use("/api/roles", roleRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/user", userRoutes);
app.use("/api/admin/whatsapp", adminWhatsappRoutes);

// 🔹 Inicializar los sockets
require("../sockets/chatSocket")(io);

// 🚀 Ruta base para probar
app.get("/", (req, res) => {
  res.send("API funcionando con WebSockets 🚀");
});

if (process.env.NODE_ENV === "production") {
  app.use((err, req, res, next) => {
    res.status(500).json({ error: "Algo salió mal!" });
  });
}
