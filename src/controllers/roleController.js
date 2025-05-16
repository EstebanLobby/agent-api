const Role = require("../models/Role");
const User = require("../models/User");

// Obtener todos los owners con sus usuarios asignados
const getOwners = async (req, res) => {
  try {
    const owners = await Role.find({ name: "owner" })
      .populate("users", "username email")
      .lean();

    res.status(200).json(owners);
  } catch (error) {
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

    // Remover el usuario del array de users
    owner.users = owner.users.filter(id => id.toString() !== userId);
    await owner.save();

    res.status(200).json({ message: "Usuario removido correctamente" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getOwners,
  assignUserToOwner,
  removeUserFromOwner,
}; 