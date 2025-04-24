const Session = require("../../../models/Session");

async function handleDisconnected(userId, session, removeClient) {
  await Session.findOneAndUpdate(
    { sessionId: session.sessionId },
    { status: "disconnected", lastUpdated: new Date() }
  );

  removeClient(userId);
  console.log(`❌ Cliente desconectado y removido de memoria: ${userId}`);
}

module.exports = { handleDisconnected };
