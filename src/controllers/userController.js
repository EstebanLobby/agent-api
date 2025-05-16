const User = require("../models/User");
const jwt = require("jsonwebtoken");
const Role = require("../models/Role");
const editProfileService = require("../services/user/editProfile.service");

// 🔥 Obtener todos los usuarios con sus sesiones (solo ADMIN)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password") // Excluye la contraseña
      .populate("role", "name") // Obtiene el rol del usuario
      .lean();

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

    const role = await Role.findById(user.role).lean();
    if (!role) return res.status(400).json({ message: "Rol no encontrado" });

    const userResponse = {
      ...user.toObject(),
      role: {
        id: role._id,
        name: role.name
      }
    };

    res.status(200).json(userResponse);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// 🔥 Actualizar el rol de un usuario (solo ADMIN)
const updateUserRole = async (req, res) => {
  try {
    const { userId } = req.params;
    const { roleId } = req.body;

    // Verificar que el rol existe
    const role = await Role.findById(roleId);
    if (!role) {
      return res.status(404).json({ message: "Rol no encontrado" });
    }

    // Actualizar el rol del usuario
    const user = await User.findByIdAndUpdate(
      userId,
      { role: roleId },
      { new: true }
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    res.status(200).json({
      message: "Rol actualizado correctamente",
      user
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const getProfile = async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No autorizado" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password").lean();
    if (!user) return res.status(404).json({ message: "Usuario no encontrado" });

    const role = await Role.findById(user.role).lean();
    if (!role) return res.status(400).json({ message: "Rol no encontrado" });

    res.status(200).json({
      ...user,
      role: role.name,
      permissions: role.permissions || [],
    });
  } catch (err) {
    console.error("Error en /me:", err);
    res.status(401).json({ message: "Token inválido o expirado" });
  }
};

const editProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const updatedUser = await editProfileService(userId, req.body);

    res.status(200).json({
      success: true,
      message: "Perfil actualizado correctamente.",
      data: updatedUser,
    });
  } catch (error) {
    console.error("Error al editar el perfil:", error);
    res.status(500).json({
      success: false,
      message: "Hubo un error al actualizar el perfil.",
    });
  }
};

module.exports = {
  getAllUsers,
  getUserProfile,
  getProfile,
  editProfile,
  updateUserRole,
};
