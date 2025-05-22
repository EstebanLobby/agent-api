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
    // Validar y normalizar el ID
    if (!userId) {
      console.error('❌ userId es undefined o null');
      return { status: "error", isActive: false };
    }

    // Asegurarnos de que userId sea un string válido
    let userIdStr;
    if (typeof userId === 'object') {
      if (userId._id) {
        userIdStr = userId._id.toString();
      } else if (userId.id) {
        userIdStr = userId.id.toString();
      } else {
        console.error('❌ Formato de userId no válido:', userId);
        return { status: "error", isActive: false };
      }
    } else {
      userIdStr = userId.toString();
    }

    // Verificar que el ID es válido
    if (!userIdStr || userIdStr.length !== 24) {
      console.error('❌ ID de usuario no válido:', userIdStr);
      return { status: "error", isActive: false };
    }
    
    console.log('🔍 Verificando estado de sesión para userId:', userIdStr);
    
    // Primero verificar si hay un cliente activo en memoria
    const client = global.clients[userIdStr];
    if (client && client.pupPage) {
      console.log('✅ Cliente encontrado en memoria y activo');
      return {
        status: "connected",
        isActive: true,
        numero: client.info?.wid?.user || "desconocido",
        lastUpdate: new Date()
      };
    }

    // Si no hay cliente en memoria, verificar en la base de datos
    const session = await Session.findOne({ userId: userIdStr });
    if (!session) {
      console.log('❌ No se encontró sesión para userId:', userIdStr);
      return { status: "not_found", isActive: false };
    }

    // Si la sesión está marcada como conectada pero no hay cliente en memoria,
    // intentar reconectar
    if (session.status === "connected") {
      console.log(`🔄 Sesión marcada como conectada pero cliente no en memoria para ${userIdStr}, intentando reconectar...`);
      try {
        await iniciarCliente(userIdStr, session.numero);
        return {
          status: "reconnecting",
          isActive: false,
          numero: session.numero,
          lastUpdate: session.updatedAt
        };
      } catch (error) {
        console.error(`❌ Error al intentar reconectar: ${error}`);
        await Session.findOneAndUpdate(
          { userId: userIdStr },
          { status: "disconnected", updatedAt: new Date() }
        );
        return { status: "disconnected", isActive: false };
      }
    }

    return {
      status: session.status,
      isActive: false,
      numero: session.numero,
      lastUpdate: session.updatedAt
    };
  } catch (error) {
    console.error(`❌ Error al verificar estado de sesión para ${userId}:`, error);
    // Si hay un error pero tenemos un cliente activo en memoria, considerarlo como conectado
    const client = global.clients[userId];
    if (client && client.pupPage) {
      return {
        status: "connected",
        isActive: true,
        numero: client.info?.wid?.user || "desconocido",
        lastUpdate: new Date()
      };
    }
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
  let client = null; // Declarar client fuera del try para poder usarlo en el catch
  
  try {
    // Validar y normalizar el ID
    if (!userId) {
      console.error('❌ userId es undefined o null');
      return { error: "ID de usuario no válido" };
    }

    // Asegurarnos de que userId sea un string válido
    let userIdStr;
    if (typeof userId === 'object') {
      if (userId._id) {
        userIdStr = userId._id.toString();
      } else if (userId.id) {
        userIdStr = userId.id.toString();
      } else {
        console.error('❌ Formato de userId no válido:', userId);
        return { error: "Formato de usuario no válido" };
      }
    } else {
      userIdStr = userId.toString();
    }

    // Verificar que el ID es válido
    if (!userIdStr || userIdStr.length !== 24) {
      console.error('❌ ID de usuario no válido:', userIdStr);
      return { error: "ID de usuario no válido" };
    }
    
    console.log('🔍 Verificando cliente para usuario:', userIdStr);
    client = await getClient(userIdStr);
    
    if (!client) {
      console.log('🔄 Cliente no encontrado, intentando reconectar...');
      const session = await Session.findOne({ userId: userIdStr });
      if (session) {
        client = await iniciarCliente(userIdStr, session.numero);
      } else {
        console.error('❌ No se encontró sesión para el usuario:', userIdStr);
        return { error: "No se encontró un cliente activo para este usuario" };
      }
    }

    // Verificar que el cliente está realmente inicializado
    if (!client.pupPage) {
      console.error('❌ Cliente no está completamente inicializado');
      return { error: "La sesión de WhatsApp no está completamente inicializada" };
    }

    const numeroFormateado = destino.startsWith('+') ? destino.substring(1) : destino;
    const chatId = `${numeroFormateado}@c.us`;

    console.log('🔍 Intentando enviar mensaje a:', chatId);
    await client.sendMessage(chatId, mensaje);
    console.log('✅ Mensaje enviado exitosamente');
    
    return { success: true, message: "Mensaje enviado correctamente" };
  } catch (error) {
    console.error("❌ Error al enviar mensaje:", error);
    
    // Si el error es de WidFactory o el cliente no está inicializado, intentar reinicializar
    if (error.message?.includes('WidFactory') || (client && !client.pupPage)) {
      console.log('🔄 Intentando reinicializar el cliente...');
      try {
        if (client) {
          await removeClient(userIdStr);
        }
        const session = await Session.findOne({ userId: userIdStr });
        if (session) {
          await iniciarCliente(userIdStr, session.numero);
          return { 
            error: "La sesión se ha reiniciado. Por favor, intenta enviar el mensaje nuevamente." 
          };
        }
      } catch (reinitError) {
        console.error('❌ Error al reinicializar el cliente:', reinitError);
      }
    }
    
    return { 
      error: "Error al enviar mensaje. Por favor, intenta escanear el código QR nuevamente." 
    };
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
