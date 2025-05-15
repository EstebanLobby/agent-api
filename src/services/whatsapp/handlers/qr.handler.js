const qrcode = require("qrcode");
const qrcodeTerminal = require("qrcode-terminal");

async function handleQR(io, qr, userId, session, qrCodes, QR_REFRESH_TIME) {
  if (session.status === "connected") return;

  if (qrCodes[userId] && Date.now() - qrCodes[userId].timestamp < QR_REFRESH_TIME) return;

  qrCodes[userId] = { qr, timestamp: Date.now() };

  try {
    const qrBase64 = await qrcode.toDataURL(qr);
    io.emit("qr_update", qrBase64);
    qrcodeTerminal.generate(qr, { small: true });
    console.log("QR generado:", qr);
  } catch (err) {
    io.emit("qr_error", "Error al generar el QR.");
  }
}

module.exports = { handleQR };
