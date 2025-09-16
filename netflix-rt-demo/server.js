// server.js
const express = require("express");
const axios = require("axios");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json());

const OMDB_API_KEY = "71b8161c"; // your OMDb key

app.get("/movie/:title", async (req, res) => {
  const title = req.params.title;

  try {
    const omdbRes = await axios.get(`http://www.omdbapi.com/`, {
      params: { t: title, apikey: OMDB_API_KEY },
    });

    const ratings = {};
    if (omdbRes.data.Ratings) {
      for (const r of omdbRes.data.Ratings) {
        ratings[r.Source] = r.Value;
      }
    }
    res.json({
      title: omdbRes.data.Title || title,
      year: omdbRes.data.Year || "N/A",
      ratings: ratings, // e.g., { "Rotten Tomatoes": "85%", "IMDb": "7.8/10", "Metacritic": "72/100" }
      imdb: omdbRes.data.imdbRating || "N/A",
    });

  } catch (err) {
    console.error("Backend Error:", err.response?.data || err.message);
    res.status(500).json({ error: err.message });
  }
});

app.listen(3001, () => console.log("Backend running on port 3001"));