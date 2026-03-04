// utils/helpers.js

// Helper to format date
const formatDate = (date) => {
  const options = { year: "numeric", month: "long", day: "numeric" };
  return new Date(date).toLocaleDateString(undefined, options);
};

// Utility to log errors
const logError = (error) => {
  console.error("Error:", error.message || error);
};

module.exports = { formatDate, logError };
