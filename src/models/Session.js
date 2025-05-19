const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
  numero: { 
    type: String, 
    required: false
  },
  sessionId: { type: String, required: true },
  status: { 
    type: String, 
    required: true,
    enum: ['created', 'pending', 'connected', 'disconnected']
  },
  userId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User",
    required: true 
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

// Índice compuesto para userId y status
SessionSchema.index({ userId: 1, status: 1 });

// Índice compuesto para userId y numero
SessionSchema.index({ userId: 1, numero: 1 });

module.exports = mongoose.model("Session", SessionSchema);
