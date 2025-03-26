const mongoose = require("mongoose");

const SessionSchema = new mongoose.Schema({
  numero: { type: String, required: false },
  sessionId: { type: String, required: true },
  status: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Relación con el usuario
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Session", SessionSchema);
