const { Client, LocalAuth } = require("whatsapp-web.js");
const Session = require("../../models/Session");
const { handleQR } = require("./handlers/qr.handler");
const { handleReady } = require("./handlers/ready.handler");
const { handleMessage } = require("./handlers/message.handler");
const { handleDisconnected } = require("./handlers/disconnected.handler");
const { clients, getClient, addClient, removeClient } = require("./clientManager");

let io;
const qrCodes = {};
const QR_REFRESH_TIME = 30 * 1000;

function iniciarWhatsAppService(socketIo) {
  io = socketIo;
}

// Función para restaurar sesiones activas
async function restaurarSesionesActivas() {
  try {
    // Buscar todas las sesiones que estaban conectadas
    const sesionesActivas = await Session.find({ status: "connected" });
    console.log(`🔄 Intentando restaurar ${sesionesActivas.length} sesiones...`);

    // Intentar reconectar cada sesión
    for (const sesion of sesionesActivas) {
      try {
        console.log(`🔄 Restaurando sesión para usuario ${sesion.userId}...`);
        await iniciarCliente(sesion.userId, sesion.numero);
      } catch (error) {
        console.error(`❌ Error al restaurar sesión ${sesion.sessionId}:`, error);
        // Marcar la sesión como desconectada si falla la reconexión
        await Session.findOneAndUpdate(
          { sessionId: sesion.sessionId },
          { status: "disconnected", updatedAt: new Date() }
        );
      }
    }
  } catch (error) {
    console.error("❌ Error al restaurar sesiones:", error);
  }
}

async function iniciarCliente(userId, numero) {
  console.log('🔍 ======================');
  console.log('🔍 iniciarCliente INICIO');
  console.log('🔍 userId:', userId);
  console.log('🔍 numero:', numero);
  console.log('🔍 io disponible:', !!io);
  console.log('🔍 io.engine:', !!io?.engine);
  console.log('🔍 clientes conectados:', io?.engine?.clientsCount || 'N/A');
  console.log('🔍 ======================');

  if (clients[userId]) {
    console.log('🔍 Cliente ya existe, retornando...');
    return clients[userId];
  }

  let session = await Session.findOne({ userId });
  console.log('🔍 session encontrada:', session);
  
  if (!session) {
    console.log('🔍 Creando nueva session...');
    session = await Session.create({ 
      userId, 
      sessionId: Date.now().toString(), 
      status: "created",
      numero: numero 
    });
    console.log('🔍 Session creada:', session._id);
  }

  console.log('🔍 Creando cliente WhatsApp...');
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
        "--disable-gpu",
        "--disable-extensions"
      ],
      executablePath: process.env.CHROME_PATH || undefined,
      timeout: 60000
    },
  });

  console.log('🔍 Agregando cliente al manager...');
  addClient(userId, client);

  console.log('🔍 Configurando event listeners...');
  
  client.on("qr", (qr) => {
    console.log('🔍 🔥 ¡EVENTO QR DISPARADO!');
    console.log('🔍 QR length:', qr?.length);
    console.log('🔍 io en evento QR:', !!io);
    console.log('🔍 Llamando handleQR...');
    
    if (!io) {
      console.error('❌ IO NO DISPONIBLE EN EVENTO QR');
      return;
    }
    
    handleQR(io, qr, userId, session, qrCodes, QR_REFRESH_TIME);
  });
  
  client.on("ready", () => {
    console.log('🔍 🔥 ¡EVENTO READY DISPARADO!');
    handleReady(io, userId, client, session);
  });
  
  client.on("message", (msg) => handleMessage(msg, client));
  client.on("disconnected", (reason) => {
    console.log('🔍 🔥 ¡EVENTO DISCONNECTED DISPARADO!', reason);
    handleDisconnected(userId, session, removeClient);
  });

  console.log('🔍 Inicializando cliente WhatsApp...');
  await client.initialize();
  console.log('🔍 ✅ Cliente inicializado exitosamente');
  
  return client;
}

// Función para verificar el estado real de una sesión
async function verificarEstadoSesion(userId) {
  try {
    const session = await Session.findOne({ userId });
    if (!session) return { status: "not_found", isActive: false };

    const client = getClient(userId);
    // Verificamos si el cliente existe y está en memoria
    const isActive = !!client;

    return {
      status: session.status,
      isActive,
      numero: session.numero,
      lastUpdate: session.updatedAt
    };
  } catch (error) {
    console.error(`❌ Error al verificar estado de sesión para ${userId}:`, error);
    return { status: "error", isActive: false };
  }
}

function getQR(userId) {
  if (!qrCodes[userId]) return { error: "QR no disponible" };
  return { qr: qrCodes[userId].qr };
}

async function getEstado(userId) {
  const session = await Session.findOne({ userId });
  return session ? session.status : "not_found";
}

async function enviarMensaje(userId, destino, mensaje) {
  try {
    const client = await getClient(userId);
    
    if (!client) {
      return { error: "No se encontró un cliente activo para este usuario" };
    }

    const numeroFormateado = destino.startsWith('+') ? destino.substring(1) : destino;
    const chatId = `${numeroFormateado}@c.us`;

    await client.sendMessage(chatId, mensaje);
    return { success: true, message: "Mensaje enviado correctamente" };
  } catch (error) {
    console.error("❌ Error al enviar mensaje:", error);
    return { error: error.message || "Error al enviar mensaje" };
  }
}

module.exports = {
  iniciarWhatsAppService,
  iniciarCliente,
  enviarMensaje,
  getQR,
  getEstado,
  restaurarSesionesActivas,
  verificarEstadoSesion
};
