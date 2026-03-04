// controllers/newsController.js

const { getCachedData } = require("../utils/cacheHelper");
const axiosInstance = require("../utils/axiosInstance");

// Centralized Error Handling for Controller
const handleControllerError = (error, res, functionName) => {
  if (error.response) {
    // API responded with a status code outside 2xx
    console.error(
      `Error in ${functionName}: ${error.response.status} - ${JSON.stringify(
        error.response.data
      )}`
    );
    res.status(error.response.status).json({
      message: error.response.data.message || `Error in ${functionName}`,
      details: error.response.data,
    });
  } else if (error.request) {
    // No response received from API
    console.error(`No response received in ${functionName}:`, error.request);
    res.status(503).json({
      message: `No response from Football API during ${functionName}`,
    });
  } else {
    // Other errors
    console.error(`Error in ${functionName}:`, error.message);
    res
      .status(500)
      .json({ message: `Internal server error in ${functionName}` });
  }
};

// Function to fetch top 10 players for a specific club
const getTopPlayersByClub = async (req, res) => {
  const { club } = req.params; // e.g., 'barcelona', 'realmadrid'
  const cacheKey = `top_players_${club.toLowerCase()}`;
  const fetchFn = async () => {
    try {
      const response = await axiosInstance.get(
        `/players/${encodeURIComponent(club.toLowerCase())}`
      );
      // Assuming the API returns an array of player objects
      const topPlayers = response.data.slice(0, 10); // Get top 10 players
      return topPlayers;
    } catch (error) {
      throw error;
    }
  };

  try {
    const topPlayers = await getCachedData(cacheKey, fetchFn);
    res.status(200).json({
      club: club.charAt(0).toUpperCase() + club.slice(1),
      topPlayers,
    });
  } catch (error) {
    handleControllerError(error, res, `getTopPlayersByClub ${club}`);
  }
};

// Existing functions (getAllPlayers, getPlayersTransfers, etc.)

const getAllPlayers = async (req, res) => {
  const cacheKey = "all_players";
  const fetchFn = async () => {
    const response = await axiosInstance.get("/players");
    return response.data; // Assuming it's an array of players
  };

  try {
    const players = await getCachedData(cacheKey, fetchFn);
    res.status(200).json(players);
  } catch (error) {
    handleControllerError(error, res, "getAllPlayers");
  }
};

const getPlayersTransfers = async (req, res) => {
  const cacheKey = "players_transfers";
  const fetchFn = async () => {
    const response = await axiosInstance.get("/players/transfers");
    return response.data; // Assuming it's an array of transfers
  };

  try {
    const transfers = await getCachedData(cacheKey, fetchFn);
    res.status(200).json(transfers);
  } catch (error) {
    handleControllerError(error, res, "getPlayersTransfers");
  }
};

const getPlayersNews = async (req, res) => {
  const cacheKey = "players_news";
  const fetchFn = async () => {
    const response = await axiosInstance.get("/players/news");
    return response.data; // Assuming it's an array of news articles
  };

  try {
    const news = await getCachedData(cacheKey, fetchFn);
    res.status(200).json(news);
  } catch (error) {
    handleControllerError(error, res, "getPlayersNews");
  }
};

const getBettingLaLiga = async (req, res) => {
  const cacheKey = "betting_laliga";
  const fetchFn = async () => {
    const response = await axiosInstance.get("/betting/laliga");
    return response.data; // Assuming it's betting information
  };

  try {
    const laLigaData = await getCachedData(cacheKey, fetchFn);
    res.status(200).json(laLigaData);
  } catch (error) {
    handleControllerError(error, res, "getBettingLaLiga");
  }
};

const getBettingPremierLeague = async (req, res) => {
  const cacheKey = "betting_premierleague";
  const fetchFn = async () => {
    const response = await axiosInstance.get("/betting/premuire-league"); // Fixed endpoint spelling
    return response.data; // Assuming it's betting information
  };

  try {
    const premierLeagueData = await getCachedData(cacheKey, fetchFn);
    res.status(200).json(premierLeagueData);
  } catch (error) {
    handleControllerError(error, res, "getBettingPremierLeague");
  }
};

// ... other functions as needed

module.exports = {
  getAllPlayers,
  getPlayersTransfers,
  getPlayersNews,
  getTopPlayersByClub,
  getBettingLaLiga,
  getBettingPremierLeague,
  // ... other exports
};
