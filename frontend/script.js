let recent = [];
let favorites = [];

const API_BASE = 'http://localhost:3000/api/pokemon';


const typeColors = {
  fire: 'type-fire',
  water: 'type-water',
  grass: 'type-grass',
  electric: 'type-electric',
  psychic: 'type-psychic',
  ice: 'type-ice',
  dragon: 'type-dragon',
  dark: 'type-dark',
  fairy: 'type-fairy',
  normal: 'type-normal',
  fighting: 'type-fighting',
  flying: 'type-flying',
  poison: 'type-poison',
  ground: 'type-ground',
  rock: 'type-rock',
  bug: 'type-bug',
  ghost: 'type-ghost',
  steel: 'type-steel'
};


async function fetchPokemon(name) {
  const loading = document.getElementById('loading');
  const error = document.getElementById('error');
  const result = document.getElementById('result');

  if (!name) {
    showError('Please enter a Pokemon name');
    return;
  }

  loading.style.display = 'block';
  error.textContent = '';
  result.innerHTML = '';

  try {
    console.log('Fetching Pokemon:', name);
    const res = await fetch(`${API_BASE}/${name.toLowerCase()}`);
    console.log('Response status:', res.status);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error('Error response:', errorText);
      throw new Error('Pokemon not found');
    }
    
    const data = await res.json();
    console.log('Pokemon data received:', data);
    displayPokemon(data);
    addToRecent(data.name);
  } catch (err) {
    console.error('Fetch error:', err);
    showError(err.message);
  } finally {
    loading.style.display = 'none';
  }
}


function displayPokemon(data) {
  const result = document.getElementById('result');
  
  const types = data.types.map(type => {
    const typeName = type.toLowerCase();
    const typeClass = typeColors[typeName] || 'type-normal';
    return `<span class="type-badge ${typeClass}">${type}</span>`;
  }).join('');

  const statsHTML = data.stats ? data.stats.map(s => `
    <div class="stat-bar">
      <div class="stat-name">${s.name}</div>
      <div class="stat-value">${s.value}</div>
      <div class="stat-bar-bg">
        <div class="stat-bar-fill" style="width: ${Math.min((s.value / 255) * 100, 100)}%"></div>
      </div>
    </div>
  `).join('') : '';

  const abilitiesHTML = data.abilities ? `
    <div class="abilities">
      <h3>Abilities</h3>
      <div class="ability-list">
        ${data.abilities.map(a => `<span class="ability-badge">${a}</span>`).join('')}
      </div>
    </div>
  ` : '';

  const isFavorite = favorites.includes(data.name);

  result.innerHTML = `
    <div class="pokemon-card">
      <h2>${data.name.toUpperCase()}</h2>
      <div class="pokemon-image">
        <img src="${data.image}" alt="${data.name}">
      </div>
      <div class="types">${types}</div>
      <div class="pokemon-info">
        <div class="info-item">
          <div class="info-label">Height</div>
          <div class="info-value">${data.height}</div>
        </div>
        <div class="info-item">
          <div class="info-label">Weight</div>
          <div class="info-value">${data.weight}</div>
        </div>
      </div>
      ${abilitiesHTML}
      ${statsHTML ? `<div class="stats-section"><h3>Base Stats</h3>${statsHTML}</div>` : ''}
      <button class="fav-btn ${isFavorite ? 'active' : ''}" onclick="toggleFavorite('${data.name}')">
        ${isFavorite ? '★ Remove from Favorites' : '☆ Add to Favorites'}
      </button>
    </div>
  `;
}


function showError(message) {
  const error = document.getElementById('error');
  error.textContent = message;
  setTimeout(() => error.textContent = '', 3000);
}


function addToRecent(name) {
  if (!recent.includes(name)) {
    recent.unshift(name);
    if (recent.length > 5) recent.pop();
    updateRecent();
  }
}


function updateRecent() {
  const list = document.getElementById('recentList');
  list.innerHTML = recent.map(name => 
    `<li onclick="fetchPokemon('${name}')">${name}</li>`
  ).join('');
}


function toggleFavorite(name) {
  const idx = favorites.indexOf(name);
  if (idx > -1) {
    favorites.splice(idx, 1);
  } else {
    favorites.push(name);
  }
  updateFavorites();
  fetchPokemon(name);
}


function updateFavorites() {
  const list = document.getElementById('favList');
  list.innerHTML = favorites.map(name => 
    `<li onclick="fetchPokemon('${name}')">${name}</li>`
  ).join('');
}


async function getRandomPokemon() {
  const randomId = Math.floor(Math.random() * 898) + 1;
  try {
    const res = await fetch(`${API_BASE}/${randomId}`);
    if (!res.ok) throw new Error('Could not fetch random Pokemon');
    const data = await res.json();
    document.getElementById('pokemonName').value = data.name;
    fetchPokemon(data.name);
  } catch (err) {
    // Fallback to common Pokemon names
    const commonPokemon = ['pikachu', 'charizard', 'bulbasaur', 'squirtle', 'eevee', 'mewtwo', 'dragonite', 'gengar', 'snorlax', 'gyarados'];
    const randomName = commonPokemon[Math.floor(Math.random() * commonPokemon.length)];
    document.getElementById('pokemonName').value = randomName;
    fetchPokemon(randomName);
  }
}


document.getElementById('searchBtn').addEventListener('click', () => {
  const name = document.getElementById('pokemonName').value.trim();
  if (name) fetchPokemon(name);
});

document.getElementById('pokemonName').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') {
    const name = document.getElementById('pokemonName').value.trim();
    if (name) fetchPokemon(name);
  }
});

document.getElementById('randomBtn').addEventListener('click', getRandomPokemon);


updateRecent();
updateFavorites();