// controllers/playerSearchController.js

// controllers/playerSearchController.js

const axios = require("axios");
const Player = require("../models/Player");
const Match = require("../models/Match");

// Base URL for the V1 API provided by TheSportsDB
const baseURL = "https://www.thesportsdb.com/api/v1/json/3";

// Helper function to make API requests
const makeApiRequest = async (endpoint, params = {}) => {
  try {
    const response = await axios.get(`${baseURL}/${endpoint}`, { params });
    console.log(`API Response for ${endpoint} with params ${JSON.stringify(params)}:`, response.data);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error(
        `API Error: ${error.response.status} - ${JSON.stringify(
          error.response.data
        )}`
      );
      throw new Error(
        `API Error: ${error.response.data.error || "Unknown error"}`
      );
    } else if (error.request) {
      console.error("No response received from API");
      throw new Error("No response received from API");
    } else {
      console.error("Error setting up the request:", error.message);
      throw new Error("Error setting up the request");
    }
  }
};

/**
 * Search for players by name directly using the new V1 API.
 * Returns up to 5 matching players.
 */
exports.searchPlayers = async (req, res) => {
  const query = req.query.q;

  if (!query) {
    return res.status(400).json({ error: "Search query 'q' is required" });
  }

  try {
    // Search in the local database first
    const localPlayers = await Player.find({
      name: { $regex: query, $options: "i" },
    }).limit(5);

    if (localPlayers.length > 0) {
      return res.json({ count: localPlayers.length, players: localPlayers });
    }

    // If not found locally, fetch from API
    const playersResponse = await makeApiRequest("searchplayers.php", {
      p: query,
    });

    // Validate response structure
    if (
      !playersResponse ||
      !playersResponse.player ||
      !Array.isArray(playersResponse.player)
    ) {
      return res
        .status(404)
        .json({ error: "No players found matching the query" });
    }

    // Limit to 5 players
    const limitedPlayers = playersResponse.player.slice(0, 3);

    // Enrich player data with necessary fields
    const enrichedPlayers = limitedPlayers.map((player) => ({
      player_id: player.idPlayer,
      name: player.strPlayer,
      position: player.strPosition || "N/A",
      nationality: player.strNationality || "N/A",
      team: player.strTeam || "N/A",
      league: player.strLeague || "N/A",
      photo_url: player.strThumb || null,
      description: player.strDescriptionEN || "No description available.",
      birthday: player.dateBorn || "N/A",
      height: player.strHeight || "N/A",
      weight: player.strWeight || "N/A",
      jerseyNumber: player.strNumber || "N/A",
      social: {
        twitter: player.strTwitter || null,
        facebook: player.strFacebook || null,
        instagram: player.strInstagram || null,
      },
    }));

    // Save fetched players to the local database
    await Player.insertMany(
      enrichedPlayers,
      { ordered: false } // Continue on duplicate errors
    ).catch((err) => {
      if (err.code === 11000) {
        console.warn("Duplicate player entries detected.");
      } else {
        console.error("Error inserting players into DB:", err.message);
      }
    });

    res.json({ count: enrichedPlayers.length, players: enrichedPlayers });
  } catch (error) {
    console.error("Error in searchPlayers:", error.message);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Get detailed information about a specific player by ID using the new V1 API.
 */
exports.getPlayerDetails = async (req, res) => {
  const playerId = req.params.id;

  if (!playerId) {
    return res.status(400).json({ error: "Player ID is required" });
  }

  try {
    // Check local DB first
    const localPlayer = await Player.findOne({ player_id: playerId });

    if (localPlayer) {
      console.log(`Player ID "${playerId}" found in local DB.`);
      return res.json({ status: "success", response: localPlayer });
    }

    console.log(
      `Player ID "${playerId}" not found in local DB. Fetching from API.`
    );

    // If not found locally, fetch from API
    const playerDetailsResponse = await makeApiRequest("lookupplayer.php", {
      id: playerId,
    });

    // Validate response structure
    if (
      !playerDetailsResponse ||
      playerDetailsResponse.players === null ||
      !Array.isArray(playerDetailsResponse.players) ||
      playerDetailsResponse.players.length === 0
    ) {
      console.warn(`API returned no data for Player ID "${playerId}".`);
      return res.status(404).json({ error: "Player not found" });
    }

    const player = playerDetailsResponse.players[0];

    // Structure the player details
    const detailedPlayer = {
      player_id: player.idPlayer,
      name: player.strPlayer,
      position: player.strPosition || "N/A",
      nationality: player.strNationality || "N/A",
      team: player.strTeam || "N/A",
      league: player.strLeague || "N/A",
      photo_url: player.strThumb || null,
      description: player.strDescriptionEN || "No description available.",
      birthday: player.dateBorn || "N/A",
      height: player.strHeight || "N/A",
      weight: player.strWeight || "N/A",
      jerseyNumber: player.strNumber || "N/A",
      social: {
        twitter: player.strTwitter || null,
        facebook: player.strFacebook || null,
        instagram: player.strInstagram || null,
      },
    };

    console.log(`Fetched player details for Player ID "${playerId}" from API.`);

    // Save to local DB
    try {
      await Player.create(detailedPlayer);
      console.log(`Player ID "${playerId}" saved to local DB.`);
    } catch (err) {
      if (err.code === 11000) {
        console.warn(`Player ID "${playerId}" already exists in the database.`);
      } else {
        console.error("Error inserting player into DB:", err.message);
      }
    }

    res.json({ status: "success", response: detailedPlayer });
  } catch (error) {
    console.error("Error in getPlayerDetails:", error.message);
    if (
      error.message.includes("404") ||
      error.message.toLowerCase().includes("not found")
    ) {
      res.status(404).json({ error: "Player not found" });
    } else {
      res.status(500).json({ error: error.message });
    }
  }
};

/**
 * Get recent matches/events for a specific player using the new V1 API.
 * This example assumes that you have stored matches in your local DB.
 */
exports.getPlayerMatches = async (req, res) => {
  const playerId = req.params.id;
  const limit = parseInt(req.query.limit) || 5;

  if (!playerId) {
    return res.status(400).json({ error: "Player ID is required" });
  }

  try {
    // Check if the player exists in the database
    const player = await Player.findOne({ player_id: playerId });
    if (!player) {
      console.log(
        `Player ID "${playerId}" not found in local DB. Fetching player details to proceed.`
      );
      // Attempt to fetch player details from API
      const playerDetailsResponse = await makeApiRequest("lookupplayer.php", {
        id: playerId,
      });

      // Validate response structure
      if (
        !playerDetailsResponse ||
        playerDetailsResponse.players === null ||
        !Array.isArray(playerDetailsResponse.players) ||
        playerDetailsResponse.players.length === 0
      ) {
        console.warn(`API returned no data for Player ID "${playerId}".`);
        return res.status(404).json({ error: "Player not found" });
      }

      const playerData = playerDetailsResponse.players[0];

      // Structure the player details
      const detailedPlayer = {
        player_id: playerData.idPlayer,
        name: playerData.strPlayer,
        position: playerData.strPosition || "N/A",
        nationality: playerData.strNationality || "N/A",
        team: playerData.strTeam || "N/A",
        league: playerData.strLeague || "N/A",
        photo_url: playerData.strThumb || null,
        description: playerData.strDescriptionEN || "No description available.",
        birthday: playerData.dateBorn || "N/A",
        height: playerData.strHeight || "N/A",
        weight: playerData.strWeight || "N/A",
        jerseyNumber: playerData.strNumber || "N/A",
        social: {
          twitter: playerData.strTwitter || null,
          facebook: playerData.strFacebook || null,
          instagram: playerData.strInstagram || null,
        },
      };

      // Save to local DB
      try {
        await Player.create(detailedPlayer);
        console.log(`Player ID "${playerId}" saved to local DB.`);
      } catch (err) {
        if (err.code === 11000) {
          console.warn(
            `Player ID "${playerId}" already exists in the database.`
          );
        } else {
          console.error("Error inserting player into DB:", err.message);
        }
      }
    } else {
      console.log(`Player ID "${playerId}" found in local DB.`);
    }

    // Now that the player exists in the database, fetch matches
    // Check local DB for matches
    const localMatches = await Match.find({ player_id: playerId })
      .sort({ date: -1 })
      .limit(limit);

    if (localMatches.length >= limit) {
      console.log(
        `Found ${localMatches.length} matches in local DB for Player ID "${playerId}".`
      );
      return res.json({
        count: localMatches.length,
        matches: localMatches,
      });
    }

    console.log(
      `Found only ${localMatches.length} matches in local DB for Player ID "${playerId}". Fetching additional matches from API.`
    );

    // Fetch player details to get the team ID
    const playerDetailsResponse = await makeApiRequest("lookupplayer.php", {
      id: playerId,
    });

    if (
      !playerDetailsResponse ||
      playerDetailsResponse.players === null ||
      !Array.isArray(playerDetailsResponse.players) ||
      playerDetailsResponse.players.length === 0
    ) {
      throw new Error("Player not found");
    }

    const playerData = playerDetailsResponse.players[0];
    const teamId = playerData.idTeam;

    if (!teamId) {
      throw new Error("Team ID not available for this player");
    }

    // Fetch recent events for the team
    const eventsResponse = await makeApiRequest("eventslast.php", {
      id: teamId,
    });

    if (
      !eventsResponse ||
      !eventsResponse.results ||
      !Array.isArray(eventsResponse.results)
    ) {
      throw new Error("No events found for the player's team");
    }

    // Structure the match details
    const matches = eventsResponse.results
      .slice(0, limit - localMatches.length)
      .map((event) => ({
        event_id: event.idEvent,
        league: event.strLeague,
        season: event.strSeason,
        date: event.dateEvent,
        time: event.strTime,
        homeTeam: event.strHomeTeam,
        awayTeam: event.strAwayTeam,
        homeScore: event.intHomeScore,
        awayScore: event.intAwayScore,
        status: event.strStatus,
        player_id: playerId,
        fetchedAt: new Date(),
      }));

    console.log(
      `Fetched ${matches.length} new matches from API for Player ID "${playerId}".`
    );

    // Save new matches to local DB
    await Match.insertMany(
      matches,
      { ordered: false } // Continue on duplicate errors
    ).catch((err) => {
      if (err.code === 11000) {
        console.warn("Duplicate match entries detected.");
      } else {
        console.error("Error inserting matches into DB:", err.message);
      }
    });

    // Combine local and newly fetched matches
    const combinedMatches = [...localMatches, ...matches].slice(0, limit);

    console.log(
      `Returning ${combinedMatches.length} matches for Player ID "${playerId}".`
    );

    res.json({ count: combinedMatches.length, matches: combinedMatches });
  } catch (error) {
    console.error("Error in getPlayerMatches:", error.message);
    res.status(500).json({ error: error.message });
  }
};
