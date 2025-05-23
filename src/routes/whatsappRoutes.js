const express = require("express");
const {
  iniciarSesion,
  obtenerQR,
  enviarMensajeWhatsApp,
  verificarEstado,
  obtenerSesiones,
} = require("../controllers/whatsappController");
const authMiddleware = require("../middlewares/authMiddleware");
const roleMiddleware = require("../middlewares/roleMiddleware");
const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: WhatsApp
 *   description: API para interactuar con WhatsApp
 */

/**
 * @swagger
 * /api/whatsapp/start:
 *   post:
 *     summary: Inicia una sesión de WhatsApp
 *     tags: [WhatsApp]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - numero
 *             properties:
 *               numero:
 *                 type: string
 *                 description: Número de WhatsApp con código de país
 *                 example: "+5491123456789"
 *     responses:
 *       200:
 *         description: Sesión iniciada correctamente
 *       400:
 *         description: Número de WhatsApp requerido
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error al iniciar sesión
 */
router.post("/start", authMiddleware, iniciarSesion);

/**
 * @swagger
 * /api/whatsapp/qr:
 *   get:
 *     summary: Obtiene el código QR para conectar WhatsApp
 *     tags: [WhatsApp]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Código QR en formato base64
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 qr:
 *                   type: string
 *                   description: Código QR en formato base64
 *       400:
 *         description: QR aún no disponible
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error generando QR
 */
router.get("/qr", authMiddleware, obtenerQR);

/**
 * @swagger
 * /api/whatsapp/send:
 *   post:
 *     summary: Envía un mensaje de WhatsApp
 *     tags: [WhatsApp]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - destino
 *               - mensaje
 *             properties:
 *               destino:
 *                 type: string
 *                 description: Número de destino con código de país
 *                 example: "+5491123456789"
 *               mensaje:
 *                 type: string
 *                 description: Mensaje a enviar
 *     responses:
 *       200:
 *         description: Mensaje enviado correctamente
 *       400:
 *         description: Datos inválidos
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error al enviar mensaje
 */
router.post("/send", authMiddleware, enviarMensajeWhatsApp);

/**
 * @swagger
 * /api/whatsapp/status:
 *   get:
 *     summary: Verifica el estado de la conexión de WhatsApp
 *     tags: [WhatsApp]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Estado de la conexión
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   enum: [connected, disconnected, pending]
 *                 isActive:
 *                   type: boolean
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error al verificar estado
 */
router.get("/status", authMiddleware, verificarEstado);

/**
 * @swagger
 * /api/whatsapp/sessions:
 *   get:
 *     summary: Obtiene todas las sesiones de WhatsApp
 *     tags: [WhatsApp]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de sesiones
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   userId:
 *                     type: string
 *                   status:
 *                     type: string
 *                   numero:
 *                     type: string
 *                   updatedAt:
 *                     type: string
 *                     format: date-time
 *       401:
 *         description: No autorizado
 *       500:
 *         description: Error al obtener sesiones
 */
router.get("/sessions", authMiddleware, roleMiddleware(['admin']), obtenerSesiones);

module.exports = router;
