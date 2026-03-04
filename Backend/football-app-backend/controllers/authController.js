const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);
const JWT_SECRET = process.env.JWT_SECRET;

const signToken = (user) => {
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET is not configured");
  }

  return jwt.sign(
    { userId: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
};

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role,
  provider: user.provider,
  avatar: user.avatar,
});

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "name, email, and password are required" });
    }

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hash,
      provider: "local",
    });

    const token = signToken(user);
    return res.status(201).json({ token, user: sanitizeUser(user) });
  } catch (error) {
    console.error("Register error:", error.message);
    const message =
      error.message === "JWT_SECRET is not configured"
        ? "Server auth is not configured. Missing JWT_SECRET."
        : "Failed to register user";
    return res.status(500).json({ message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user || !user.password) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const ok = await bcrypt.compare(password, user.password);
    if (!ok) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const token = signToken(user);
    return res.status(200).json({ token, user: sanitizeUser(user) });
  } catch (error) {
    console.error("Login error:", error.message);
    const message =
      error.message === "JWT_SECRET is not configured"
        ? "Server auth is not configured. Missing JWT_SECRET."
        : "Failed to login";
    return res.status(500).json({ message });
  }
};

const googleLogin = async (req, res) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: "idToken is required" });
    }
    if (!process.env.GOOGLE_CLIENT_ID) {
      return res
        .status(500)
        .json({ message: "GOOGLE_CLIENT_ID not configured on server" });
    }

    const ticket = await googleClient.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const email = payload?.email?.toLowerCase();
    if (!email) {
      return res.status(400).json({ message: "Google account email unavailable" });
    }

    let user = await User.findOne({ email });
    if (!user) {
      user = await User.create({
        name: payload.name || "Google User",
        email,
        provider: "google",
        providerId: payload.sub,
        avatar: payload.picture || null,
      });
    } else if (user.provider !== "google") {
      user.provider = "google";
      user.providerId = payload.sub;
      user.avatar = payload.picture || user.avatar;
      await user.save();
    }

    const token = signToken(user);
    return res.status(200).json({ token, user: sanitizeUser(user) });
  } catch (error) {
    console.error("Google login error:", error.message);
    if (error.message === "JWT_SECRET is not configured") {
      return res
        .status(500)
        .json({ message: "Server auth is not configured. Missing JWT_SECRET." });
    }
    return res.status(401).json({ message: "Invalid Google token" });
  }
};

const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.status(200).json(user);
  } catch (error) {
    console.error("Get me error:", error.message);
    return res.status(500).json({ message: "Unable to fetch profile" });
  }
};

module.exports = {
  register,
  login,
  googleLogin,
  getMe,
};
