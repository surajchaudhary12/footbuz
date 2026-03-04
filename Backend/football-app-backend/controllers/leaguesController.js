// controllers/leaguesController.js

const axios = require("axios");
const cache = require("../utils/cache"); // Import the cache

/**
 * Fetches a list of all available leagues (competitions).
 * Route: GET /leagues
 */
async function leaguesController(req, res) {
  try {
    // Check if leagues data is cached
    const cachedLeagues = cache.get("leaguesList");
    if (cachedLeagues) {
      console.log("Serving cached leagues data");
      return res.status(200).json({
        count: cachedLeagues.length,
        leagues: cachedLeagues,
      });
    }

    const apiUrl = "https://api.football-data.org/v4/competitions";

    const response = await axios.get(apiUrl, {
      headers: { "X-Auth-Token": process.env.API_FOOTBALL_KEY1 },
      params: {
        plan: "TIER_ONE", // Optional: Filter competitions by plan if needed
      },
    });

    const competitions = response.data.competitions;

    // Map and structure the competitions data
    const leagues = competitions.map((competition) => ({
      id: competition.id,
      name: competition.name,
      code: competition.code,
      type: competition.type,
      emblem: competition.emblem,
      area: competition.area,
    }));

    // Cache the leagues list with a longer TTL (e.g., 1 hour)
    cache.set("leaguesList", leagues, 3600);

    console.log("Cached leagues data");

    res.status(200).json({
      count: leagues.length,
      leagues,
    });
  } catch (error) {
    console.error("Error fetching leagues data:", error.message);

    // Handle specific API errors
    if (error.response) {
      const { status, data } = error.response;
      return res.status(status).json({
        message: data.message || "Error fetching leagues data from API.",
      });
    }

    // Generic server error
    res.status(500).json({
      message: "Unable to retrieve leagues data. Please try again later.",
    });
  }
}

module.exports = leaguesController;
