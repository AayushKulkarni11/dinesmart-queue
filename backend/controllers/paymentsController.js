const Table = require("../models/Table");

const RESERVATION_FEE = 100;

function normalizeCardNumber(cardNumber) {
  return typeof cardNumber === "string" ? cardNumber.replace(/\D/g, "") : "";
}

async function createReservationPayment(req, res, next) {
  try {
    const { tableId, amount, cardholderName, cardNumber, expiry, cvv } = req.body || {};

    if (!tableId || !cardholderName || !cardNumber || !expiry || !cvv) {
      res.status(400);
      return next(new Error("Table, cardholder name, card number, expiry, and CVV are required"));
    }

    if (Number(amount) !== RESERVATION_FEE) {
      res.status(400);
      return next(new Error(`Reservation fee must be ${RESERVATION_FEE}`));
    }

    const table = await Table.findById(tableId);
    if (!table) {
      res.status(404);
      return next(new Error("Table not found"));
    }

    if (table.status !== "available") {
      res.status(400);
      return next(new Error("This table is no longer available"));
    }

    const digits = normalizeCardNumber(cardNumber);
    if (digits.length < 12 || digits.length > 19) {
      res.status(400);
      return next(new Error("Enter a valid card number"));
    }

    if (!/^\d{3,4}$/.test(String(cvv).trim())) {
      res.status(400);
      return next(new Error("Enter a valid CVV"));
    }

    if (!/^\d{2}\/\d{2}$/.test(String(expiry).trim())) {
      res.status(400);
      return next(new Error("Expiry must be in MM/YY format"));
    }

    const transactionId = `FAKEPAY-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`;
    const paidAt = new Date();

    return res.status(200).json({
      success: true,
      message: "Mock payment completed successfully",
      data: {
        payment: {
          amount: RESERVATION_FEE,
          currency: "INR",
          status: "paid",
          paymentMethod: "mock_card",
          transactionId,
          paidAt,
          cardLast4: digits.slice(-4),
        },
      },
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = { createReservationPayment, RESERVATION_FEE };
