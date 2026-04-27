const QueueEntry = require("../models/QueueEntry");
const Table = require("../models/Table");
const { getIO } = require("../sockets");

async function getDashboard(req, res, next) {
  try {
    const queues = await QueueEntry.find().sort({ createdAt: 1 }).populate("tableId").lean();
    const tables = await Table.find().sort({ tableNumber: 1 }).lean();

    let waitingCount = 0;
    const formattedQueues = queues.map((q, index) => {
      if (q.status === "Waiting") {
        waitingCount++;
      }
      return {
        id: q._id,
        name: q.name,
        numberOfPeople: q.partySize,
        status: q.status,
        position: index + 1,
        tableAssigned: q.tableId ? q.tableId.tableNumber : null,
      };
    });

    const tablesAvailable = tables.filter((t) => t.status === "available").length;
    const tablesOccupied = tables.filter((t) => t.status === "occupied").length;

    const summary = {
      totalPeopleWaiting: waitingCount,
      totalTablesAvailable: tablesAvailable,
      totalTablesOccupied: tablesOccupied,
    };

    return res.status(200).json({
      success: true,
      message: "Dashboard data fetched successfully",
      data: {
        queue: formattedQueues,
        tables,
        summary,
      },
    });
  } catch (err) {
    return next(err);
  }
}

async function callCustomer(req, res, next) {
  try {
    const { id } = req.params;
    const queueEntry = await QueueEntry.findById(id).populate("tableId");

    if (!queueEntry) {
      return res.status(404).json({ success: false, message: "Queue entry not found", data: null });
    }

    queueEntry.status = "Called";
    await queueEntry.save();

    const io = getIO();
    io.emit("customerCalled", {
      name: queueEntry.name,
      tableNumber: queueEntry.tableId ? queueEntry.tableId.tableNumber : null,
      message: "Your table is ready",
    });

    io.emit("queueUpdated");

    return res.status(200).json({
      success: true,
      message: "Customer called successfully",
      data: queueEntry,
    });
  } catch (err) {
    return next(err);
  }
}

async function seatCustomer(req, res, next) {
  try {
    const { id } = req.params;
    const queueEntry = await QueueEntry.findById(id);

    if (!queueEntry) {
      return res.status(404).json({ success: false, message: "Queue entry not found", data: null });
    }

    queueEntry.status = "Seated";
    await queueEntry.save();

    const io = getIO();
    io.emit("queueUpdated");

    return res.status(200).json({
      success: true,
      message: "Customer seated successfully",
      data: queueEntry,
    });
  } catch (err) {
    return next(err);
  }
}

async function removeQueueEntry(req, res, next) {
  try {
    const { id } = req.params;
    const entry = await QueueEntry.findByIdAndDelete(id);

    if (!entry) {
      return res.status(404).json({ success: false, message: "Queue entry not found", data: null });
    }

    const io = getIO();
    io.emit("queueUpdated");

    return res.status(200).json({
      success: true,
      message: "Queue entry removed successfully",
      data: null,
    });
  } catch (err) {
    return next(err);
  }
}

async function updateTableStatus(req, res, next) {
  try {
    const { id } = req.params;
    const { status, queueId } = req.body;

    if (!["available", "occupied", "reserved"].includes(status)) {
      return res.status(400).json({ success: false, message: "Invalid table status", data: null });
    }

    const table = await Table.findById(id);
    if (!table) {
      return res.status(404).json({ success: false, message: "Table not found", data: null });
    }

    table.status = status;
    await table.save();

    let queueEntry = null;
    if (queueId) {
      queueEntry = await QueueEntry.findById(queueId);
      if (queueEntry) {
        queueEntry.tableId = table._id;
        if (status === "occupied") {
          queueEntry.status = "Seated";
        }
        await queueEntry.save();
      }
    }

    const io = getIO();
    io.emit("queueUpdated"); // For both table and queue changes

    return res.status(200).json({
      success: true,
      message: "Table status updated successfully",
      data: {
        table,
        queueEntry,
      },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getDashboard,
  callCustomer,
  seatCustomer,
  removeQueueEntry,
  updateTableStatus,
};
