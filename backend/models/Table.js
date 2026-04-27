const mongoose = require("mongoose");

const tableSchema = new mongoose.Schema(
  {
    tableNumber: { type: Number, required: true, unique: true, min: 1, max: 30 },
    capacity: { type: Number, required: true, min: 1, max: 20 },
    status: { type: String, enum: ["available", "occupied", "reserved"], default: "available" },
    reservation: {
      name: { type: String, trim: true },
      contactNumber: { type: String, trim: true },
      reservationTime: { type: String, trim: true },
      partySize: { type: Number, min: 1, max: 20 },
      notes: { type: String, trim: true, maxlength: 500 },
      payment: {
        amount: { type: Number, min: 0 },
        currency: { type: String, trim: true, default: "INR" },
        status: { type: String, enum: ["pending", "paid", "failed"], default: "pending" },
        paymentMethod: { type: String, trim: true },
        transactionId: { type: String, trim: true },
        paidAt: { type: Date },
        cardLast4: { type: String, trim: true },
      },
    },
  },
  { timestamps: true },
);

const Table = mongoose.model("Table", tableSchema);

module.exports = Table;
