// middlewares/authMiddleware.js
const jwt = require("jsonwebtoken");

const extractToken = (authorizationHeader = "") => {
  if (!authorizationHeader) return null;
  if (authorizationHeader.startsWith("Bearer ")) {
    return authorizationHeader.slice(7);
  }
  return authorizationHeader;
};

const authenticateToken = (req, res, next) => {
  const token = extractToken(req.header("Authorization"));
  if (!token) return res.status(401).json({ error: "Access Denied" });

  try {
    const verified = jwt.verify(token, process.env.JWT_SECRET);
    req.user = verified;
    next();
  } catch (err) {
    res.status(400).json({ error: "Invalid Token" });
  }
};

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user?.role) {
    return res.status(403).json({ error: "Forbidden" });
  }
  if (!roles.includes(req.user.role)) {
    return res.status(403).json({ error: "Insufficient permissions" });
  }
  return next();
};

module.exports = authenticateToken;
module.exports.authenticateToken = authenticateToken;
module.exports.requireRole = requireRole;
