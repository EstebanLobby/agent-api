require("dotenv").config();
const express = require("express");
const mongoose = require("./src/config/db");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const swaggerDocs = require("./src/config/swaggerConfig");
const cookieParser = require("cookie-parser");

const app = express();
const server = http.createServer(app);
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

    server.listen(PORT, "0.0.0.0", () => {
      console.log(`🔥 Servidor corriendo en http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error al conectar con MongoDB:", error);
    process.exit(1);
  }
};

connectDBAndStartServer();

// 🚀 Configurar middlewares
app.use(express.json());
app.use(cors({ origin: "http://localhost:3000", credentials: true }));
app.use(cookieParser());

// 🚀 Configurar Swagger
swaggerDocs(app);

// 🚀 Importar rutas
const userRoutes = require("./src/routes/userRoutes");
const authRoutes = require("./src/routes/authRoutes");
const whatsappRoutes = require("./src/routes/whatsappRoutes");

app.use("/api/auth", authRoutes);
app.use("/api/whatsapp", whatsappRoutes);
app.use("/api/users", userRoutes);

// 🚀 Configurar WebSockets después de inicializar el servidor
const io = new Server(server, {
  cors: {
    origin: "*", // 🔹 Permite conexiones de cualquier origen
    methods: ["GET", "POST"],
  },
});

// 🔹 Inicializar el servicio de WhatsApp con `io`
const { iniciarWhatsAppService } = require("./src/services/whatsappService");
iniciarWhatsAppService(io);

// 🔹 Inicializar los sockets
require("./src/sockets/chatSocket")(io);

// 🚀 Ruta base para probar
app.get("/", (req, res) => {
  res.send("API funcionando con WebSockets 🚀");
});
