// controllers/standingsController.js
const axios = require("axios");

const API_HOST = "sport-highlights-api.p.rapidapi.com";
const API_KEY = "RAPIDAPI_KEY";

async function getLeagues() {
  const response = await axios.get(
    `https://${API_HOST}/football/leagues?limit=100`,
    {
      headers: {
        "x-rapidapi-host": API_HOST,
        "x-rapidapi-key": API_KEY,
      },
    }
  );
  return response.data; 
}

async function getStandings(leagueName, season) {
  const response = await axios.get(
    `https://${API_HOST}/football/standings?leagueName=${leagueName}&season=${season}`,
    {
      headers: {
        "x-rapidapi-host": API_HOST,
        "x-rapidapi-key": API_KEY,
      },
    }
  );
  return response.data; // Return standings data
}

exports.fetchStandings = async (req, res) => {
  try {
    const leagues = await getLeagues();
    const topLeagues = [
      "Premier League",
      "La Liga",
      "Serie A",
      "Bundesliga",
      "Ligue 1",
    ]; // Adjust as needed

    const standingsPromises = topLeagues.map(async (league) => {
      const standings = await getStandings(league, 2024); // Use the correct season
      return { league, standings };
    });

    const standingsData = await Promise.all(standingsPromises);
    res.status(200).json(standingsData);
  } catch (error) {
    console.error("Error fetching standings:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
