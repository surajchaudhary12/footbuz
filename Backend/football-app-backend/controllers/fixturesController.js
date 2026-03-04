const axios = require("axios");

const getFixtures = async (req, res) => {
  try {
    const apiUrl = "https://api.football-data.org/v4/matches";
    const response = await axios.get(apiUrl, {
      headers: {
        "X-Auth-Token": process.env.API_FOOTBALL_KEY,
      },
    });

    // Ensure we have data before trying to parse it
    if (!response.data) {
      throw new Error("No data received from the API");
    }

    let matches;
    try {
      // If response.data is a string, parse it. If it's already an object, use it as is.
      matches =
        typeof response.data === "string"
          ? JSON.parse(response.data)
          : response.data;
    } catch (parseError) {
      console.error("Error parsing JSON:", parseError);
      throw new Error("Invalid JSON received from the API");
    }

    // Check if the response contains the expected data structure
    if (!Array.isArray(matches.matches)) {
      throw new Error("Unexpected data format from football-data API");
    }

    const now = new Date();
    const twoWeeksFromNow = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000);

    // Filter and sort the fixtures
    const fixtures = matches.matches
      .filter((match) => {
        const matchDate = new Date(match.utcDate);
        return matchDate >= now && matchDate <= twoWeeksFromNow;
      })
      .map((match) => ({
        id: match.id,
        utcDate: match.utcDate,
        status: match.status,
        homeTeam: match.homeTeam,
        awayTeam: match.awayTeam,
        score: match.score,
      }))
      .sort((a, b) => new Date(a.utcDate) - new Date(b.utcDate));

    res.status(200).json(fixtures);
  } catch (error) {
    console.error("Error fetching fixtures:", error);
    res.status(500).json({
      message: "Unable to retrieve fixtures. Please try again later.",
      error: error.message,
    });
  }
};

module.exports = { getFixtures };
