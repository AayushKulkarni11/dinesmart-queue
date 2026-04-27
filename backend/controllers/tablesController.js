const Table = require("../models/Table");
const { RESERVATION_FEE } = require("./paymentsController");

function normalizeReservation(input) {
  if (!input || typeof input !== "object") return null;

  const name = typeof input.name === "string" ? input.name.trim() : "";
  const contactNumber = typeof input.contactNumber === "string" ? input.contactNumber.trim() : "";
  const reservationTime = typeof input.reservationTime === "string" ? input.reservationTime.trim() : "";
  const notes = typeof input.notes === "string" ? input.notes.trim() : "";
  const partySize = Number(input.partySize);
  const payment = input.payment && typeof input.payment === "object"
    ? {
        amount: Number(input.payment.amount),
        currency: typeof input.payment.currency === "string" ? input.payment.currency.trim() : "INR",
        status: typeof input.payment.status === "string" ? input.payment.status.trim() : "",
        paymentMethod: typeof input.payment.paymentMethod === "string" ? input.payment.paymentMethod.trim() : "",
        transactionId: typeof input.payment.transactionId === "string" ? input.payment.transactionId.trim() : "",
        paidAt: input.payment.paidAt ? new Date(input.payment.paidAt) : null,
        cardLast4: typeof input.payment.cardLast4 === "string" ? input.payment.cardLast4.trim() : "",
      }
    : null;

  return {
    name,
    contactNumber,
    reservationTime,
    partySize: Number.isFinite(partySize) ? partySize : NaN,
    notes,
    payment,
  };
}

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
    const reservation = normalizeReservation(req.body?.reservation);

    if (!status) {
      res.status(400);
      return next(new Error("Missing required fields"));
    }

    if (!["available", "occupied", "reserved"].includes(status)) {
      res.status(400);
      return next(new Error("Invalid status"));
    }

    const table = await Table.findById(id);
    if (!table) {
      res.status(404);
      return next(new Error("Table not found"));
    }

    if (status === "reserved") {
      if (!reservation?.name || !reservation?.contactNumber || !reservation?.reservationTime || !Number.isFinite(reservation?.partySize)) {
        res.status(400);
        return next(new Error("Reservation name, contact number, time, and party size are required"));
      }

      if (
        !reservation.payment ||
        reservation.payment.status !== "paid" ||
        reservation.payment.amount !== RESERVATION_FEE ||
        !reservation.payment.transactionId
      ) {
        res.status(400);
        return next(new Error(`Reservation payment of ${RESERVATION_FEE} is required`));
      }

      if (reservation.partySize < 1 || reservation.partySize > table.capacity) {
        res.status(400);
        return next(new Error(`Party size must be between 1 and ${table.capacity}`));
      }

      table.reservation = reservation;
    } else if (status === "available") {
      table.reservation = undefined;
    } else if (reservation?.name || reservation?.contactNumber || reservation?.reservationTime || reservation?.notes || Number.isFinite(reservation?.partySize)) {
      table.reservation = reservation;
    }

    table.status = status;
    await table.save();

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
