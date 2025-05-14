const express = require("express");
const {
  register,
  login,
  logout,
  refreshToken,
  requestPasswordReset,
  resetPassword
} = require("../controllers/authController");
const authMiddleware = require("../middlewares/authMiddleware");

const router = express.Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Registra un nuevo usuario
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               firstName:
 *                 type: string
 *                 example: Juan
 *               lastName:
 *                 type: string
 *                 example: Pérez
 *               email:
 *                 type: string
 *                 example: juan@ejemplo.com
 *               password:
 *                 type: string
 *                 example: 123456
 *               terms:
 *                 type: boolean
 *                 example: true
 *     responses:
 *       201:
 *         description: Usuario registrado correctamente
 *       400:
 *         description: El usuario ya existe
 *       500:
 *         description: Error interno del servidor
 */
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
router.post("/refresh-token", refreshToken);

/**
 * @swagger
 * /api/auth/request-password-reset:
 *   post:
 *     summary: Solicita un restablecimiento de contraseña
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
 *                 example: usuario@ejemplo.com
 *     responses:
 *       200:
 *         description: Se ha enviado un correo con las instrucciones
 *       400:
 *         description: Error en la solicitud
 *       500:
 *         description: Error interno del servidor
 */
router.post("/request-password-reset", requestPasswordReset);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Restablece la contraseña con el token
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 example: abc123...
 *               newPassword:
 *                 type: string
 *                 example: nuevaContraseña123
 *     responses:
 *       200:
 *         description: Contraseña actualizada correctamente
 *       400:
 *         description: Token inválido o expirado
 *       500:
 *         description: Error interno del servidor
 */
router.post("/reset-password", resetPassword);

module.exports = router;
