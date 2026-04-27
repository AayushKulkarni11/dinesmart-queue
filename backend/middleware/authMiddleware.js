const jwt = require("jsonwebtoken");
const User = require("../models/User");

async function protect(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || typeof authHeader !== "string" || !authHeader.startsWith("Bearer ")) {
      res.status(401);
      return next(new Error("Not authorized"));
    }

    const token = authHeader.slice("Bearer ".length).trim();
    if (!token) {
      res.status(401);
      return next(new Error("Not authorized"));
    }

    const secret = process.env.JWT_SECRET;
    if (!secret) {
      res.status(500);
      return next(new Error("Missing required env var: JWT_SECRET"));
    }

    const decoded = jwt.verify(token, secret);
    const userId = decoded?.id;
    if (!userId) {
      res.status(401);
      return next(new Error("Not authorized"));
    }

    const user = await User.findById(userId).select("name email contactNumber role");
    if (!user) {
      res.status(401);
      return next(new Error("Not authorized"));
    }

    req.user = user;
    return next();
  } catch (err) {
    res.status(401);
    return next(new Error("Not authorized"));
  }
}

function adminOnly(req, res, next) {
  if (req.user?.role !== "admin") {
    res.status(403);
    return next(new Error("Admin access required"));
  }
  return next();
}

module.exports = { protect, adminOnly };

