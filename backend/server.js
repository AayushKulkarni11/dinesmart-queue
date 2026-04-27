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
const authRoutes = require("./routes/authRoutes");
const queueRoutes = require("./routes/queueRoutes");
const tablesRoutes = require("./routes/tablesRoutes");
const paymentsRoutes = require("./routes/paymentsRoutes");
const { initTables } = require("./utils/initTables");
const { initSockets } = require("./sockets");

async function start() {
  const config = getConfig();

  await connectDB();
  await initTables();

  const app = express();

  const allowedOrigins = String(config.corsOrigin || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  app.use(
    cors({
      origin(origin, callback) {
        // Allow non-browser clients (no Origin header), like curl/postman
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes("*")) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        return callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    }),
  );
  app.use(bodyParser.json());
  app.use(bodyParser.urlencoded({ extended: true }));

  app.use("/api", testRoutes);
  app.use("/api", authRoutes);
  app.use("/api", queueRoutes);
  app.use("/api", tablesRoutes);
  app.use("/api", paymentsRoutes);
  app.use("/api", require("./routes/adminRoutes"));

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
