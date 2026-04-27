function getConfig() {
  return {
    port: Number(process.env.PORT) || 5000,
    mongoUri: process.env.MONGO_URI,
    corsOrigin: process.env.CORS_ORIGIN || "*",
  };
}

module.exports = { getConfig };

