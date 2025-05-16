const express = require("express");
const {
  getOwners,
  assignUserToOwner,
  removeUserFromOwner,
} = require("../controllers/roleController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

// Obtener todos los owners con sus usuarios
router.get(
  "/owner",
  authMiddleware,
  roleMiddleware(["admin"]),
  getOwners
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