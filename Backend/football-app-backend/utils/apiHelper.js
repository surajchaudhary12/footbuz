// utils/apiHelper.js

const axios = require("axios");

const makeApiRequest = async (endpoint, params = {}) => {
  const options = {
    method: "GET",
    url: `https://free-football-api-data.p.rapidapi.com/${endpoint}`,
    params: params,
    headers: {
      "x-rapidapi-host": "free-football-api-data.p.rapidapi.com",
      "x-rapidapi-key": process.env.RAPIDAPI_KEY,
    },
  };

  try {
    const response = await axios.request(options);
    return response.data;
  } catch (error) {
    if (error.response) {
      console.error(
        `API Error: ${error.response.status} - ${error.response.data.message}`
      );
      throw new Error(
        `API Error: ${error.response.data.message || "Unknown error"}`
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

module.exports = { makeApiRequest };
