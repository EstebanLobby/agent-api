module.exports = (io) => {
  io.on("connection", (socket) => {
    console.log("🟢 Usuario conectado a WebSocket:", socket.id);

    socket.on("mensaje", (data) => {
      console.log("📩 Mensaje recibido:", data);
      io.emit("mensaje", data);
    });

    socket.on("disconnect", () => {
      console.log("🔴 Usuario desconectado:", socket.id);
    });
  });
};
