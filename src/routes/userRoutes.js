const express = require("express");
const {
  getAllUsers,
  getUserProfile,
} = require("../controllers/userController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

const router = express.Router();

router.get(
  "/all",
  authMiddleware,
  roleMiddleware(["00000001a3bcc48331b0bf15"]),
  getAllUsers
);

router.get("/profile", authMiddleware, getUserProfile);

module.exports = router;
