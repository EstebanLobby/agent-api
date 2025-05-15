const mongoose = require("mongoose");

const RoleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      enum: ["admin", "member", "owner"],
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
  { timestamps: true } 
);

module.exports = mongoose.model("Role", RoleSchema);
