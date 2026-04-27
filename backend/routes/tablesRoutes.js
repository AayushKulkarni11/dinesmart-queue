const express = require("express");
const { getTables, updateTableStatus } = require("../controllers/tablesController");

const router = express.Router();

router.get("/tables", getTables);
router.put("/tables/:id/status", updateTableStatus);

module.exports = router;

