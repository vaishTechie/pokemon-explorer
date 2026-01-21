const express = require("express");
const axios = require("axios");
const cors = require("cors");   


const app = express();
const PORT = 3000;
app.use(cors());  

// ----------------------
// Simple in-memory cache
// ----------------------
const cache = new Map(); // Stores cached data
const CACHE_EXPIRY = 10 * 60 * 1000; // 10 minutes in ms
const MAX_CACHE_ENTRIES = 50;

// ----------------------
// Test route
// ----------------------
app.get("/", (req, res) => {
  res.send("Pokemon API Server is running with cache");
});

// ----------------------
// Pokemon search API with cache
// ----------------------
app.get("/api/pokemon/:name", async (req, res) => {
  const pokemonName = req.params.name.toLowerCase();

  // Check cache first
  if (cache.has(pokemonName)) {
    const cached = cache.get(pokemonName);
    const isExpired = Date.now() - cached.timestamp > CACHE_EXPIRY;

    if (!isExpired) {
      console.log(`Cache hit for ${pokemonName}`);
      return res.json(cached.data);
    } else {
      console.log(`Cache expired for ${pokemonName}`);
      cache.delete(pokemonName);
    }
  }

  try {
    const response = await axios.get(
      `https://pokeapi.co/api/v2/pokemon/${pokemonName}`
    );
    const data = response.data;

    // Clean response
    const pokemon = {
      name: data.name,
      height: data.height,
      weight: data.weight,
      types: data.types.map(t => t.type.name),
      abilities: data.abilities.map(a => a.ability.name),
      image: data.sprites.front_default,
      stats: data.stats.map(s => ({
        name: s.stat.name,
        value: s.base_stat
      }))
    };

    // Add to cache
    if (cache.size >= MAX_CACHE_ENTRIES) {
      // Remove oldest entry
      const oldestKey = cache.keys().next().value;
      cache.delete(oldestKey);
    }
    cache.set(pokemonName, { data: pokemon, timestamp: Date.now() });

    res.json(pokemon);

  } catch (error) {
    res.status(404).json({ error: "Pokemon not found" });
  }
});

// ----------------------
// Start server
// ----------------------
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
