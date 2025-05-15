const Session = require("../models/Session");
const User = require("../models/User");
const {
  iniciarCliente,
  enviarMensaje,
  getQR,
  getEstado,
} = require("../services/whatsapp/whatsapp.service");
const QRCode = require("qrcode");

// 🔹 Iniciar sesión de WhatsApp sin ingresar número
const iniciarSesion = async (req, res) => {
  if (!req.user) {
    console.error("❌ req.user está undefined. Revisa el middleware.");
    return res.status(401).json({ error: "Acceso no autorizado" });
  }

  const userId = req.user; // Asegurar que req.user existe
  await iniciarCliente(userId);
  res.json({ message: "Sesión iniciada correctamente" });
};

// 🔹 Obtener código QR sin número
const obtenerQR = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: "Acceso no autorizado" });
    }

    const userId = req.user._id;
    console.log(`🔍 Solicitando QR para usuario: ${userId}`);

    const qrResponse = getQR(userId);

    if (qrResponse.error) {
      return res.status(400).json({ error: qrResponse.error });
    }

    // Convertimos el QR en imagen base64
    const qrImage = await QRCode.toDataURL(qrResponse.qr);

    res.json({ qr: qrImage });
  } catch (err) {
    console.error("❌ Error generando QR:", err);
    res.status(500).json({ error: "Error generando QR" });
  }
};

// 🔹 Obtener estado de conexión
const verificarEstado = async (req, res) => {
  try {
    if (!req.user) {
      console.error("❌ req.user está undefined. Revisa el middleware.");
      return res.status(401).json({ error: "Acceso no autorizado" });
    }

    const userId = req.user; // Asegurar que req.user existe
    console.log(`🔍 Buscando sesiones para el usuario: ${userId}`);

    const sessions = await Session.find({ userId });

    if (!sessions || sessions.length === 0) {
      console.log("⚠️ No se encontraron sesiones activas.");
      return res.status(404).json({ message: "No hay sesiones activas" });
    }

    console.log(`✅ Sesiones encontradas: ${JSON.stringify(sessions)}`);
    return res.json({ sessions }); // 🚀 Devolver como JSON correctamente
  } catch (error) {
    console.error("❌ Error al obtener sesiones:", error);
    return res.status(500).json({ error: "Error obteniendo sesiones" });
  }
};

// 🔹 Obtener todas las sesiones de WhatsApp en la base de datos
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
      // Si es owner, obtener todas las sesiones activas
      sesiones = await Session.find({ status: 'connected' });
    } else {
      // Si no es owner, solo obtener sus propias sesiones
      sesiones = await Session.find({ userId });
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

    const userId = req.user;
    const userRole = req.user.role;

    let targetUserId = userId;
    
    // Si es owner y proporciona un sessionId, usar esa sesión
    if (userRole === 'owner' && sessionId) {
      const session = await Session.findById(sessionId);
      if (!session) {
        return res.status(404).json({ error: "Sesión no encontrada" });
      }
      targetUserId = session.userId;
    }

    const respuesta = await enviarMensaje(targetUserId, destino, mensaje);
    res.json(respuesta);
  } catch (error) {
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
