const cron = require("node-cron");
const axios = require("axios");

// Function to fetch live scores
const fetchLiveScores = async () => {
  try {
    const response = await axios.get(
      "https://api.football-data.org/v4/matches",
      {
        headers: { "X-Auth-Token": process.env.API_FOOTBALL_KEY },
      }
    );
    console.log("Live scores fetched:", response.data);
  } catch (error) {
    console.error("Error fetching live scores:", error);
  }
};

// Function to start the cron job (run every 1 minutes)
const start = () => {
  cron.schedule("*/5 * * * *", async () => {
    console.log("Fetching live scores...");
    await fetchLiveScores();
  });
  console.log("Cron job started: Fetching live scores every 2 minutes");
};

module.exports = { start };
