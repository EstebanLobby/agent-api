const express = require("express");
const {
  getAllUsers,
  getUserProfile,
  editProfile,
  getProfile,
} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

router.get(
  "/all",
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

module.exports = router;
