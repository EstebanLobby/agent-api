// clientManager.js
const { Client, LocalAuth } = require("whatsapp-web.js");
const Session = require('../../models/Session');
const fs = require('fs').promises;
const path = require('path');

// Cache en memoria para los clientes activos
global.clients = global.clients || {};

// Función para limpiar archivos de sesión
async function limpiarArchivosSesion(userId) {
  try {
    const sessionDir = path.join(process.cwd(), '.wwebjs_auth', `session-${userId}`);
    if (await fs.access(sessionDir).then(() => true).catch(() => false)) {
      await fs.rm(sessionDir, { recursive: true, force: true });
    }
  } catch (error) {
    console.error(`Error al limpiar archivos de sesión para ${userId}:`, error);
  }
}

// Agregar un cliente a la memoria y actualizar la DB
async function addClient(userId, client) {
  global.clients[userId] = client;
  
  // Actualizar la sesión en la DB
  await Session.findOneAndUpdate(
    { userId },
    { updatedAt: new Date() },
    { new: true }
  );
  
  console.log(`Cliente agregado: ${userId}`);
  return client;
}

// Obtener cliente - primero de memoria, luego intenta inicializar desde DB
async function getClient(userId) {
  // Si ya está en memoria, lo devolvemos
  if (global.clients[userId]) {
    return global.clients[userId];
  }
  
  // Intentar recuperar de la base de datos
  const session = await Session.findOne({ 
    userId, 
    status: 'connected'
  });
  
  if (!session) {
    console.log(`No se encontró sesión activa para el usuario: ${userId}`);
    return null;
  }
  
  try {
    // Intentar inicializar el cliente desde la sesión guardada
    console.log(`Restaurando cliente para el usuario: ${userId}`);
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
          "--disable-gpu"
        ],
      },
    });
    
    // Configurar eventos
    client.on("ready", async () => {
      console.log(`Cliente restaurado y listo: ${userId}`);
      await Session.findOneAndUpdate(
        { userId },
        { 
          status: 'connected',
          updatedAt: new Date()
        }
      );
    });
    
    client.on("disconnected", async (reason) => {
      console.log(`Cliente desconectado: ${userId}, razón: ${reason}`);
      await removeClient(userId);
    });
    
    // Inicializar el cliente
    await client.initialize();
    
    // Guardar en memoria
    global.clients[userId] = client;
    return client;
  } catch (error) {
    console.error(`Error al restaurar cliente: ${userId}`, error);
    return null;
  }
}

// Remover cliente de memoria y actualizar DB
async function removeClient(userId) {
  if (global.clients[userId]) {
    const client = global.clients[userId];
    
    // Remover event listeners primero
    client.removeAllListeners();
    
    // Intentar desconectar limpiamente
    try {
      await client.destroy();
    } catch (err) {
      console.error(`Error al destruir cliente: ${userId}`, err);
    }
    
    // Eliminar de memoria
    delete global.clients[userId];
    
    // Actualizar estado en DB
    await Session.findOneAndUpdate(
      { userId },
      { 
        status: 'disconnected',
        updatedAt: new Date()
      }
    );

    // Limpiar archivos de sesión
    await limpiarArchivosSesion(userId);
    
    console.log(`Cliente eliminado: ${userId}`);
  }
}

// Verificar y limpiar sesiones antiguas
async function limpiarSesionesInactivas() {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - 7); // 7 días de inactividad
  
  const sesionesInactivas = await Session.find({
    updatedAt: { $lt: cutoffDate },
    status: { $ne: 'disconnected' }
  });
  
  for (const session of sesionesInactivas) {
    console.log(`Limpiando sesión inactiva: ${session.userId}`);
    await removeClient(session.userId);
  }
}

module.exports = {
  clients: global.clients,
  getClient,
  addClient,
  removeClient,
  limpiarSesionesInactivas
};