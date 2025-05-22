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

// �� Obtener código QR
/**
 * @swagger
 * /api/whatsapp/qr:
 *   get:
 *     summary: Obtiene el código QR para conectar WhatsApp
 *     tags: [WhatsApp]
 *     responses:
 *       200:
 *         description: Código QR en formato base64
 *       400:
 *         description: QR aún no disponible
 *       500:
 *         description: Error generando QR
 */
router.get("/qr", authMiddleware, obtenerQR); // 🔐 Protegida

// 🔹 Enviar mensaje de WhatsApp
/**
 * @swagger
 * /api/whatsapp/send:
 *   post:
 *     summary: Envía un mensaje de WhatsApp
 *     tags: [WhatsApp]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               numero:
 *                 type: string
 *                 example: "+5491123456789"
 *               mensaje:
 *                 type: string
 *                 example: "Hola, este es un mensaje de prueba"
 *     responses:
 *       200:
 *         description: Mensaje enviado exitosamente
 *       400:
 *         description: Número y mensaje son requeridos
 *       500:
 *         description: Error enviando mensaje
 */
router.post("/send", authMiddleware, enviarMensajeWhatsApp);

// 🔹 Verificar estado de conexión
/**
 * @swagger
 * /api/whatsapp/status:
 *   get:
 *     summary: Verifica el estado de conexión de WhatsApp
 *     tags: [WhatsApp]
 *     responses:
 *       200:
 *         description: Estado actual de la conexión
 *       500:
 *         description: No se pudo obtener el estado
 */

router.get("/status", authMiddleware, verificarEstado);

/**
 * @swagger
 * /api/whatsapp/start:
 *   post:
 *     summary: Iniciar una sesión de WhatsApp
 *     description: Inicia una nueva sesión de WhatsApp para un número específico.
 *     tags:
 *       - WhatsApp
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *     responses:
 *       200:
 *         description: Sesión iniciada exitosamente
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                   example: "Sesión iniciada para 5491123456789"
 *       400:
 *         description: Número no proporcionado
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 error:
 *                   type: string
 *                   example: "Número es requerido"
 */
router.post("/start", authMiddleware, iniciarSesion);

router.get("/sesiones", authMiddleware, roleMiddleware(['admin', 'owner', 'member']), obtenerSesiones);

module.exports = router;
