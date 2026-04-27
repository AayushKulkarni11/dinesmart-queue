const express = require("express");
const { joinQueue, listQueue } = require("../controllers/queueController");

const router = express.Router();

router.get("/queue", listQueue);
router.post("/queue/join", joinQueue);

module.exports = router;

