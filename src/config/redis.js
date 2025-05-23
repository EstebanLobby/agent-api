// 📁 Primero crear config/redis.js (agregar este archivo)
const Redis = require('redis');

let redisClient = null;
let isRedisConnected = false;

// Configurar conexión Redis
async function initRedis() {
  try {
    // En desarrollo, usar Redis local
    const redisUrl = 'redis://127.0.0.1:6379';
    console.log('🔌 Intentando conectar a Redis local...');

    redisClient = Redis.createClient({
      url: redisUrl,
      socket: {
        connectTimeout: 5000,
        reconnectStrategy: (retries) => {
          console.log(`🔄 Reconectando Redis (intento ${retries})`);
          return Math.min(retries * 1000, 5000);
        }
      },
      pingInterval: 5000,
      maxRetriesPerRequest: 3
    });

    redisClient.on('error', (err) => {
      console.error('❌ Redis Error:', err);
      isRedisConnected = false;
    });

    redisClient.on('connect', () => {
      console.log('✅ Redis conectado - Anti-spam activo');
      isRedisConnected = true;
    });

    redisClient.on('reconnecting', () => {
      console.log('🔄 Reconectando a Redis...');
    });

    redisClient.on('end', () => {
      console.log('❌ Conexión a Redis cerrada');
      isRedisConnected = false;
    });

    await redisClient.connect();
    return true;
  } catch (error) {
    console.error('❌ Error conectando Redis:', error);
    isRedisConnected = false;
    return false;
  }
}

// Verificar límites con Redis
async function canSendMessage(userId, destino) {
  if (!isRedisConnected) {
    console.log('⚠️ Redis no conectado, permitiendo envío');
    return { canSend: true };
  }

  try {
    const now = Date.now();
    const minute = Math.floor(now / 60000);
    const hour = Math.floor(now / 3600000);
    const day = Math.floor(now / 86400000);

    const keys = {
      perMinute: `rate:${userId}:minute:${minute}`,
      perHour: `rate:${userId}:hour:${hour}`,
      perDay: `rate:${userId}:day:${day}`,
      sameNumberHour: `rate:${userId}:${destino}:hour:${hour}`,
      lastMessage: `last:${userId}`,
      inBreak: `break:${userId}`
    };

    // Verificar pausa obligatoria
    const breakUntil = await redisClient.get(keys.inBreak);
    if (breakUntil && parseInt(breakUntil) > now) {
      const waitTime = parseInt(breakUntil) - now;
      return {
        canSend: false,
        reason: 'Sistema en pausa por seguridad',
        waitTime,
        waitTimeFormatted: formatTime(waitTime)
      };
    }

    // Obtener contadores
    const [perMinute, perHour, perDay, sameNumberHour, lastMessage] = await Promise.all([
      redisClient.get(keys.perMinute),
      redisClient.get(keys.perHour),
      redisClient.get(keys.perDay),
      redisClient.get(keys.sameNumberHour),
      redisClient.get(keys.lastMessage)
    ]);

    // Verificar límite por minuto (2 max)
    if (parseInt(perMinute || 0) >= 2) {
      return {
        canSend: false,
        reason: 'Límite por minuto alcanzado (máx. 2 mensajes/minuto)',
        waitTime: 60000 - (now % 60000),
        waitTimeFormatted: formatTime(60000 - (now % 60000))
      };
    }

    // Verificar límite por hora (30 max)
    if (parseInt(perHour || 0) >= 30) {
      const waitTime = 3600000 - (now % 3600000);
      return {
        canSend: false,
        reason: `Límite por hora alcanzado (${perHour}/30 mensajes)`,
        waitTime,
        waitTimeFormatted: formatTime(waitTime)
      };
    }

    // Verificar límite por día (120 max)
    if (parseInt(perDay || 0) >= 120) {
      const waitTime = 86400000 - (now % 86400000);
      return {
        canSend: false,
        reason: `Límite diario alcanzado (${perDay}/120 mensajes)`,
        waitTime,
        waitTimeFormatted: formatTime(waitTime)
      };
    }

    // Verificar límite al mismo número (3 por hora max)
    if (parseInt(sameNumberHour || 0) >= 3) {
      return {
        canSend: false,
        reason: 'Muchos mensajes al mismo número (máx. 3/hora)',
        waitTime: 3600000 - (now % 3600000),
        waitTimeFormatted: formatTime(3600000 - (now % 3600000))
      };
    }

    // Verificar tiempo mínimo entre mensajes (30 segundos)
    if (lastMessage) {
      const timeSince = now - parseInt(lastMessage);
      if (timeSince < 30000) {
        return {
          canSend: false,
          reason: 'Muy poco tiempo desde el último mensaje (mín. 30 seg)',
          waitTime: 30000 - timeSince,
          waitTimeFormatted: formatTime(30000 - timeSince)
        };
      }
    }

    return { canSend: true };
  } catch (error) {
    console.error('❌ Error verificando límites:', error);
    return { canSend: true }; // Si falla Redis, permitir envío
  }
}

// Registrar mensaje enviado
async function recordMessage(userId, destino) {
  if (!isRedisConnected) return;

  try {
    const now = Date.now();
    const minute = Math.floor(now / 60000);
    const hour = Math.floor(now / 3600000);
    const day = Math.floor(now / 86400000);

    const keys = {
      perMinute: `rate:${userId}:minute:${minute}`,
      perHour: `rate:${userId}:hour:${hour}`,
      perDay: `rate:${userId}:day:${day}`,
      sameNumberHour: `rate:${userId}:${destino}:hour:${hour}`,
      lastMessage: `last:${userId}`,
      totalCount: `total:${userId}`
    };

    // Incrementar contadores
    const pipeline = redisClient.multi();
    pipeline.incr(keys.perMinute);
    pipeline.incr(keys.perHour);
    pipeline.incr(keys.perDay);
    pipeline.incr(keys.sameNumberHour);
    pipeline.incr(keys.totalCount);
    pipeline.set(keys.lastMessage, now.toString());
    
    // Establecer expiraciones
    pipeline.expire(keys.perMinute, 60);
    pipeline.expire(keys.perHour, 3600);
    pipeline.expire(keys.perDay, 86400);
    pipeline.expire(keys.sameNumberHour, 3600);
    pipeline.expire(keys.lastMessage, 86400);

    await pipeline.exec();

    // Verificar si necesita pausa cada 15 mensajes
    const totalCount = await redisClient.get(keys.totalCount);
    if (parseInt(totalCount) % 15 === 0) {
      const breakUntil = Date.now() + 900000; // 15 minutos
      await redisClient.set(`break:${userId}`, breakUntil.toString());
      await redisClient.expire(`break:${userId}`, 900);
      console.log(`⏸️ Pausa programada para ${userId} hasta ${new Date(breakUntil).toLocaleTimeString()}`);
    }

    console.log(`📊 Mensaje registrado para ${userId}. Total día: ${await redisClient.get(keys.perDay)}`);
  } catch (error) {
    console.error('❌ Error registrando mensaje:', error);
  }
}

// Formatear tiempo
function formatTime(milliseconds) {
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) return `${hours}h ${minutes % 60}m`;
  if (minutes > 0) return `${minutes}m ${seconds % 60}s`;
  return `${seconds}s`;
}

module.exports = { initRedis, canSendMessage, recordMessage };
