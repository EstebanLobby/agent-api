const Session = require("../../../models/Session");

async function handleReady(io, userId, client, session) {
  io.emit("whatsapp_connected", { userId });

  try {
    const numero = client.info.wid.user;
    await Session.findOneAndUpdate(
      { userId },
      {
        numero,
        sessionId: session.sessionId,
        status: "connected",
        updatedAt: new Date(),
      }
    );
  } catch (err) {
    console.error("❌ Error al guardar sesión:", err.message);
  }
}

module.exports = { handleReady };
