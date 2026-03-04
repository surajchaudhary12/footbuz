// controllers/scoresController.js

const axios = require("axios");
const cache = require("../utils/cache"); // Import the cache

/**
 * Fetches live scores for various leagues.
 * Route: GET /scores
 */
async function scoresController(req, res) {
  try {
    // Check if live scores are cached
    const cachedScores = cache.get("liveScores");
    if (cachedScores) {
      console.log("Serving cached live scores");
      return res.status(200).json(cachedScores);
    }

    const apiUrl = "https://api.football-data.org/v4/matches";
    const response = await axios.get(apiUrl, {
      headers: {
        "X-Auth-Token": process.env.API_FOOTBALL_KEY,
      },
      params: {
        dateFrom: new Date().toISOString().split("T")[0],
        dateTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      },
    });

    const leagueIds = {
      2014: "La Liga",
      2021: "Premier League",
      2002: "Bundesliga",
      2019: "Serie A",
      2015: "Ligue 1",
      2001: "UEFA Champions League",
      2146: "UEFA Europa League",
    };

    const filteredMatches = response.data.matches.map((match) => {
      const leagueName = leagueIds[match.competition.id] || "Other";
      return {
        id: match.id,
        utcDate: match.utcDate,
        status: match.status,
        league: leagueName,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        score: match.score,
        odds: Math.random().toFixed(2), // Mock data
        avgP: (Math.random() * 100).toFixed(2), // Mock data
        avgG: (Math.random() * 5).toFixed(2), // Mock data
        cG: Math.floor(Math.random() * 10), // Mock data
        BTS: Math.random() > 0.5 ? "Yes" : "No", // Mock data
        FTS: Math.random() > 0.5 ? "Yes" : "No", // Mock data
        "c>2,5": Math.random() > 0.5 ? "Yes" : "No", // Mock data
      };
    });

    const groupedMatches = filteredMatches.reduce((acc, match) => {
      if (!acc[match.league]) {
        acc[match.league] = [];
      }
      acc[match.league].push(match);
      return acc;
    }, {});

    // Cache the live scores with a shorter TTL (e.g., 2 minutes)
    cache.set("liveScores", groupedMatches, 120);

    console.log("Cached live scores");

    res.status(200).json(groupedMatches);
  } catch (error) {
    console.error("Error fetching live scores:", error.message);
    res.status(500).json({
      message: "Unable to retrieve live scores. Please try again later.",
    });
  }
}

module.exports = scoresController;
