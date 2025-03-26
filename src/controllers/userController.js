const User = require("../models/User");

// 🔥 Obtener todos los usuarios con sus sesiones (solo ADMIN)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password") // Excluye la contraseña
      .populate("sessions"); // Obtiene las sesiones del usuario

    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔥 Obtener el perfil del usuario autenticado
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    if (!user)
      return res.status(404).json({ message: "Usuario no encontrado" });

    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getAllUsers, getUserProfile };
