const Session = require("../../../models/Session");
const { iniciarCliente } = require("../whatsapp.service");

async function handleDisconnected(userId, session, removeClient) {
  console.log(`❌ Cliente desconectado para usuario ${userId}`);
  
  try {
    // Actualizar estado en la base de datos
    await Session.findOneAndUpdate(
      { userId },
      { 
        status: "disconnected",
        updatedAt: new Date()
      }
    );

    // Remover cliente de memoria
    removeClient(userId);

    // Intentar reconectar después de 5 segundos
    setTimeout(async () => {
      try {
        console.log(`🔄 Intentando reconectar cliente para usuario ${userId}...`);
        await iniciarCliente(userId, session.numero);
      } catch (error) {
        console.error(`❌ Error al reconectar cliente para usuario ${userId}:`, error);
      }
    }, 5000);

  } catch (error) {
    console.error(`❌ Error en handleDisconnected para usuario ${userId}:`, error);
  }
}

module.exports = { handleDisconnected };
