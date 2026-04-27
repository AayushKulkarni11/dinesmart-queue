const express = require("express");
const { register, registerAdmin, login, adminLogin } = require("../controllers/authController");

const router = express.Router();

router.post("/auth/register", register);
router.post("/auth/register-admin", registerAdmin);
router.post("/auth/login", login);
router.post("/auth/admin-login", adminLogin);

module.exports = router;
