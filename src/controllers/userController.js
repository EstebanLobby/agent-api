const User = require("../models/User");
const jwt = require("jsonwebtoken");
const Role = require("../models/Role");
const editProfileService = require("../services/user/editProfile.service");
const createUserService = require("../services/user/create-user.service");
const Session = require("../models/Session");
const mongoose = require("mongoose");

// 🔥 Obtener todos los usuarios (solo ADMIN)
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find()
      .select("-password") // Excluye la contraseña
      .populate('role', 'name')
      .lean();

    // Transformar la respuesta para incluir el rol como objeto
    const usersWithRole = users.map(user => ({
      ...user,
      role: {
        id: user.role._id,
        name: user.role.name
      }
    }));

    res.status(200).json(usersWithRole);
  } catch (error) {
    console.error("❌ Error al obtener usuarios:", error);
    res.status(500).json({ 
      error: "Error al obtener usuarios",
      details: error.message 
    });
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
    )
    .select("-password")
    .populate('role', 'name')
    .lean();

    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Transformar la respuesta para incluir el rol como objeto
    const userResponse = {
      ...user,
      role: {
        id: user.role._id,
        name: user.role.name
      }
    };

    res.status(200).json({
      message: "Rol actualizado correctamente",
      user: userResponse
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

// 🔥 Eliminar un usuario (solo ADMIN)
const deleteUser = async (req, res) => {
  try {
    const { userId } = req.params;

    // Verificar que el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Eliminar el usuario
    await User.findByIdAndDelete(userId);

    // Si el usuario tenía sesiones de WhatsApp, eliminarlas también
    await Session.deleteMany({ userId });

    res.status(200).json({ 
      message: "Usuario eliminado correctamente",
      deletedUser: {
        id: user._id,
        username: user.username,
        email: user.email
      }
    });
  } catch (error) {
    console.error("❌ Error al eliminar usuario:", error);
    res.status(500).json({ error: error.message });
  }
};

// Asignar un owner a un usuario
const assignOwnerToUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { ownerId } = req.body;

    // Validar que el ID del usuario sea válido
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: "ID de usuario inválido" });
    }

    // Validar que el ID del owner sea válido
    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(400).json({ message: "ID de owner inválido" });
    }

    // Verificar que el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar que el owner existe y tiene el rol correcto
    const owner = await User.findById(ownerId).populate('role');
    if (!owner) {
      return res.status(404).json({ message: "Owner no encontrado" });
    }

    if (owner.role.name !== 'owner') {
      return res.status(400).json({ message: "El usuario especificado no es un owner" });
    }

    // Asignar el owner al usuario
    user.owner = ownerId;
    await user.save();

    res.status(200).json({
      message: "Owner asignado correctamente",
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        owner: {
          id: owner._id,
          username: owner.username,
          email: owner.email
        }
      }
    });
  } catch (error) {
    console.error("❌ Error al asignar owner:", error);
    res.status(500).json({ error: error.message });
  }
};

// 🔥 Suspender/Reactivar un usuario (solo ADMIN)
const suspendUser = async (req, res) => {
  try {
    const { userId } = req.params;
    const { reason, action } = req.body;

    // Verificar que el usuario existe
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Determinar la acción basada en el parámetro action o el estado actual
    const shouldSuspend = action === 'suspend' ? true : action === 'activate' ? false : !user.isSuspended;

    // Actualizar el estado del usuario
    user.isSuspended = shouldSuspend;
    user.suspendedReason = shouldSuspend ? reason : null;
    user.suspendedUntil = shouldSuspend ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) : null; // 30 días por defecto

    await user.save();

    res.status(200).json({
      message: shouldSuspend ? "Usuario suspendido correctamente" : "Usuario reactivado correctamente",
      user: {
        ...user.toObject(),
        password: undefined
      }
    });
  } catch (error) {
    console.error("❌ Error al suspender/reactivar usuario:", error);
    res.status(500).json({ error: error.message });
  }
};

// 🔥 Crear un nuevo usuario (solo ADMIN)
const createUser = async (req, res) => {
  try {
    const userData = req.body;

    // Crear el usuario usando el servicio
    const newUser = await createUserService(userData);

    res.status(201).json({
      message: "Usuario creado correctamente",
      user: newUser
    });
  } catch (error) {
    console.error("❌ Error al crear usuario:", error);
    res.status(400).json({ 
      message: error.message || "Error al crear el usuario"
    });
  }
};

module.exports = {
  getAllUsers,
  getUserProfile,
  getProfile,
  editProfile,
  updateUserRole,
  deleteUser,
  assignOwnerToUser,
  suspendUser,
  createUser
};
