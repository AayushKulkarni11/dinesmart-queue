const express = require("express");
const {
  getDashboard,
  callCustomer,
  seatCustomer,
  updateWaitEstimate,
  removeQueueEntry,
  updateTableStatus,
} = require("../controllers/adminController");
const { verifyAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.use(verifyAdmin);

router.get("/admin/dashboard", getDashboard);
router.put("/admin/queue/:id/call", callCustomer);
router.put("/admin/queue/:id/seat", seatCustomer);
router.put("/admin/queue/:id/wait-estimate", updateWaitEstimate);
router.delete("/admin/queue/:id", removeQueueEntry);
router.put("/admin/tables/bulk", require("../controllers/adminController").bulkUpdateTables);
router.put("/admin/tables/:id/status", updateTableStatus);

module.exports = router;
