const mongoose = require("mongoose");

const IntegrationsSchema = new mongoose.Schema(
  {
    whatsapp: { type: Boolean, default: false },
    facebook: { type: Boolean, default: false },
    instagram: { type: Boolean, default: false },
    telegram: { type: Boolean, default: false },
  },
  { _id: false }
);

const UserSchema = new mongoose.Schema(
  {
    username: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true,
    },
    photo: { type: String, default: "https://example.com/default-avatar.png" },
    telephone: { type: String, required: false },
    age: { type: Number, required: false, min: 18 },
    integrations: { type: IntegrationsSchema, default: {} },
    isActive: { type: Boolean, default: true }, // Usuario habilitado
    isSuspended: { type: Boolean, default: false }, // Usuario bloqueado
    suspendedReason: { type: String, default: null },
    suspendedUntil: { type: Date, default: null },
    deletedAt: { type: Date, default: null }, // Soft delete
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Relación virtual con las sesiones
UserSchema.virtual("sessions", {
  ref: "Session",
  localField: "_id",
  foreignField: "userId",
});

module.exports = mongoose.model("User", UserSchema);
