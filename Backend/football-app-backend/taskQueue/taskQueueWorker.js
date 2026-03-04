// taskQueueWorker.js
const { fetchLiveScores } = require("./services/apiService");
const { start } = require("./taskQueue/matchUpdateQueue");
// Initialize cron job worker to start fetching live scores every 5 minutes
start();

// You can add other workers or background tasks here as needed
