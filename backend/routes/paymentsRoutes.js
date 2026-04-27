const express = require("express");
const { createReservationPayment } = require("../controllers/paymentsController");

const router = express.Router();

router.post("/payments/reservation", createReservationPayment);

module.exports = router;
