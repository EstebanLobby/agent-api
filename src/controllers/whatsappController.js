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
const Role = require("../models/Role");

// 🔹 Iniciar sesión de WhatsApp
const iniciarSesion = async (req, res) => {
  if (!req.user) {
    console.error("❌ req.user está undefined. Revisa el middleware.");
    return res.status(401).json({ error: "Acceso no autorizado" });
  }

  const userId = req.user.id;
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

    const userId = req.user.id;
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
    const userRole = req.user.role.name;

    let sesiones;
    if (userRole === 'owner') {
      // Si es owner, obtener las sesiones de sus usuarios registrados
      const ownerRole = await Role.findOne({ name: 'owner' }).populate('users');
      const ownerUsers = ownerRole.users.map(user => user._id);
      
      const sesionesDeUsuarios = await Session.find({ 
        userId: { $in: ownerUsers },
        status: 'connected'
      }).populate('userId', 'username email');

      sesiones = await Promise.all(
        sesionesDeUsuarios.map(async (sesion) => {
          const estado = await verificarEstadoSesion(sesion.userId);
          return {
            ...sesion.toObject(),
            estadoReal: estado
          };
        })
      );
    } else if (userRole === 'admin') {
      // Si es admin, obtener todas las sesiones
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
      // Si no es owner ni admin, solo obtener sus propias sesiones
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
    const { destino, mensaje } = req.body;
    if (!destino || !mensaje) {
      return res.status(400).json({ error: "Destino y mensaje son requeridos" });
    }

    // Extraer el ID del usuario de manera segura
    let userId;
    if (req.user._id) {
      userId = req.user._id.toString();
    } else if (req.user.id) {
      userId = req.user.id.toString();
    } else if (typeof req.user === 'string') {
      userId = req.user;
    } else {
      console.error('❌ Formato de usuario no válido:', req.user);
      return res.status(400).json({ error: "Error en el formato del usuario" });
    }

    console.log('🔍 Usuario completo:', req.user);
    console.log('🔍 ID extraído:', userId);
    
    // Verificar que el ID es válido
    if (!userId || userId.length !== 24) {
      console.error('❌ ID de usuario no válido:', userId);
      return res.status(400).json({ error: "ID de usuario no válido" });
    }

    // Verificar estado de la sesión
    const estadoSesion = await verificarEstadoSesion(userId);
    console.log('🔍 Estado de sesión:', estadoSesion);
    
    // Si el estado es error pero tenemos una sesión en la base de datos, intentar usar esa
    if (estadoSesion.status === 'error') {
      const session = await Session.findOne({ userId });
      if (session) {
        console.log('🔄 Intentando usar sesión existente:', session);
        const respuesta = await enviarMensaje(userId, destino, mensaje);
        if (respuesta.success) {
          return res.json(respuesta);
        }
      }
    }

    if (!estadoSesion.isActive) {
      return res.status(400).json({ 
        error: "No hay una sesión activa de WhatsApp. Por favor, escanea el código QR primero." 
      });
    }

    const respuesta = await enviarMensaje(userId, destino, mensaje);
    
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
  enviarMensaje,
};
