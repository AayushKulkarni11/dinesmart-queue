const jwt = require("jsonwebtoken");
const User = require("../models/User");

function signToken(userId) {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("Missing required env var: JWT_SECRET");
  }

  const expiresIn = process.env.JWT_EXPIRES_IN || "7d";
  return jwt.sign({ id: userId }, secret, { expiresIn });
}

function isValidEmail(email) {
  if (typeof email !== "string") return false;
  const normalized = email.trim().toLowerCase();
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalized);
}

function publicUser(userDoc) {
  return {
    _id: userDoc._id,
    name: userDoc.name,
    email: userDoc.email,
    contactNumber: userDoc.contactNumber,
    role: userDoc.role,
  };
}

async function register(req, res, next) {
  return createUser(req, res, next, { role: "user" });
}

async function registerAdmin(req, res, next) {
  const setupKey = process.env.ADMIN_SETUP_KEY;
  if (!setupKey) {
    res.status(500);
    return next(new Error("Missing required env var: ADMIN_SETUP_KEY"));
  }

  if (req.body?.setupKey !== setupKey) {
    res.status(403);
    return next(new Error("Invalid admin setup key"));
  }

  return createUser(req, res, next, { role: "admin" });
}

async function createUser(req, res, next, { role }) {
  try {
    const { name, email, contactNumber, password } = req.body || {};

    if (!name || !email || !contactNumber || !password) {
      res.status(400);
      return next(new Error("Missing required fields"));
    }
    if (!isValidEmail(email)) {
      res.status(400);
      return next(new Error("Invalid email"));
    }
    if (typeof password !== "string" || password.length < 8) {
      res.status(400);
      return next(new Error("Password must be at least 8 characters"));
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existing = await User.findOne({ email: normalizedEmail }).lean();
    if (existing) {
      res.status(409);
      return next(new Error("Email already in use"));
    }

    const user = await User.create({
      name,
      email: normalizedEmail,
      contactNumber,
      password,
      role,
    });

    const token = signToken(user._id.toString());

    return res.status(201).json({
      success: true,
      message: role === "admin" ? "Admin created successfully" : "Registered successfully",
      data: { token, user: publicUser(user) },
    });
  } catch (err) {
    if (err?.code === 11000) {
      res.status(409);
      return next(new Error("Email already in use"));
    }
    return next(err);
  }
}

async function login(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      res.status(400);
      return next(new Error("Missing required fields"));
    }
    if (!isValidEmail(email)) {
      res.status(400);
      return next(new Error("Invalid email"));
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    if (!user) {
      res.status(401);
      return next(new Error("Invalid email or password"));
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      res.status(401);
      return next(new Error("Invalid email or password"));
    }

    const token = signToken(user._id.toString());
    return res.status(200).json({ success: true, message: "Logged in successfully", data: { token, user: publicUser(user) } });
  } catch (err) {
    return next(err);
  }
}

async function adminLogin(req, res, next) {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Missing required fields", data: null });
    }
    if (!isValidEmail(email)) {
      return res.status(400).json({ success: false, message: "Invalid email", data: null });
    }

    const normalizedEmail = email.trim().toLowerCase();
    const user = await User.findOne({ email: normalizedEmail }).select("+password");
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid email or password", data: null });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ success: false, message: "Admin access required", data: null });
    }

    const ok = await user.comparePassword(password);
    if (!ok) {
      return res.status(401).json({ success: false, message: "Invalid email or password", data: null });
    }

    const token = signToken(user._id.toString());
    return res.status(200).json({ success: true, message: "Admin logged in", data: { token, user: publicUser(user) } });
  } catch (err) {
    return next(err);
  }
}

module.exports = { register, registerAdmin, login, adminLogin };
