const roleMiddleware = (rolesPermitidos) => {
  return (req, res, next) => {
    if (!req.user || !rolesPermitidos.includes(req.user.role)) {
      console.log("Userrrrr", req.user);
      return res.status(403).json({ message: "Acceso denegado: no tienes permisossss" });
    }
    next();
  };
};

module.exports = roleMiddleware;
