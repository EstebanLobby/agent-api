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

    // Buscamos el rol de owner
    const ownerRole = await Role.findOne({ name: 'owner' });
    if (!ownerRole) {
      return res.status(404).json({ 
        message: "Rol de owner no encontrado",
        users: []
      });
    }

    // Buscamos todos los usuarios que estén en el array users del rol owner
    const users = await User.find({ 
      _id: { $in: ownerRole.users }
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

    // Primero buscamos el usuario que es owner
    const ownerUser = await User.findById(ownerId);
    if (!ownerUser) {
      return res.status(404).json({ message: "Usuario owner no encontrado" });
    }

    // Luego buscamos el rol owner
    const ownerRole = await Role.findOne({ name: "owner" });
    if (!ownerRole) {
      return res.status(404).json({ message: "Rol owner no encontrado" });
    }

    // Verificamos que el usuario tenga el rol de owner
    if (!ownerUser.role.equals(ownerRole._id)) {
      return res.status(403).json({ message: "El usuario no tiene rol de owner" });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "Usuario no encontrado" });
    }

    // Verificar si el usuario ya está asignado
    if (ownerRole.users.includes(userId)) {
      return res.status(400).json({ message: "El usuario ya está asignado a este owner" });
    }

    ownerRole.users.push(userId);
    await ownerRole.save();

    res.status(200).json({ message: "Usuario asignado correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Remover un usuario de un owner
const removeUserFromOwner = async (req, res) => {
  try {
    const { ownerId } = req.params;
    const { userId } = req.body;
    if(!userId) {
      return res.status(400).json({ message: "El usuario se ingreso incorrectamente" });
    }
    // Primero buscamos el usuario que es owner y poblamos su rol
    const ownerUser = await User.findById(ownerId).populate('role');
    if (!ownerUser) {
      return res.status(404).json({ message: "Usuario owner no encontrado" });
    }

    // Luego buscamos el rol owner
    const ownerRole = await Role.findOne({ name: "owner" });
    if (!ownerRole) {
      return res.status(404).json({ message: "Rol owner no encontrado" });
    }

    // Verificamos que el usuario tenga el rol de owner
    if (ownerUser.role.name !== 'owner') {
      return res.status(403).json({ message: "El usuario no tiene rol de owner" });
    }

    // Verificar si el usuario está asignado
    if (!ownerRole.users.includes(userId)) {
      return res.status(400).json({ message: "El usuario no está asignado a este owner" });
    }

    ownerRole.users = ownerRole.users.filter(id => id.toString() !== userId);
    await ownerRole.save();

    res.status(200).json({ message: "Usuario removido correctamente" });
  } catch (error) {
    console.error("❌ Error al remover usuario del owner:", error);
    res.status(500).json({ error: error.message });
  }
};

// Obtener usuarios asignados al owner actual
const getOwnerUsers = async (req, res) => {
  try {
    // El ID del owner viene del token de autenticación
    const ownerId = req.user.id;

    // Primero verificamos que el usuario existe y es un owner
    const owner = await User.findById(ownerId)
      .populate('role')
      .lean();

    if (!owner) {
      return res.status(404).json({ 
        message: "Usuario no encontrado",
        users: [],
        total: 0
      });
    }

    if (owner.role.name !== 'owner') {
      return res.status(403).json({ 
        message: "El usuario no tiene rol de owner",
        users: [],
        total: 0
      });
    }

    // Buscamos el rol de owner
    const ownerRole = await Role.findOne({ name: 'owner' });
    if (!ownerRole) {
      return res.status(404).json({ 
        message: "Rol de owner no encontrado",
        users: [],
        total: 0
      });
    }

    // Buscamos todos los usuarios que estén en el array users del rol owner
    const users = await User.find({ 
      _id: { $in: ownerRole.users }
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

module.exports = {
  getAllRoles,
  getOwners,
  assignUserToOwner,
  removeUserFromOwner,
  getOwnerUsers,
  getOwnerUsersById
}; 