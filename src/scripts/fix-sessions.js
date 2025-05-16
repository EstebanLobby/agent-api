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
    //test
    // Eliminar el índice único en el campo numero
    await sessionsCollection.dropIndex('numero_1');
    console.log('✅ Índice eliminado correctamente');

    // Crear un nuevo índice sparse
    await sessionsCollection.createIndex(
      { numero: 1 },
      { 
        unique: true,
        sparse: true,
        partialFilterExpression: { numero: { $type: "string" } }
      }
    );
    console.log('✅ Nuevo índice creado correctamente');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('👋 Conexión cerrada');
  }
}

fixSessionsCollection(); 