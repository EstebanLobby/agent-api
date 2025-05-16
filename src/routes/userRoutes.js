const express = require("express");
const {
  getAllUsers,
  getUserProfile,
  editProfile,
  getProfile,
  updateUserRole,
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

module.exports = router;
