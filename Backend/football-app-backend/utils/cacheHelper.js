// utils/cacheHelper.js

const cache = require("./cache");

/**
 * Retrieves data from the cache or fetches it using the provided fetch function.
 *
 * @param {string} key - The cache key.
 * @param {Function} fetchFn - The function to fetch data if not in cache.
 * @returns {Promise<any>} - The cached or fetched data.
 */
async function getCachedData(key, fetchFn) {
  const cachedData = cache.get(key);
  if (cachedData) {
    console.log(`Cache hit for key: ${key}`);
    return cachedData;
  }

  console.log(`Cache miss for key: ${key}. Fetching data...`);
  const data = await fetchFn();
  cache.set(key, data);
  console.log(`Data cached for key: ${key}`);
  return data;
}

module.exports = { getCachedData };
