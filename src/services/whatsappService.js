const { Client, LocalAuth } = require("whatsapp-web.js");
const qrcode = require("qrcode");
const Session = require("../models/Session"); // Modelo en MongoDB
const mongoose = require("mongoose");

const qrCodes = {}; // Mapeo de QRs
const QR_REFRESH_TIME = 30 * 1000; // Tiempo de expiración del QR
let io; // Variable para almacenar `socket.io`

// 🔹 Inicializar el servicio con `io`
function iniciarWhatsAppService(socketIo) {
  io = socketIo;
}

global.clients = global.clients || {}; // 🔹 Objeto global para almacenar clientes activos

// 🔹 Iniciar una sesión de WhatsApp
async function iniciarCliente(userId) {
  console.log(`🚀 Iniciando sesión para el usuario: ${userId}`);

  // ✅ Revisar si el cliente ya está inicializado en memoria
  if (global.clients[userId]) {
    console.log(`🔄 Cliente ya está activo para ${userId}, reutilizándolo...`);
    return global.clients[userId];
  }

  let session = await Session.findOne({ userId });

  if (!session) {
    session = await Session.create({
      userId,
      sessionId: Date.now().toString(),
      status: "created",
    });
  }

  // ✅ Crear e inicializar el cliente si no existe en memoria
  const client = new Client({
    authStrategy: new LocalAuth({ clientId: session.sessionId }),
    puppeteer: {
      headless: true,
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--no-first-run",
        "--no-zygote",
        "--single-process",
        "--disable-gpu",
      ],
    },
  });

  global.clients[userId] = client; // 🔹 Guardamos el cliente en memoria
  console.log("🟢 Cliente de WhatsApp creado, esperando eventos...");

  client.on("qr", async (qr) => {
    console.log(`📱 Generando QR para el usuario ${userId}`);

    if (session.status === "connected") {
      console.log("🛑 Usuario ya conectado, no se genera QR.");
      return;
    }

    if (
      qrCodes[userId] &&
      Date.now() - qrCodes[userId].timestamp < QR_REFRESH_TIME
    ) {
      console.log("🔄 Evitando regeneración inmediata del QR.");
      return;
    }

    qrCodes[userId] = { qr, timestamp: Date.now() };

    try {
      const qrBase64 = await qrcode.toDataURL(qr);
      io.emit("qr_update", qrBase64);
      console.log("✅ QR enviado correctamente.");
    } catch (err) {
      console.error("❌ Error generando QR:", err);
      io.emit("qr_error", "Error al generar el QR.");
    }
  });

  client.on("ready", async () => {
    console.log(`✅ Cliente de WhatsApp conectado para el usuario: ${userId}`);

    io.emit("whatsapp_connected", { userId });

    delete qrCodes[userId];

    try {
      const numero = client.info.wid.user;
      console.log(`📲 Número de WhatsApp conectado: ${numero}`);

      await Session.findOneAndUpdate(
        { userId },
        {
          numero,
          sessionId: session.sessionId,
          status: "connected",
          updatedAt: new Date(),
        }
      );

      console.log(`✅ Sesión guardada en MongoDB para el usuario ${userId}`);
    } catch (error) {
      console.error("❌ Error guardando la sesión en MongoDB:", error);
    }
  });

  client.on("disconnected", async (reason) => {
    console.log(`⚠️ Cliente desconectado (${reason}) para ${userId}`);

    await Session.findOneAndUpdate(
      { sessionId: session.sessionId },
      { status: "disconnected", lastUpdated: new Date() }
    );

    delete global.clients[userId]; // 🔹 Eliminar cliente de memoria al desconectarse
    console.log(`❌ Cliente eliminado de memoria: ${userId}`);
  });

  client.initialize();
  console.log("⚡ Cliente de WhatsApp inicializado.");
}

// 🔹 Obtener QR disponible
function getQR(userId) {
  if (!qrCodes[userId])
    return { error: "QR no disponible, intenta nuevamente" };
  return { qr: qrCodes[userId].qr };
}

// 🔹 Obtener estado de una sesión
async function getEstado(userId) {
  const session = await Session.findOne({ userId });
  return session ? session.status : "not_found";
}

/**
 * Enviar mensaje sin almacenar todos los clientes en memoria
 * @param {string} userId - ID del usuario
 * @param {string} destino - Número destino del mensaje
 * @param {string} mensaje - Contenido del mensaje
 * @returns {Promise<{ success: boolean, message?: string, error?: string }>}
 */
async function enviarMensaje(userId, destino, mensaje) {
  try {
    // 🔹 Verificar si el cliente ya está en memoria
    let client = global.clients[userId];

    if (!client) {
      console.log(
        `🔄 Cliente de ${userId} no encontrado en memoria, intentando recuperar...`
      );

      // 🔹 Buscar la sesión en MongoDB
      const session = await Session.findOne({ userId, status: "connected" });

      if (!session) {
        throw new Error("Sesión no conectada para el usuario especificado");
      }

      // 🔹 Volver a cargar el cliente si no está en memoria
      client = new Client({
        authStrategy: new LocalAuth({ clientId: session.sessionId }),
        puppeteer: { headless: true },
      });

      global.clients[userId] = client; // 🔹 Guardamos el cliente en memoria

      console.log(`🚀 Reinicializando cliente de WhatsApp para ${userId}...`);
      await client.initialize();

      // ✅ Esperar a que el cliente esté `ready`
      await new Promise((resolve) => client.on("ready", resolve));
      console.log(`✅ Cliente de WhatsApp para ${userId} está listo.`);
    }

    // ✅ Asegurar que el cliente está listo antes de enviar mensajes
    if (!client.info) {
      throw new Error("El cliente de WhatsApp no está listo.");
    }

    // 🔹 Asegurar formato correcto del destinatario
    const chatId = destino.includes("@c.us") ? destino : `${destino}@c.us`;

    // 🔹 Enviar mensaje
    await client.sendMessage(chatId, mensaje);

    console.log(`📩 Mensaje enviado a ${destino}`);

    return { success: true, message: `Mensaje enviado a ${destino}` };
  } catch (error) {
    console.error(`❌ Error enviando mensaje: ${error.message}`);
    return { success: false, error: error.message };
  }
}





// 🔹 Eliminar sesión y actualizar estado en MongoDB
async function eliminarSesion(userId) {
  const session = await Session.findOne({ userId });

  if (!session) {
    console.log(`⚠️ No se encontró sesión para ${userId}`);
    return { success: false, error: "Sesión no encontrada" };
  }

  try {
    console.log(`🛑 Cerrando sesión para ${userId}...`);
    const client = new Client({
      authStrategy: new LocalAuth({ clientId: session.sessionId }),
    });

    await client.logout();
    await client.destroy();

    await Session.findOneAndUpdate(
      { userId },
      { status: "disconnected", updatedAt: new Date() }
    );

    console.log(`✅ Sesión de ${userId} cerrada.`);
    return { success: true, message: `Sesión cerrada para ${userId}` };
  } catch (error) {
    console.error(`❌ Error al eliminar sesión ${userId}:`, error);
    return { success: false, error: error.message };
  }
}

// 🔥 Limpiar sesiones inactivas automáticamente
async function limpiarSesionesInactivas() {
  const sesionesInactivas = await Session.find({
    status: "disconnected",
    updatedAt: { $lt: new Date(Date.now() - 3600000) }, // Más de 1 hora inactivo
  });

  for (const sesion of sesionesInactivas) {
    console.log(`🗑 Eliminando sesión inactiva de ${sesion.userId}`);
    await Session.deleteOne({ _id: sesion._id });
  }
}

// 🔄 Ejecutar limpieza de sesiones inactivas cada 10 minutos
setInterval(limpiarSesionesInactivas, 600000);

// 📌 Exportar funciones
module.exports = {
  iniciarWhatsAppService,
  iniciarCliente,
  enviarMensaje,
  getQR,
  getEstado,
  eliminarSesion,
};
