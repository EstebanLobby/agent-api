// services/user/editProfile.service.js
const User = require("../../models/User");

const editProfile = async (userId, updateData) => {
  const allowedFields = ["username", "email", "photo", "telephone", "age", "integrations"];

  // Filtramos los campos permitidos
  const filteredData = {};
  for (let field of allowedFields) {
    if (updateData[field] !== undefined) {
      filteredData[field] = updateData[field];
    }
  }

  const updatedUser = await User.findByIdAndUpdate(
    userId,
    { $set: filteredData },
    { new: true }
  ).select("-password"); // evitamos retornar la contraseña

  return updatedUser;
};

module.exports = editProfile;
