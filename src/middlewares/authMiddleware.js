const jwt = require("jsonwebtoken");
const User = require("../models/User");

const authMiddleware = async (req, res, next) => {
  try {
    console.log("🔐 Middleware de autenticación activado.");

    const authHeader = req.headers.authorization;
    console.log("🛠 Header Authorization recibido:", authHeader);

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
      console.log("✅ Token decodificado:", decoded);
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

    req.user = user; // Ahora `req.user._id` estará disponible
    next();
  } catch (error) {
    console.error("❌ Error en el middleware de autenticación:", error);
    res.status(500).json({ error: "Error interno en la autenticación." });
  }
};

module.exports = authMiddleware;
