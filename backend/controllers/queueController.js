const QueueEntry = require("../models/QueueEntry");

function sanitizeName(name) {
  if (typeof name !== "string") return "";
  return name.trim();
}

function makeToken() {
  // Simple human-friendly token like A1234
  return `A${Math.floor(1000 + Math.random() * 9000)}`;
}

async function joinQueue(req, res, next) {
  try {
    const { name, partySize, preferredTime } = req.body || {};
    const cleanName = sanitizeName(name);
    const size = Number(partySize);

    if (!cleanName || !Number.isFinite(size)) {
      res.status(400);
      return next(new Error("Missing required fields"));
    }
    if (size < 1 || size > 20) {
      res.status(400);
      return next(new Error("partySize must be between 1 and 20"));
    }

    // Retry a few times on rare token collisions
    for (let attempt = 0; attempt < 5; attempt += 1) {
      const token = makeToken();
      try {
        const entry = await QueueEntry.create({
          token,
          name: cleanName,
          partySize: size,
          preferredTime,
          status: "Waiting",
          estimatedWaitMinutes: null,
        });
        const { getIO } = require("../sockets");
        try {
          const io = getIO();
          io.emit("queueUpdated");
        } catch (e) {
          // just ignore if socket not initialized yet for some reason
        }
        return res.status(201).json({ success: true, message: "Joined queue successfully", data: { entry } });
      } catch (err) {
        if (err?.code === 11000) continue;
        throw err;
      }
    }

    res.status(503);
    return next(new Error("Could not generate queue token, try again"));
  } catch (err) {
    return next(err);
  }
}

async function listQueue(req, res, next) {
  try {
    const entries = await QueueEntry.find({})
      .sort({ createdAt: 1 })
      .select("token name partySize preferredTime status estimatedWaitMinutes createdAt updatedAt");
    return res.status(200).json({ success: true, message: "Queue list fetched successfully", data: { entries } });
  } catch (err) {
    return next(err);
  }
}

module.exports = { joinQueue, listQueue };
