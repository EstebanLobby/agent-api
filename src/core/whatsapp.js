const { Client, LocalAuth } = require('whatsapp-web.js');
const Session = require('../models/Session');
const User = require('../models/User');
const createLogger = require('../utils/logger');

const logger = createLogger({ prefix: '[WhatsApp]' });
const clients = new Map();

// Función para limpiar recursos de una sesión
const cleanupSession = async (userId) => {
  try {
    const client = clients.get(userId);
    if (client) {
      // Remover todos los event listeners
      client.removeAllListeners();
      
      // Intentar cerrar la sesión de manera segura
      try {
        await client.destroy();
      } catch (error) {
        logger.error(`Error al destruir cliente para usuario ${userId}:`, error);
      }
      
      // Remover el cliente del mapa
      clients.delete(userId);
    }

    // Actualizar el estado de la sesión en la base de datos
    await Session.findOneAndUpdate(
      { userId },
      { 
        status: 'disconnected',
        updatedAt: new Date()
      }
    );

    logger.info(`✅ Sesión limpiada para usuario ${userId}`);
  } catch (error) {
    logger.error(`❌ Error al limpiar sesión para usuario ${userId}:`, error);
  }
};

// Función para manejar reconexiones
const handleReconnection = async (userId) => {
  try {
    const session = await Session.findOne({ userId });
    if (!session) {
      logger.error(`❌ No se encontró sesión para usuario ${userId}`);
      return;
    }

    // Intentar reconectar
    await initializeClient(userId, session.numero);
    logger.info(`✅ Reconexión exitosa para usuario ${userId}`);
  } catch (error) {
    logger.error(`❌ Error al reconectar usuario ${userId}:`, error);
  }
};

// Función para inicializar un cliente
const initializeClient = async (userId, phoneNumber) => {
  try {
    // Si ya existe un cliente, limpiarlo primero
    if (clients.has(userId)) {
      await cleanupSession(userId);
    }

    const client = new Client({
      authStrategy: new LocalAuth({ clientId: userId }),
      puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
        headless: true
      }
    });

    // Configurar event listeners
    client.on('qr', async (qr) => {
      logger.info(`📱 Código QR generado para usuario ${userId}`);
      await Session.findOneAndUpdate(
        { userId },
        { 
          qrCode: qr,
          status: 'pending',
          updatedAt: new Date()
        }
      );
    });

    client.on('ready', async () => {
      logger.info(`✅ Cliente conectado para usuario ${userId}`);
      await Session.findOneAndUpdate(
        { userId },
        { 
          status: 'connected',
          qrCode: null,
          updatedAt: new Date()
        }
      );
    });

    client.on('disconnected', async (reason) => {
      logger.warn(`⚠️ Cliente desconectado para usuario ${userId}. Razón: ${reason}`);
      await cleanupSession(userId);
      
      // Intentar reconectar después de 30 segundos
      setTimeout(() => handleReconnection(userId), 30000);
    });

    client.on('auth_failure', async (error) => {
      logger.error(`❌ Error de autenticación para usuario ${userId}:`, error);
      await cleanupSession(userId);
    });

    // Inicializar el cliente
    await client.initialize();
    clients.set(userId, client);
    
    return client;
  } catch (error) {
    logger.error(`❌ Error al inicializar cliente para usuario ${userId}:`, error);
    throw error;
  }
};

// Función para restaurar sesiones
const restoreSessions = async () => {
  try {
    const sessions = await Session.find({ status: 'connected' });
    logger.info(`🔄 Intentando restaurar ${sessions.length} sesiones...`);

    for (const session of sessions) {
      try {
        logger.info(`🔄 Restaurando sesión para usuario ${session.userId}...`);
        await initializeClient(session.userId, session.numero);
      } catch (error) {
        logger.error(`❌ Error al restaurar sesión para usuario ${session.userId}:`, error);
        await Session.findOneAndUpdate(
          { _id: session._id },
          { 
            status: 'disconnected',
            updatedAt: new Date()
          }
        );
      }
    }

    logger.info('✅ Restauración de sesiones completada');
  } catch (error) {
    logger.error('❌ Error al restaurar sesiones:', error);
  }
};

// Función para obtener un cliente
const getClient = (userId) => {
  return clients.get(userId);
};

// Función para cerrar una sesión
const closeSession = async (userId) => {
  try {
    await cleanupSession(userId);
    logger.info(`✅ Sesión cerrada para usuario ${userId}`);
  } catch (error) {
    logger.error(`❌ Error al cerrar sesión para usuario ${userId}:`, error);
    throw error;
  }
};

module.exports = {
  initializeClient,
  restoreSessions,
  getClient,
  closeSession
}; 