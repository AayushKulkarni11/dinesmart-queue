const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
  {
    tableNumber: { type: Number, required: true, unique: true, min: 1, max: 30 },
    capacity: { type: Number, required: true, min: 1, max: 20 },
    status: { type: String, enum: ["available", "occupied", "reserved"], default: "available" },
  },
  { timestamps: true },
);

const Table = mongoose.model("Table", tableSchema);

module.exports = Table;

