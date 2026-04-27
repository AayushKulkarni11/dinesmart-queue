const http = require("http");
const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");

require("dotenv").config();

const { connectDB } = require("./config/db");
const { getConfig } = require("./config");
const { notFound } = require("./middleware/notFound");
const { errorHandler } = require("./middleware/errorHandler");
const testRoutes = require("./routes/testRoutes");
const { initSockets } = require("./sockets");

async function start() {
  const config = getConfig();

  await connectDB();

  const app = express();

  app.use(
    cors({
      origin: config.corsOrigin,
      credentials: true,
    }),
  );
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use("/api", testRoutes);

  app.use(notFound);
  app.use(errorHandler);

  const server = http.createServer(app);
  initSockets(server, { corsOrigin: config.corsOrigin });

  server.listen(config.port, () => {
    // eslint-disable-next-line no-console
    console.log(`Backend listening on port ${config.port}`);
  });
}

start().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Fatal startup error:", err);
  process.exit(1);
});

