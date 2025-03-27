require("dotenv").config();
const express = require("express");
const mongoose = require("./config/db");
const cors = require("cors");
const http = require("http");
const { Server } = require("socket.io");
const swaggerDocs = require("./config/swaggerConfig");
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

    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Error al conectar con MongoDB:", error);
    process.exit(1);
  }
};

connectDBAndStartServer();

// 🚀 Configurar middlewares
app.use(
  cors({
    origin: "*", // Permite todos los orígenes
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"], // Métodos permitidos
    allowedHeaders: ["Content-Type", "Authorization"], // Headers permitidos
  })
);

app.use(express.json());
app.use(cookieParser());

// 🚀 Configurar Swagger
swaggerDocs(app);

// 🚀 Importar rutas
const userRoutes = require("./routes/userRoutes");
const authRoutes = require("./routes/authRoutes");
const whatsappRoutes = require("./routes/whatsappRoutes");

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
const { iniciarWhatsAppService } = require("./services/whatsappService");
iniciarWhatsAppService(io);

// 🔹 Inicializar los sockets
require("./sockets/chatSocket")(io);

// 🚀 Ruta base para probar
app.get("/", (req, res) => {
  res.send("API funcionando con WebSockets 🚀");
});

if (process.env.NODE_ENV === "production") {
  app.use((err, req, res, next) => {
    res.status(500).json({ error: "Algo salió mal!" });
  });
}
