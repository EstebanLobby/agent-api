require('dotenv').config();
const mongoose = require('../config/database');

async function fixSessionsCollection() {
  try {
    // Conectar a MongoDB
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ Conectado a MongoDB');

    // Obtener la colección de sesiones
    const db = mongoose.connection.db;
    const sessionsCollection = db.collection('sessions');

    // Eliminar el índice único en el campo numero
    await sessionsCollection.dropIndex('numero_1');
    console.log('✅ Índice único eliminado correctamente');

    // Crear el nuevo índice compuesto
    await sessionsCollection.createIndex(
      { userId: 1, numero: 1 },
      { background: true }
    );
    console.log('✅ Nuevo índice compuesto creado correctamente');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Conexión cerrada');
  }
}

fixSessionsCollection(); 