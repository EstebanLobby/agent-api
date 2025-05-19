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

    const user = await User.findById(decoded.id).populate('role');
    if (!user) {
      console.error("❌ Usuario no encontrado en la base de datos.");
      return res.status(404).json({ error: "Usuario no encontrado." });
    }

    console.log(`👤 Usuario autenticado: ${user.email}`);

    // Asegurarnos de que el rol existe
    if (!user.role) {
      console.error("❌ Usuario sin rol asignado");
      return res.status(403).json({ error: "Usuario sin rol asignado" });
    }

    req.user = {
      id: user._id,
      email: user.email,
      username: user.username,
      role: {
        id: user.role._id,
        name: user.role.name
      }
    };
    
    next();
  } catch (error) {
    console.error("❌ Error en el middleware de autenticación:", error);
    res.status(500).json({ error: "Error interno en la autenticación." });
  }
};

module.exports = authMiddleware;
