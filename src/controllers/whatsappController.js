const Session = require("../models/Session");
const User = require("../models/User");
const {
  iniciarCliente,
  enviarMensaje,
  getQR,
  getEstado,
  verificarEstadoSesion
} = require("../services/whatsapp/whatsapp.service");
const QRCode = require("qrcode");

// 🔹 Iniciar sesión de WhatsApp
const iniciarSesion = async (req, res) => {
  if (!req.user) {
    console.error("❌ req.user está undefined. Revisa el middleware.");
    return res.status(401).json({ error: "Acceso no autorizado" });
  }

  const userId = req.user;
  const { numero } = req.body;

  if (!numero) {
    return res.status(400).json({ error: "El número de WhatsApp es requerido" });
  }

  try {
    await iniciarCliente(userId, numero);
    res.json({ message: "Sesión iniciada correctamente" });
  } catch (error) {
    console.error("❌ Error al iniciar sesión:", error);
    res.status(500).json({ error: "Error al iniciar sesión de WhatsApp" });
  }
};

// 🔹 Obtener código QR
const obtenerQR = async (req, res) => {
  try {
    const userId = req.user;
    const qr = getQR(userId);

    if (!qr) {
      return res.status(404).json({ error: "QR no disponible" });
    }

    const qrBase64 = await QRCode.toDataURL(qr);
    res.json({ qr: qrBase64 });
  } catch (error) {
    console.error("❌ Error al obtener QR:", error);
    res.status(500).json({ error: "Error al generar QR" });
  }
};

// 🔹 Obtener estado de conexión
const verificarEstado = async (req, res) => {
  try {
    if (!req.user) {
      console.error("❌ req.user está undefined. Revisa el middleware.");
      return res.status(401).json({ error: "Acceso no autorizado" });
    }

    const userId = req.user;
    console.log(`🔍 Verificando estado para el usuario: ${userId}`);

    const estado = await verificarEstadoSesion(userId);
    return res.json(estado);
  } catch (error) {
    console.error("❌ Error al verificar estado:", error);
    return res.status(500).json({ error: "Error verificando estado" });
  }
};

// 🔹 Obtener todas las sesiones de WhatsApp
const obtenerSesiones = async (req, res) => {
  try {
    if (!req.user) {
      console.error("❌ req.user está undefined. Revisa el middleware.");
      return res.status(401).json({ error: "Acceso no autorizado" });
    }

    const userId = req.user;
    const userRole = req.user.role;

    let sesiones;
    if (userRole === 'owner') {
      // Si es owner, obtener todas las sesiones y verificar su estado real
      const todasLasSesiones = await Session.find({ status: 'connected' });
      sesiones = await Promise.all(
        todasLasSesiones.map(async (sesion) => {
          const estado = await verificarEstadoSesion(sesion.userId);
          return {
            ...sesion.toObject(),
            estadoReal: estado
          };
        })
      );
    } else {
      // Si no es owner, solo obtener sus propias sesiones
      const misSesiones = await Session.find({ userId });
      const estado = await verificarEstadoSesion(userId);
      sesiones = misSesiones.map(sesion => ({
        ...sesion.toObject(),
        estadoReal: estado
      }));
    }

    res.json(sesiones);
  } catch (error) {
    console.error("❌ Error al obtener sesiones:", error);
    res.status(500).json({ error: "Error obteniendo sesiones" });
  }
};

// 🔹 Enviar mensaje desde una sesión activa
const enviarMensajeWhatsApp = async (req, res) => {
  try {
    const { destino, mensaje, sessionId } = req.body;
    if (!destino || !mensaje) {
      return res.status(400).json({ error: "Destino y mensaje son requeridos" });
    }

    const userId = req.user._id || req.user;
    const userRole = req.user.role.name;

    let targetUserId = userId;
    
    // Si es admin y proporciona un sessionId, usar esa sesión
    if (userRole === 'admin' && sessionId) {
      const session = await Session.findById(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Sesión no encontrada" });
      }
      // Verificar que la sesión esté realmente activa
      const estado = await verificarEstadoSesion(session.userId);
      if (!estado.isActive) {
        return res.status(400).json({ error: "La sesión no está activa" });
      }
      targetUserId = session.userId;
    }

    const respuesta = await enviarMensaje(targetUserId, destino, mensaje);
    
    if (respuesta.error) {
      console.error(`❌ Error al enviar mensaje: ${respuesta.error}`);
      return res.status(400).json(respuesta);
    }
    
    res.json(respuesta);
  } catch (error) {
    console.error("❌ Error en enviarMensajeWhatsApp:", error);
    res.status(500).json({ error: "Error enviando mensaje de WhatsApp" });
  }
};

module.exports = {
  iniciarSesion,
  obtenerQR,
  verificarEstado,
  enviarMensajeWhatsApp,
  obtenerSesiones,
};
