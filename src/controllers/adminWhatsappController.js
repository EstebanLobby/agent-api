const { getClient } = require("../services/whatsapp/clientManager");
const Session = require("../models/Session");
const User = require("../models/User");
const { enviarMensaje } = require("../services/whatsapp/whatsapp.service");

// Obtener todas las sesiones activas
const obtenerSesionesActivas = async (req, res) => {
  try {
    const sesiones = await Session.find({ status: "connected" })
      .populate("userId", "username email role");
    
    const sesionesConEstado = sesiones.map(sesion => ({
      ...sesion.toObject(),
      isActive: !!getClient(sesion.userId._id)
    }));

    res.json(sesionesConEstado);
  } catch (error) {
    console.error("❌ Error al obtener sesiones:", error);
    res.status(500).json({ error: "Error al obtener sesiones" });
  }
};

// Enviar mensaje como otro usuario
const enviarMensajeComoUsuario = async (req, res) => {
  const { userId, numero, mensaje } = req.body;

  try {
    // Verificar que el usuario que hace la petición es admin u owner
    if (!["admin", "owner"].includes(req.user.role.name)) {
      return res.status(403).json({ error: "No tienes permisos para esta acción" });
    }

    // Obtener la sesión del usuario
    const sesion = await Session.findOne({ userId });
    if (!sesion) {
      return res.status(404).json({ error: "Sesión no encontrada" });
    }

    // Usar el servicio de envío de mensajes que ya funciona
    const respuesta = await enviarMensaje(userId, numero, mensaje);
    
    if (respuesta.error) {
      return res.status(400).json(respuesta);
    }
    
    res.json(respuesta);
  } catch (error) {
    console.error("❌ Error al enviar mensaje:", error);
    res.status(500).json({ error: "Error al enviar mensaje" });
  }
};

// Obtener estado de conexión de un usuario específico
const obtenerEstadoConexion = async (req, res) => {
  const { userId } = req.params;

  try {
    const sesion = await Session.findOne({ userId });
    if (!sesion) {
      return res.status(404).json({ error: "Sesión no encontrada" });
    }

    const client = getClient(userId);
    const estado = {
      isConnected: !!client,
      status: sesion.status,
      numero: sesion.numero,
      lastUpdate: sesion.updatedAt
    };

    res.json(estado);
  } catch (error) {
    console.error("❌ Error al obtener estado:", error);
    res.status(500).json({ error: "Error al obtener estado de conexión" });
  }
};

module.exports = {
  obtenerSesionesActivas,
  enviarMensajeComoUsuario,
  obtenerEstadoConexion
}; 