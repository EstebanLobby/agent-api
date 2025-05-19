const express = require("express");
const {
  getAllUsers,
  getUserProfile,
  editProfile,
  getProfile,
  updateUserRole,
  deleteUser,
  assignOwnerToUser
} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

router.get(
  "/all",
  authMiddleware,
  roleMiddleware(["admin"]),
  getAllUsers
);

router.get("/me", authMiddleware, getProfile);

router.put(
  "/profile",
  authMiddleware,
  roleMiddleware(["member"]),
  editProfile
);

router.get("/profile", authMiddleware, getUserProfile);

// Ruta para actualizar el rol de un usuario (solo ADMIN)
router.put(
  "/:userId/role",
  authMiddleware,
  roleMiddleware(["admin"]),
  updateUserRole
);

// Ruta para asignar owner a un usuario (solo ADMIN)
router.put("/:userId/owner", authMiddleware, roleMiddleware(["admin"]), assignOwnerToUser);

// Eliminar un usuario
router.delete(
  "/:userId",
  authMiddleware,
  roleMiddleware(["admin"]),
  deleteUser
);

module.exports = router;
