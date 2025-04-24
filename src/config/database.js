const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("🔥 MongoDB Atlas conectado"))
  .catch((err) => console.error("❌ Error conectando a MongoDB:", err));

module.exports = mongoose;
