const { Server } = require("socket.io");

function initSockets(httpServer, { corsOrigin = "*" } = {}) {
  const io = new Server(httpServer, {
    cors: {
      origin: corsOrigin,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("ping", () => {
      socket.emit("pong");
    });
  });

  return io;
}

module.exports = { initSockets };

