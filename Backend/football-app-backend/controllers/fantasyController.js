const axios = require("axios");
const cache = require("../utils/cache");
const FantasyCache = require("../models/FantasyCache");
const FantasySquad = require("../models/FantasySquad");

const FPL_BASE = "https://fantasy.premierleague.com/api";
const LIVE_TTL_SECONDS = 300;
const FIXTURES_TTL_SECONDS = 900;
const GW_TTL_SECONDS = 120;

const client = axios.create({
  baseURL: FPL_BASE,
  timeout: 15000,
});

const enrichBootstrapPayload = (payload) => {
  if (!payload?.elements || !Array.isArray(payload.elements)) return payload;

  const elements = payload.elements.map((player) => ({
    ...player,
    imageUrl: `https://resources.premierleague.com/premierleague/photos/players/110x140/p${player.code}.png`,
  }));

  return { ...payload, elements };
};

const fetchWithCacheFallback = async (cacheKey, path, ttl, transform = (v) => v) => {
  const memoryKey = `fantasy:${cacheKey}`;
  const memoryData = cache.get(memoryKey);
  if (memoryData) {
    return { payload: memoryData, source: "memory-cache" };
  }

  try {
    const response = await client.get(path);
    const payload = transform(response.data);

    cache.set(memoryKey, payload, ttl);
    await FantasyCache.findOneAndUpdate(
      { cacheKey },
      { payload, fetchedAt: new Date() },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return { payload, source: "fpl-live" };
  } catch (error) {
    const fallback = await FantasyCache.findOne({ cacheKey }).lean();
    if (fallback?.payload) {
      cache.set(memoryKey, fallback.payload, ttl);
      return { payload: fallback.payload, source: "db-cache" };
    }
    throw error;
  }
};

const getBootstrap = async (req, res) => {
  try {
    const { payload, source } = await fetchWithCacheFallback(
      "bootstrap",
      "/bootstrap-static/",
      LIVE_TTL_SECONDS,
      enrichBootstrapPayload
    );
    res.set("x-fantasy-source", source);
    res.status(200).json(payload);
  } catch (error) {
    console.error("Fantasy bootstrap fetch failed:", error.message);
    res.status(500).json({ message: "Failed to load fantasy bootstrap data" });
  }
};

const getFixtures = async (req, res) => {
  try {
    const { payload, source } = await fetchWithCacheFallback(
      "fixtures",
      "/fixtures/",
      FIXTURES_TTL_SECONDS
    );
    res.set("x-fantasy-source", source);
    res.status(200).json(payload);
  } catch (error) {
    console.error("Fantasy fixtures fetch failed:", error.message);
    res.status(500).json({ message: "Failed to load fantasy fixtures" });
  }
};

const getGwLive = async (req, res) => {
  try {
    const gw = parseInt(req.params.id, 10);
    if (!gw || gw < 1 || gw > 38) {
      return res.status(400).json({ message: "Gameweek id must be between 1 and 38" });
    }

    const { payload, source } = await fetchWithCacheFallback(
      `gw_live_${gw}`,
      `/event/${gw}/live/`,
      GW_TTL_SECONDS
    );
    res.set("x-fantasy-source", source);
    res.status(200).json(payload);
  } catch (error) {
    console.error("Fantasy GW live fetch failed:", error.message);
    res.status(500).json({ message: "Failed to load fantasy gameweek data" });
  }
};

const getSummary = async (req, res) => {
  try {
    const { payload: bootstrap, source } = await fetchWithCacheFallback(
      "bootstrap",
      "/bootstrap-static/",
      LIVE_TTL_SECONDS,
      enrichBootstrapPayload
    );

    const players = Array.isArray(bootstrap.elements) ? bootstrap.elements : [];
    const teams = Array.isArray(bootstrap.teams) ? bootstrap.teams : [];
    const events = Array.isArray(bootstrap.events) ? bootstrap.events : [];
    const currentGw = events.find((e) => e.is_current) || events[events.length - 1] || null;

    const topByForm = [...players]
      .sort((a, b) => Number(b.form || 0) - Number(a.form || 0))
      .slice(0, 120)
      .map((p) => ({
        id: p.id,
        webName: p.web_name,
        teamName: teams.find((t) => t.id === p.team)?.name || "Unknown",
        nowCost: p.now_cost,
        form: p.form,
        pointsPerGame: p.points_per_game,
        elementType: p.element_type,
        totalPoints: p.total_points,
        imageUrl: p.imageUrl,
      }));

    res.set("x-fantasy-source", source);
    res.status(200).json({
      currentGameweek: currentGw
        ? { id: currentGw.id, name: currentGw.name, deadline: currentGw.deadline_time }
        : null,
      totalPlayers: players.length,
      topByForm,
      generatedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error("Fantasy summary fetch failed:", error.message);
    res.status(500).json({ message: "Failed to load fantasy summary" });
  }
};

const getMySquad = async (req, res) => {
  try {
    const squad = await FantasySquad.findOne({ userId: req.user.userId }).lean();
    if (!squad) {
      return res.status(200).json({ playerIds: [], captainId: null });
    }
    return res.status(200).json({
      playerIds: squad.playerIds || [],
      captainId: squad.captainId || null,
      updatedAt: squad.updatedAt,
    });
  } catch (error) {
    console.error("Get my squad failed:", error.message);
    return res.status(500).json({ message: "Failed to load your fantasy squad" });
  }
};

const saveMySquad = async (req, res) => {
  try {
    const { playerIds, captainId } = req.body;

    if (!Array.isArray(playerIds)) {
      return res.status(400).json({ message: "playerIds must be an array" });
    }
    if (playerIds.length < 1 || playerIds.length > 15) {
      return res.status(400).json({ message: "Select between 1 and 15 players" });
    }

    const uniquePlayerIds = [...new Set(playerIds.map((id) => Number(id)).filter(Number.isFinite))];
    if (!uniquePlayerIds.length) {
      return res.status(400).json({ message: "No valid player IDs provided" });
    }

    const normalizedCaptainId =
      captainId !== null && captainId !== undefined ? Number(captainId) : null;

    if (normalizedCaptainId && !uniquePlayerIds.includes(normalizedCaptainId)) {
      return res.status(400).json({ message: "Captain must be one of selected players" });
    }

    const updated = await FantasySquad.findOneAndUpdate(
      { userId: req.user.userId },
      {
        userId: req.user.userId,
        playerIds: uniquePlayerIds,
        captainId: normalizedCaptainId,
        updatedAtSource: "manual",
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    ).lean();

    return res.status(200).json({
      message: "Fantasy squad saved",
      playerIds: updated.playerIds,
      captainId: updated.captainId,
      updatedAt: updated.updatedAt,
    });
  } catch (error) {
    console.error("Save squad failed:", error.message);
    return res.status(500).json({ message: "Failed to save fantasy squad" });
  }
};

module.exports = {
  getBootstrap,
  getFixtures,
  getGwLive,
  getSummary,
  getMySquad,
  saveMySquad,
};
