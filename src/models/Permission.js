const mongoose = require("mongoose");

const PermissionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true, // El nombre del permiso debe ser único
    },
    description: {
      type: String,
      default: "",
    },
  },
  { timestamps: true } // Añade campos createdAt y updatedAt automáticamente
);

module.exports = mongoose.model("Permission", PermissionSchema);
