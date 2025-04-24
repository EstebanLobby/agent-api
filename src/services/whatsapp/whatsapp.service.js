const { Client, LocalAuth } = require("whatsapp-web.js");
const Session = require("../../models/Session");
const { handleQR } = require("./handlers/qr.handler");
const { handleReady } = require("./handlers/ready.handler");
const { handleMessage } = require("./handlers/message.handler");
const { handleDisconnected } = require("./handlers/disconnected.handler");
const { clients, addClient, removeClient } = require("./clientManager");

let io;
const qrCodes = {};
const QR_REFRESH_TIME = 30 * 1000;

function iniciarWhatsAppService(socketIo) {
  io = socketIo;
}

async function iniciarCliente(userId) {
  if (clients[userId]) return clients[userId];

  let session = await Session.findOne({ userId });
  if (!session) {
    session = await Session.create({ userId, sessionId: Date.now().toString(), status: "created" });
  }

  const client = new Client({
    authStrategy: new LocalAuth({ clientId: session.sessionId }),
    puppeteer: {
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"],
    },
  });

  addClient(userId, client);

  client.on("qr", (qr) => handleQR(io, qr, userId, session, qrCodes, QR_REFRESH_TIME));
  client.on("ready", () => handleReady(io, userId, client, session));
  client.on("message", (msg) => handleMessage(msg, client));
  client.on("disconnected", (reason) => handleDisconnected(userId, session, removeClient));

  await client.initialize();
  return client;
}

function getQR(userId) {
  if (!qrCodes[userId]) return { error: "QR no disponible" };
  return { qr: qrCodes[userId].qr };
}

async function getEstado(userId) {
  const session = await Session.findOne({ userId });
  return session ? session.status : "not_found";
}

module.exports = { iniciarWhatsAppService, iniciarCliente, getQR, getEstado };
