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
      ref: "Role", // Referencia al modelo de roles
      required: true,
    },
    photo: { type: String, default: "https://example.com/default-avatar.png" },
    telephone: { type: String, required: false },
    age: { type: Number, required: false, min: 18 },
    integrations: { type: IntegrationsSchema, default: {} },
    isActive: { type: Boolean, default: true }, // Estado del usuario
  },
  { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } } // Habilita las propiedades virtuales
);

// Relación virtual con las sesiones
UserSchema.virtual("sessions", {
  ref: "Session", // Modelo de referencia
  localField: "_id",
  foreignField: "userId",
});

module.exports = mongoose.model("User", UserSchema);