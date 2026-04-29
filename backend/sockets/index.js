const { Server } = require("socket.io");

let ioInstance;

function initSockets(httpServer, { corsOrigin = "*" } = {}) {
  const io = new Server(httpServer, {
    cors: {
      origin: true,
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    socket.on("ping", () => {
      socket.emit("pong");
    });
  });

  ioInstance = io;
  return io;
}

function getIO() {
  if (!ioInstance) {
    throw new Error("Socket.io not initialized!");
  }
  return ioInstance;
}

module.exports = { initSockets, getIO };

