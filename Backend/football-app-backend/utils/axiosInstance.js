// utils/axiosInstance.js

const axios = require("axios");
require("dotenv").config();

const axiosInstance = axios.create({
  baseURL: "https://football_api12.p.rapidapi.com",
  headers: {
    "x-rapidapi-host": "football_api12.p.rapidapi.com",
    "x-rapidapi-key": process.env.RAPIDAPI_KEY,
  },
});

module.exports = axiosInstance;
