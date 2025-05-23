const express = require("express");
const router = express.Router();
const {
  obtenerSesionesActivas,
  enviarMensajeComoUsuario,
  obtenerEstadoConexion
} = require("../controllers/adminWhatsappController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");

// Middleware para verificar que el usuario es admin u owner
const adminOrOwnerMiddleware = roleMiddleware(["admin", "owner"]);

/**
 * @swagger
 * tags:
 *   name: Admin - Owner WhatsApp
 *   description: Gestión avanzada de WhatsApp para administradores y propietarios
 */

/**
 * @swagger
 * /api/admin/whatsapp/sessions:
 *   get:
 *     summary: Obtiene todas las sesiones activas de WhatsApp
 *     tags: [Admin - Owner WhatsApp]
 *     x-roles: ['admin', 'owner']
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de sesiones activas
 *       403:
 *         description: No autorizado
 */
router.get("/sessions", authMiddleware, adminOrOwnerMiddleware, obtenerSesionesActivas);

/**
 * @swagger
 * /api/admin/whatsapp/send-as-user:
 *   post:
 *     summary: Envía un mensaje usando la conexión de otro usuario
 *     tags: [Admin - Owner WhatsApp]
 *     x-roles: ['admin', 'owner']
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *               - numero
 *               - mensaje
 *             properties:
 *               userId:
 *                 type: string
 *               numero:
 *                 type: string
 *               mensaje:
 *                 type: string
 */
router.post("/send-as-user", authMiddleware, adminOrOwnerMiddleware, enviarMensajeComoUsuario);

/**
 * @swagger
 * /api/admin/whatsapp/status/{userId}:
 *   get:
 *     summary: Obtiene el estado de conexión de un usuario específico
 *     tags: [Admin - Owner WhatsApp]
 *     x-roles: ['admin', 'owner']
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 */
router.get("/status/:userId", authMiddleware, adminOrOwnerMiddleware, obtenerEstadoConexion);

module.exports = router; 