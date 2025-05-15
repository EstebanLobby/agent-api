const bcrypt = require("bcryptjs");
const User = require("../../models/User");
const Role = require("../../models/Role");

module.exports = async (email, password) => {
  const user = await User.findOne({ email });
  if (!user) throw new Error("Usuario no encontrado");

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error("Contraseña incorrecta");

  const role = await Role.findById(user.role).lean();
  if (!role) throw new Error("Rol no encontrado");

  return {
    user: {
      ...user.toObject(),
    
      role: {
        id: role._id,
        name: role.name
      }
    },
    role
  };
};
