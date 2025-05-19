const Role = require("../models/Role");
const User = require("../models/User");
const mongoose = require("mongoose");

// Obtener todos los roles
const getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find()
      .select('_id name')
      .lean();

    res.status(200).json(roles);
  } catch (error) {
    console.error("❌ Error al obtener roles:", error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener usuarios de un owner específico (solo ADMIN)
const getOwnerUsersById = async (req, res) => {
  try {
    const { ownerId } = req.params;

    // Validar que el ID sea un ObjectId válido
    if (!mongoose.Types.ObjectId.isValid(ownerId)) {
      return res.status(400).json({ 
        message: "ID de owner inválido",
        users: []
      });
    }

    // Primero verificamos que el usuario existe y es un owner
    const owner = await User.findById(ownerId)
      .populate('role')
      .lean();

    if (!owner) {
      return res.status(404).json({ 
        message: "Usuario no encontrado",
        users: []
      });
    }

    if (owner.role.name !== 'owner') {
      return res.status(400).json({ 
        message: "El usuario especificado no es un owner",
        users: []
      });
    }

    // Buscamos todos los usuarios que tengan este owner asignado
    const users = await User.find({ 
      owner: ownerId
    })
    .select('username email role createdAt updatedAt')
    .populate('role', 'name')
    .lean();

    res.status(200).json({
      owner: {
        id: owner._id,
        username: owner.username,
        email: owner.email
      },
      users,
      total: users.length
    });
  } catch (error) {
    console.error("❌ Error al obtener usuarios del owner:", error);
    res.status(500).json({ 
      error: "Error al obtener usuarios del owner",
      details: error.message 
    });
  }
};

// Obtener todos los owners con sus usuarios asignados
const getOwners = async (req, res) => {
  try {
    // Primero obtenemos el rol "owner"
    const ownerRole = await Role.findOne({ name: "owner" });
    
    if (!ownerRole) {
      return res.status(404).json({ 
        message: "No se encontró el rol de owner en el sistema",
        owners: []
      });
    }

    // Buscamos todos los usuarios que tengan el rol de owner
    const owners = await User.find({ role: ownerRole._id })
      .select("username email createdAt updatedAt")
      .lean();

    if (owners.length === 0) {
      return res.status(200).json({ 
        message: "No hay usuarios con rol de owner en el sistema",
        owners: []
      });
    }

    res.status(200).json({
      message: "Owners encontrados correctamente",
      owners,
      total: owners.length
    });
  } catch (error) {
    console.error("❌ Error al obtener owners:", error);
    res.status(500).json({ error: error.message });
  }
};

// Asignar un usuario a un owner
const assignUserToOwner = async (req, res) => {
  try {
    const { ownerId } = req.params;
    const { userId } = req.body;

    const owner = await Role.findById(ownerId);
    if (!owner || owner.name !== "owner") {
      return res.status(404).json({ message: "Owner no encontrado" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar si el usuario ya está asignado
    if (owner.users.includes(userId)) {
      return res.status(400).json({ message: "El usuario ya está asignado a este owner" });
    }

    owner.users.push(userId);
    await owner.save();

    res.status(200).json({ message: "Usuario asignado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remover un usuario de un owner
const removeUserFromOwner = async (req, res) => {
  try {
    const { ownerId, userId } = req.params;

    const owner = await Role.findById(ownerId);
    if (!owner || owner.name !== "owner") {
      return res.status(404).json({ message: "Owner no encontrado" });
    }

    // Verificar si el usuario está asignado
    if (!owner.users.includes(userId)) {
      return res.status(400).json({ message: "El usuario no está asignado a este owner" });
    }

    owner.users = owner.users.filter(id => id.toString() !== userId);
    await owner.save();

    res.status(200).json({ message: "Usuario removido correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Obtener usuarios asignados al owner actual
const getOwnerUsers = async (req, res) => {
  try {
    // El ID del owner viene del token de autenticación
    const ownerId = req.user.id;

    // Buscamos todos los usuarios que tengan este owner asignado
    const users = await User.find({ 
      owner: ownerId
    })
    .select('username email role createdAt updatedAt')
    .populate('role', 'name')
    .lean();

    res.status(200).json({
      users,
      total: users.length
    });
  } catch (error) {
    console.error("❌ Error al obtener usuarios del owner:", error);
    res.status(500).json({ 
      error: "Error al obtener usuarios del owner",
      details: error.message 
    });
  }
};

module.exports = {
  getAllRoles,
  getOwners,
  assignUserToOwner,
  removeUserFromOwner,
  getOwnerUsers,
  getOwnerUsersById
}; 