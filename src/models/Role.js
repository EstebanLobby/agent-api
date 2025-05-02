const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // El nombre del rol debe ser único
      enum: ["admin", "member"], // Roles predefinidos
    },
    permissions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Permission", // Referencia al modelo de permisos
      },
    ],
    users: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User", // Referencia al modelo de usuarios
      },
    ],
  },
  { timestamps: true } // Añade campos createdAt y updatedAt automáticamente
);

module.exports = mongoose.model("Role", RoleSchema);
