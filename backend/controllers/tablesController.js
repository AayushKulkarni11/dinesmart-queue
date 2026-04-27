const Table = require("../models/Table");

async function getTables(req, res, next) {
  try {
    const tables = await Table.find({}).sort({ tableNumber: 1 });
    return res.status(200).json({ success: true, message: "Tables fetched successfully", data: { tables } });
  } catch (err) {
    return next(err);
  }
}

async function updateTableStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status } = req.body || {};

    if (!status) {
      res.status(400);
      return next(new Error("Missing required fields"));
    }

    if (!["available", "occupied", "reserved"].includes(status)) {
      res.status(400);
      return next(new Error("Invalid status"));
    }

    const table = await Table.findByIdAndUpdate(id, { status }, { new: true, runValidators: true });
    if (!table) {
      res.status(404);
      return next(new Error("Table not found"));
    }

    const { getIO } = require("../sockets");
    try {
      const io = getIO();
      io.emit("queueUpdated");
    } catch (e) {
      // ignore
    }

    return res.status(200).json({ success: true, message: "Table updated successfully", data: { table } });
  } catch (err) {
    return next(err);
  }
}

module.exports = { getTables, updateTableStatus };

