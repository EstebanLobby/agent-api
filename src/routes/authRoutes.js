const express = require("express");
const {
  register,
  login,
  logout,
  refreshToken,
  me,
} = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Inicia sesión en la aplicación y devuelve un JWT y Refresh Token en cookie
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 example: test@example.com
 *               password:
 *                 type: string
 *                 example: 123456
 *     responses:
 *       200:
 *         description: Inicio de sesión exitoso, retorna JWT y usuario
 *       400:
 *         description: Credenciales incorrectas
 *       500:
 *         description: Error interno del servidor
 */
router.post("/login", login);

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Cierra sesión y elimina el Refresh Token (cookie)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Logout exitoso
 *       500:
 *         description: Error interno del servidor
 */
router.post("/logout", logout);

/**
 * @swagger
 * /api/auth/refresh-token:
 *   get:
 *     summary: Renueva el JWT usando el Refresh Token (cookie)
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Retorna nuevo JWT válido
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                   description: Nuevo token JWT
 *       401:
 *         description: Refresh token inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */
router.get("/refresh-token", refreshToken);

module.exports = router;
