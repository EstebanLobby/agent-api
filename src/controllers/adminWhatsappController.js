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

/**
 * Permite a administradores y propietarios enviar mensajes en nombre de otros usuarios
 * @param {Object} req - Request de Express
 * @param {Object} res - Response de Express
 */
const enviarMensajeComoUsuario = async (req, res) => {
  try {
    const { userId, numero, mensaje } = req.body;
    const userRole = req.user.role?.name;

    // 1. Validación de datos básicos
    if (!numero || !mensaje || !userId) {
      return res.status(400).json({ 
        success: false, 
        error: "numero, mensaje y userId son requeridos" 
      });
    }

    // 2. Verificación de permisos basada en roles
    if (!["admin", "owner"].includes(userRole)) {
      return res.status(403).json({ 
        success: false, 
        error: "No tienes permisos para esta acción" 
      });
    }

    // 3. Verificar que el usuario objetivo existe
    const usuarioObjetivo = await User.findById(userId);
    if (!usuarioObjetivo) {
      return res.status(404).json({ 
        success: false, 
        error: "El usuario especificado no existe" 
      });
    }

    // 4. Verificar permisos específicos por rol
    let permisoConcedido = false;

    if (userRole === 'admin') {
      // Los administradores tienen acceso total
      permisoConcedido = true;
    } else if (userRole === 'owner') {
      // Los owners solo pueden enviar mensajes como sus propios usuarios
      const isUserOwnedByOwner = await User.exists({
        _id: userId,
        owner: req.user._id
      });
      
      if (isUserOwnedByOwner) {
        permisoConcedido = true;
      }
    }

    if (!permisoConcedido) {
      return res.status(403).json({ 
        success: false, 
        error: "No tienes permiso para enviar mensajes como este usuario" 
      });
    }



    // 6. Enviar el mensaje usando clientManager
    // Usar el servicio de envío de mensajes que ya funciona
    const respuesta = await enviarMensaje(userId, numero, mensaje);
    
    if (respuesta.error) {    
            return res.status(400).json(respuesta);
      }
        

    
      return res.status(200).json({ 
        success: true, 
        message: "Mensaje enviado exitosamente" 
      });
    
  } catch (error) {
    console.error("❌ Error general en enviarMensajeComoUsuario:", error);
    return res.status(500).json({ 
      success: false, 
      error: "Error interno del servidor" 
    });
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