const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
  numero: { 
    type: String, 
    required: false,
    index: {
      unique: true,
      sparse: true,
      partialFilterExpression: { numero: { $type: "string" } }
    }
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

module.exports = mongoose.model("Session", SessionSchema);
