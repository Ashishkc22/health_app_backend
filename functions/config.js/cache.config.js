const NodeCache = require("node-cache");

// Create a centralized cache instance
const cache = new NodeCache({ stdTTL: 60 * 60 * 24, checkperiod: 120 }); // Set default TTL to 100 seconds

module.exports = {
  set: (key, value, ttl = 60 * 15) => cache.set(key, value, ttl),
  get: (key) => cache.get(key),
  del: (key) => cache.del(key),
  flush: () => cache.flushAll(),
  has: (key) => cache.has(key),
};
