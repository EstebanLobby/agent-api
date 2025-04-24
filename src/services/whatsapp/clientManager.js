const clients = global.clients || {};

function addClient(userId, client) {
  clients[userId] = client;
}

function getClient(userId) {
  return clients[userId];
}

function removeClient(userId) {
  delete clients[userId];
}

module.exports = { clients, addClient, getClient, removeClient };
