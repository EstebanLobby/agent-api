const Role = require("../models/Role");
const User = require("../models/User");

const roleMiddleware = (allowedRoles) => {
  return async (req, res, next) => {
    try {
      // Buscar el usuario en la base de datos y poblar su rol
      const user = await User.findById(req.user.id).populate('role');
      console.log('roleMiddleware', user.role.name)
      if (!user || !user.role) {
        return res.status(403).json({ message: "Acceso denegado: rol no encontrado" });
      }

      // Verificar si el rol del usuario está en los roles permitidos
      if (!allowedRoles.includes(user.role.name)) {
        return res.status(403).json({ message: "Acceso denegado: no tienes permisos" });
      }

      // Agregar el usuario con su rol poblado a la request
      req.user = user;
      next();
    } catch (error) {
      console.error("❌ Error en roleMiddleware:", error);
      res.status(500).json({ message: "Error al verificar permisos" });
    }
  };
};

module.exports = roleMiddleware;
