// controllers/leagueController.js

const axios = require("axios");
const cache = require("../utils/cache"); // Import the cache

/**
 * Fetches detailed information about a specific league, its teams, standings, top scorers, and live matches.
 * Route: GET /leagues/:code
 * Example: GET /leagues/PL
 */
async function leagueController(req, res) {
  try {
    const leagueCode = req.params.code.toUpperCase(); // Ensure the league code is uppercase (e.g., 'PL')

    // Check if the data for this leagueCode is already in the cache
    const cachedData = cache.get(leagueCode);
    if (cachedData) {
      console.log(`Serving cached data for league: ${leagueCode}`);
      return res.status(200).json(cachedData);
    }

    // Define the API endpoints
    const leagueInfoUrl = `https://api.football-data.org/v4/competitions/${leagueCode}`;
    const leagueTeamsUrl = `https://api.football-data.org/v4/competitions/${leagueCode}/teams`;

    // Make parallel API requests for league info and teams using API_FOOTBALL_KEY1
    const [leagueResponse, teamsResponse] = await Promise.all([
      axios.get(leagueInfoUrl, {
        headers: { "X-Auth-Token": process.env.API_FOOTBALL_KEY1 },
      }),
      axios.get(leagueTeamsUrl, {
        headers: { "X-Auth-Token": process.env.API_FOOTBALL_KEY1 },
      }),
    ]);

    const leagueData = leagueResponse.data;
    const teamsData = teamsResponse.data.teams;
    const competitionId = leagueData.id; // Need competition ID for further API calls

    // Define endpoints for standings and top scorers using API_FOOTBALL_KEY2
    const standingsUrl = `https://api.football-data.org/v4/competitions/${competitionId}/standings`;
    const scorersUrl = `https://api.football-data.org/v4/competitions/${leagueCode}/scorers`;
    const matchesUrl = `https://api.football-data.org/v4/competitions/${competitionId}/matches`;

    // Calculate date range for matches (today to 7 days ahead)
    const today = new Date();
    const dateFrom = today.toISOString().split("T")[0];
    const dateTo = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
      .toISOString()
      .split("T")[0];

    // Make parallel API requests for standings, top scorers, and matches using API_FOOTBALL_KEY2
    const [standingsResponse, scorersResponse, matchesResponse] =
      await Promise.all([
        axios.get(standingsUrl, {
          headers: { "X-Auth-Token": process.env.API_FOOTBALL_KEY1 },
        }),
        axios.get(scorersUrl, {
          headers: { "X-Auth-Token": process.env.API_FOOTBALL_KEY1 },
          params: {
            limit: 10, // Fetch top 10 scorers
          },
        }),
        axios.get(matchesUrl, {
          headers: { "X-Auth-Token": process.env.API_FOOTBALL_KEY1 },
          params: {
            dateFrom,
            dateTo,
          },
        }),
      ]);

    const standingsData = standingsResponse.data;
    const scorersData = scorersResponse.data;
    const matchesData = matchesResponse.data.matches;

    // Process Standings
    let standings = [];
    if (standingsData.standings && standingsData.standings.length > 0) {
      // Assuming the first standing is the overall table
      standings = standingsData.standings[0].table.map((team) => ({
        position: team.position,
        team: {
          id: team.team.id,
          name: team.team.name,
          shortName: team.team.shortName,
          tla: team.team.tla,
          crest: team.team.crest,
        },
        playedGames: team.playedGames,
        won: team.won,
        draw: team.draw,
        lost: team.lost,
        points: team.points,
        goalsFor: team.goalsFor,
        goalsAgainst: team.goalsAgainst,
        goalDifference: team.goalDifference,
      }));
    }

    // Process Top Scorers
    const topScorers = scorersData.scorers.map((scorer) => ({
      player: {
        id: scorer.player.id,
        name: scorer.player.name,
        firstName: scorer.player.firstName,
        lastName: scorer.player.lastName,
        dateOfBirth: scorer.player.dateOfBirth,
        nationality: scorer.player.nationality,
        position: scorer.player.position,
        shirtNumber: scorer.player.shirtNumber,
        lastUpdated: scorer.player.lastUpdated,
      },
      team: {
        id: scorer.team.id,
        name: scorer.team.name,
        shortName: scorer.team.shortName,
        tla: scorer.team.tla,
        crest: scorer.team.crest,
        address: scorer.team.address,
        website: scorer.team.website,
        founded: scorer.team.founded,
        clubColors: scorer.team.clubColors,
        venue: scorer.team.venue,
        lastUpdated: scorer.team.lastUpdated,
      },
      goals: scorer.goals,
      assists: scorer.assists,
      penalties: scorer.penalties,
    }));

    // Process Matches
    const leagueMatchIds = new Set(teamsData.map((team) => team.id));

    const matches = matchesData
      .filter(
        (match) =>
          leagueMatchIds.has(match.homeTeam.id) ||
          leagueMatchIds.has(match.awayTeam.id)
      )
      .map((match) => ({
        id: match.id,
        utcDate: match.utcDate,
        status: match.status,
        matchday: match.matchday,
        stage: match.stage,
        group: match.group,
        lastUpdated: match.lastUpdated,
        homeTeam: {
          id: match.homeTeam.id,
          name: match.homeTeam.name,
          shortName: match.homeTeam.shortName,
          tla: match.homeTeam.tla,
          crest: match.homeTeam.crest,
        },
        awayTeam: {
          id: match.awayTeam.id,
          name: match.awayTeam.name,
          shortName: match.awayTeam.shortName,
          tla: match.awayTeam.tla,
          crest: match.awayTeam.crest,
        },
        score: match.score,
        odds: {
          homeWin: Math.random().toFixed(2), // Mock data
          draw: Math.random().toFixed(2),
          awayWin: Math.random().toFixed(2),
        },
      }));

    // Structure the response
    const responseData = {
      league: {
        id: leagueData.id,
        name: leagueData.name,
        code: leagueData.code,
        type: leagueData.type,
        emblem: leagueData.emblem,
        area: leagueData.area,
        currentSeason: leagueData.currentSeason,
      },
      teams: teamsData.map((team) => ({
        id: team.id,
        name: team.name,
        shortName: team.shortName,
        tla: team.tla,
        crest: team.crest,
        venue: team.venue,
        website: team.website,
        founded: team.founded,
        clubColors: team.clubColors,
      })),
      standings,
      topScorers,
      matches,
    };

    // Store the response data in the cache
    cache.set(leagueCode, responseData);

    console.log(`Cached data for league: ${leagueCode}`);

    // Send the response
    res.status(200).json(responseData);
  } catch (error) {
    console.error("Error fetching league data:", error.message);

    // Handle specific API errors
    if (error.response) {
      const { status, data } = error.response;
      return res.status(status).json({
        message: data.message || "Error fetching league data from API.",
      });
    }

    // Generic server error
    res.status(500).json({
      message: "Unable to retrieve league data. Please try again later.",
    });
  }
}

module.exports = leagueController;
