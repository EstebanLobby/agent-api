const express = require("express");
const {
  getAllRoles,
  getOwners,
  assignUserToOwner,
  removeUserFromOwner,
  getOwnerUsers,
  getOwnerUsersById
} = require("../controllers/roleController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

// Obtener todos los roles
router.get(
  "/",
  authMiddleware,
  roleMiddleware(["admin"]),
  getAllRoles
);

// Obtener todos los owners con sus usuarios
router.get(
  "/owner",
  authMiddleware,
  roleMiddleware(["admin"]),
  getOwners
);

// Obtener usuarios de un owner específico (solo ADMIN)
router.get(
  "/owner/:ownerId/users",
  authMiddleware,
  roleMiddleware(["admin"]),
  getOwnerUsersById
);

// Obtener usuarios asignados al owner actual
router.get(
  "/owner/users",
  authMiddleware,
  roleMiddleware(["owner"]),
  getOwnerUsers
);

// Asignar un usuario a un owner
router.post(
  "/owner/:ownerId/users",
  authMiddleware,
  roleMiddleware(["admin"]),
  assignUserToOwner
);

// Remover un usuario de un owner
router.delete(
  "/owner/:ownerId/users/:userId",
  authMiddleware,
  roleMiddleware(["admin"]),
  removeUserFromOwner
);

module.exports = router; 