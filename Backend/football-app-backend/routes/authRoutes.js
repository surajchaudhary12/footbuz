const express = require("express");
const { register, login, googleLogin, getMe } = require("../controllers/authController");
const { authenticateToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/google", googleLogin);
router.get("/me", authenticateToken, getMe);

module.exports = router;
