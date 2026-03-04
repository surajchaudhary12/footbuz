// utils/cache.js

const NodeCache = require("node-cache");

// Initialize cache with a default TTL of 5 minutes (300 seconds)
const cache = new NodeCache({ stdTTL: 300, checkperiod: 320 });

// Optional: Listen for expired keys (useful for logging or debugging)
cache.on("expired", (key, value) => {
  console.log(`Cache expired for key: ${key}`);
});

module.exports = cache;
