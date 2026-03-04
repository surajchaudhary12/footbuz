const User = require("../models/User");
const Player = require("../models/Player");

const getAdminOverview = async (req, res) => {
  try {
    const [users, admins, players] = await Promise.all([
      User.countDocuments({}),
      User.countDocuments({ role: "admin" }),
      Player.countDocuments({}),
    ]);

    return res.status(200).json({
      users,
      admins,
      indexedPlayers: players,
      requestedBy: req.user.email,
    });
  } catch (error) {
    console.error("Admin overview error:", error.message);
    return res.status(500).json({ message: "Unable to load admin overview" });
  }
};

module.exports = {
  getAdminOverview,
};
