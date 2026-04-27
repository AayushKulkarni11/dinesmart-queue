const mongoose = require("mongoose");

const queueEntrySchema = new mongoose.Schema(
  {
    token: { type: String, required: true, unique: true, trim: true },
    name: { type: String, required: true, trim: true },
    partySize: { type: Number, required: true, min: 1, max: 20 },
    preferredTime: { type: String, trim: true },
    status: { type: String, enum: ["Waiting", "Called", "Seated"], default: "Waiting" },
    estimatedWaitMinutes: { type: Number, min: 0, max: 600 },
    tableId: { type: mongoose.Schema.Types.ObjectId, ref: "Table" },
  },
  { timestamps: true },
);

const QueueEntry = mongoose.model("QueueEntry", queueEntrySchema);

module.exports = QueueEntry;
