const axios = require("axios");
const cache = require("../utils/cache");
const Score = require("../models/scoreModel");

const leagueIds = {
  2014: "La Liga",
  2021: "Premier League",
  2002: "Bundesliga",
  2019: "Serie A",
  2015: "Ligue 1",
  2001: "UEFA Champions League",
  2146: "UEFA Europa League",
};

const mapFootballDataMatchSummary = (match) => ({
  id: match.id,
  utcDate: match.utcDate,
  status: match.status,
  minute: match.minute || null,
  league: leagueIds[match.competition?.id] || "Other",
  competition: {
    id: match.competition?.id,
    name: match.competition?.name || "Other",
    emblem: match.competition?.emblem || null,
  },
  homeTeam: match.homeTeam,
  awayTeam: match.awayTeam,
  score: match.score,
  source: "football-data",
});

const fetchScoresFromFootballData = async () => {
  const dateFrom = new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];
  const dateTo = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    .toISOString()
    .split("T")[0];

  const response = await axios.get("https://api.football-data.org/v4/matches", {
    headers: {
      "X-Auth-Token": process.env.API_FOOTBALL_KEY,
    },
    params: {
      dateFrom,
      dateTo,
    },
  });

  return (response.data?.matches || []).map(mapFootballDataMatchSummary);
};

const saveMatchesToDb = async (matches) => {
  const validMatches = matches.filter((match) => match?.id !== null && match?.id !== undefined);

  await Promise.all(
    validMatches.map((match) =>
      Score.findOneAndUpdate(
        { matchId: String(match.id) },
        {
          id: String(match.id),
          matchId: String(match.id),
          league: match.league || "Other",
          status: match.status || "NS",
          utcDate: new Date(match.utcDate),
          team1: match.homeTeam?.name || "Home Team",
          team2: match.awayTeam?.name || "Away Team",
          homeScore: match.score?.fullTime?.home ?? null,
          awayScore: match.score?.fullTime?.away ?? null,
          minute: match.minute ?? null,
          source: "football-data",
        },
        { upsert: true, new: false, setDefaultsOnInsert: true }
      )
    )
  );
};

const fetchScoresFromDb = async () => {
  const docs = await Score.find({})
    .sort({ updatedAt: -1 })
    .limit(300)
    .lean();

  if (!docs.length) return [];

  return docs.map((doc) => ({
    id: Number(doc.matchId) || doc.matchId,
    utcDate: doc.utcDate,
    status: doc.status || "TIMED",
    minute: doc.minute ?? null,
    league: doc.league || "Other",
    competition: {
      id: null,
      name: doc.league || "Other",
      emblem: null,
    },
    homeTeam: {
      id: null,
      name: doc.team1,
      shortName: doc.team1,
      tla: doc.team1?.slice(0, 3)?.toUpperCase() || "HOM",
      crest: null,
    },
    awayTeam: {
      id: null,
      name: doc.team2,
      shortName: doc.team2,
      tla: doc.team2?.slice(0, 3)?.toUpperCase() || "AWY",
      crest: null,
    },
    score: {
      winner: null,
      duration: "REGULAR",
      fullTime: {
        home: doc.homeScore ?? null,
        away: doc.awayScore ?? null,
      },
      halfTime: {
        home: null,
        away: null,
      },
    },
    source: "db-cache",
  }));
};

const groupMatchesByLeague = (matches) =>
  matches.reduce((acc, match) => {
    const league = match.league || "Other";
    if (!acc[league]) acc[league] = [];
    acc[league].push(match);
    return acc;
  }, {});

async function getScores(req, res) {
  try {
    const cachedScores = cache.get("liveScores");
    if (cachedScores && Object.keys(cachedScores).length > 0) {
      res.set("x-score-source", "cache");
      return res.status(200).json(cachedScores);
    }

    let matches = [];
    let source = "football-data";

    try {
      matches = await fetchScoresFromFootballData();
    } catch (error) {
      console.warn("football-data failed, loading from DB cache:", error.message);
      matches = await fetchScoresFromDb();
      source = "db-cache";
    }

    if (!matches.length) {
      matches = await fetchScoresFromDb();
      source = "db-cache";
    }

    if (matches.length && source !== "db-cache") {
      await saveMatchesToDb(matches);
    }

    const groupedMatches = groupMatchesByLeague(matches);
    cache.set("liveScores", groupedMatches, 120);
    console.log(`Live scores served from: ${source}, matches: ${matches.length}`);
    res.set("x-score-source", source);
    res.status(200).json(groupedMatches);
  } catch (error) {
    console.error("Error fetching live scores:", error.message);
    res.status(500).json({
      message: "Unable to retrieve live scores. Please try again later.",
    });
  }
}

async function getScoreByMatchId(req, res) {
  try {
    const { id } = req.params;
    const cacheKey = `matchDetails:${id}`;
    const cachedMatch = cache.get(cacheKey);
    if (cachedMatch) return res.status(200).json(cachedMatch);

    const response = await axios.get(`https://api.football-data.org/v4/matches/${id}`, {
      headers: {
        "X-Auth-Token": process.env.API_FOOTBALL_KEY,
      },
    });

    const match = response.data?.match || response.data;
    if (!match) {
      return res.status(404).json({ message: "Match not found" });
    }

    const detailResponse = {
      id: match.id,
      utcDate: match.utcDate,
      status: match.status,
      minute: match.minute || null,
      competition: match.competition || null,
      stage: match.stage || null,
      matchday: match.matchday || null,
      venue: match.venue || null,
      homeTeam: match.homeTeam,
      awayTeam: match.awayTeam,
      score: match.score,
      referees: match.referees || [],
      lineups: {
        home: match.homeTeam?.lineup || [],
        away: match.awayTeam?.lineup || [],
      },
      events: match.goals || match.bookings || [],
      source: "football-data",
    };

    cache.set(cacheKey, detailResponse, 60);
    res.status(200).json(detailResponse);
  } catch (error) {
    console.error("Error fetching match details:", error.message);
    if (error.response?.status === 404) {
      return res.status(404).json({ message: "Match not found" });
    }
    res.status(500).json({
      message: "Unable to retrieve match details. Please try again later.",
    });
  }
}

module.exports = {
  getScores,
  getScoreByMatchId,
};
