// services/apiService.js
const axios = require("axios");
const { footballApiUrl, apiKey } = require("../apiConfig");

// Fetch live scores
const fetchLiveScores = async () => {
  try {
    const response = await axios.get(`${footballApiUrl}/matches`, {
      headers: { "X-Auth-Token": apiKey },
    });
    return response.data;
  } catch (error) {
    console.error("Error fetching live scores:", error);
    throw new Error("Could not fetch live scores");
  }
};

module.exports = { fetchLiveScores };
