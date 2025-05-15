const roleMiddleware = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user || !rolesPermitidos.includes(req.user.role.name)) {
      console.log("Usuario:", req.user);
      return res.status(403).json({ message: "Acceso denegado: no tienes permisos" });
    }
    next();
  };
};

module.exports = roleMiddleware;
