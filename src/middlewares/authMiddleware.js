const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Role = require("../models/Role");

const authMiddleware = async (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;
  
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      console.error("❌ No se proporcionó un token válido.");
      return res
        .status(401)
        .json({ error: "Acceso denegado. Token no proporcionado." });
    }

    const token = authHeader.split(" ")[1];
    console.log(`🔍 Token recibido: ${token}`);

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
  
    } catch (error) {
      console.error("❌ Error verificando el token:", error.message);
      return res.status(401).json({ error: "Token inválido o expirado." });
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      console.error("❌ Usuario no encontrado en la base de datos.");
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    console.log(`👤 Usuario autenticado: ${user.email}`);

    const role = await Role.findById(user.role).lean();

    req.user = {
      ...user.toObject(),
      role: {
        id: role._id,
        name: role.name
      }
    };
    
    next();
  } catch (error) {
    console.error("❌ Error en el middleware de autenticación:", error);
    res.status(500).json({ error: "Error interno en la autenticación." });
  }
};

module.exports = authMiddleware;
