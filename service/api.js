// ============================
// Configuration de l'API
// ============================
const API_BASE_URL = "http://localhost:8000/api/v1";
const MOVIES_ENDPOINT = `${API_BASE_URL}/titles/`;
const GENRES_ENDPOINT = `${API_BASE_URL}/genres/`;

// ============================
// Sélection des éléments DOM
// ============================
const DOM = {
  randomCategoryTitle: document.getElementById("random-category-title"),
  randomCategoryMovies: document.getElementById("random-category-movies"),
  categorySelect: document.getElementById("category"),
  selectedCategoryTitle: document.getElementById("selected-category-title"),
  selectedCategoryMovies: document.getElementById("selected-category-movies"),
  voirPlusBtn: document.getElementById("voir-plus"),
};

let nextPageUrl = null;
let previousPageUrl = null; // Pour gérer la pagination arrière
let isReversing = false; // Détecte si l'on fait "Voir moins"

// ============================
// Création de la carte de film
// ============================
function createMovieCard(movie) {
  return `
    <div class="col-12 col-md-6 col-lg-4">
      <div class="movie-card">
        <img src="${movie.image_url}" alt="${movie.title}" />
        <div class="overlay">
          <h5>${movie.title}</h5>
          <button class="btn-overlay" onclick="showMovieDetails(${movie.id})">Détails</button>
        </div>
      </div>
    </div>
  `;
}

// ============================
// Récupération des films
// ============================
async function fetchMovies({
  genre = null,
  container,
  titleElement,
  url = null,
}) {
  try {
    const fetchUrl = url || `${MOVIES_ENDPOINT}?genre=${genre}`;
    const response = await fetch(fetchUrl);
    const data = await response.json();

    if (!url && genre) {
      container.innerHTML = "";
      titleElement.textContent = genre;
    }

    if (isReversing) {
      container.innerHTML = "";
    }

    data.results.forEach((movie) => {
      container.insertAdjacentHTML("beforeend", createMovieCard(movie));
    });

    nextPageUrl = data.next;
    previousPageUrl = data.previous;

    if (!nextPageUrl && !isReversing) {
      DOM.voirPlusBtn.textContent = "Voir moins";
    } else if (isReversing && !previousPageUrl) {
      DOM.voirPlusBtn.textContent = "Voir plus";
      isReversing = false;
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des films:", error);
  }
}

// ============================
// Initialisation des catégories
// ============================
async function initializeCategories() {
  const response = await fetch(GENRES_ENDPOINT);
  const data = await response.json();
  const genres = data.results;

  if (genres.length > 0) {
    const randomGenre = genres[Math.floor(Math.random() * genres.length)];
    fetchMovies({
      genre: randomGenre.name,
      container: DOM.randomCategoryMovies,
      titleElement: DOM.randomCategoryTitle,
    });

    genres.forEach((genre) => {
      const option = new Option(genre.name, genre.name);
      DOM.categorySelect.appendChild(option);
    });
  }
}

// ============================
// Gestion des événements
// ============================
function setupEventListeners() {
  DOM.categorySelect.addEventListener("change", (event) => {
    fetchMovies({
      genre: event.target.value,
      container: DOM.selectedCategoryMovies,
      titleElement: DOM.selectedCategoryTitle,
    });
  });

  DOM.voirPlusBtn.addEventListener("click", () => {
    if (DOM.voirPlusBtn.textContent === "Voir plus" && nextPageUrl) {
      fetchMovies({
        container: DOM.randomCategoryMovies,
        titleElement: DOM.randomCategoryTitle,
        url: nextPageUrl,
      });
    } else if (
      DOM.voirPlusBtn.textContent === "Voir moins" &&
      previousPageUrl
    ) {
      isReversing = true;
      fetchMovies({
        container: DOM.randomCategoryMovies,
        titleElement: DOM.randomCategoryTitle,
        url: previousPageUrl,
      });
    }
  });
}

// ============================
// Affichage des détails du film
// ============================
async function showMovieDetails(movieId) {
  try {
    const response = await fetch(`${MOVIES_ENDPOINT}${movieId}`);
    const movie = await response.json();

    document.getElementById("filmModalLabel").textContent = movie.title;
    document.getElementById("film-details").innerHTML = `
      <strong>${movie.year} - ${movie.genres.join(", ")}</strong><br>
      <strong>IMDB score: ${movie.imdb_score}/10</strong>
    `;
    document.getElementById("film-directors").textContent =
      movie.directors.join(", ");
    document.getElementById("film-synopsis").textContent = movie.synopsis;
    document.getElementById("film-cast").textContent = movie.actors.join(", ");
    document.getElementById("film-poster").src = movie.image_url;

    new bootstrap.Modal(document.getElementById("filmModal")).show();
  } catch (error) {
    console.error("Erreur lors de la récupération des détails du film:", error);
  }
}

// ============================
// Initialisation de l'application
// ============================
(function initializeApp() {
  initializeCategories();
  setupEventListeners();
})();
