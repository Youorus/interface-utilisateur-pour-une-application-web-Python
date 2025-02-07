// === Configuration des URLs de l'API ===
const API_BASE_URL = "http://localhost:8000/api/v1";
const MOVIES_ENDPOINT = `${API_BASE_URL}/titles/`;
const GENRES_ENDPOINT = `${API_BASE_URL}/genres/`;

// === Sélection des éléments du DOM ===
const DOM_ELEMENTS = {
  randomCategoryTitle: document.getElementById("random-category-title"),
  randomCategoryMovies: document.getElementById("random-category-movies"),
  categorySelect: document.getElementById("category"),
  selectedCategoryTitle: document.getElementById("selected-category-title"),
  selectedCategoryMovies: document.getElementById("selected-category-movies"),
  voirPlusBtn: document.getElementById("voir-plus"),
};

let nextPageUrl = null; // Variable pour gérer la pagination

// === Fonction pour créer une carte de film ===
function createMovieCard(movie) {
  return `
    <div class="col-12 col-md-6 col-lg-4">
      <div class="movie-card">
        <img src="${movie.image_url}" alt="${movie.title}" />
        <div class="overlay">
          <h5>${movie.title}</h5>
          <button class="btn-overlay" onclick="showMovieDetails(${movie.id})">
            Détails
          </button>
        </div>
      </div>
    </div>
  `;
}

// === Fonction pour récupérer des films par genre ou via une URL de pagination ===
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
      container.innerHTML = ""; // Nettoyage de la section uniquement lors du premier chargement
      titleElement.textContent = genre; // Mise à jour du titre
    }

    data.results.forEach((movie) => {
      container.insertAdjacentHTML("beforeend", createMovieCard(movie));
    });

    nextPageUrl = data.next;
    DOM_ELEMENTS.voirPlusBtn.style.display = nextPageUrl ? "block" : "none";
  } catch (error) {
    console.error("Erreur lors de la récupération des films:", error);
  }
}

// === Fonction pour récupérer tous les genres ===
async function fetchAllGenres() {
  try {
    const response = await fetch(GENRES_ENDPOINT);
    const data = await response.json();
    return data.results;
  } catch (error) {
    console.error("Erreur lors de la récupération des genres:", error);
    return [];
  }
}

// === Initialisation des catégories ===
async function initializeCategories() {
  const genres = await fetchAllGenres();

  if (genres.length > 0) {
    // Choisir une catégorie aléatoire
    const randomGenre = genres[Math.floor(Math.random() * genres.length)];
    fetchMovies({
      genre: randomGenre.name,
      container: DOM_ELEMENTS.randomCategoryMovies,
      titleElement: DOM_ELEMENTS.randomCategoryTitle,
    });

    // Remplir le sélecteur de catégories
    genres.forEach((genre) => {
      const option = document.createElement("option");
      option.value = genre.name;
      option.textContent = genre.name;
      DOM_ELEMENTS.categorySelect.appendChild(option);
    });
  }
}

// === Gestion des événements ===
function setupEventListeners() {
  // Gestion de la sélection d'une catégorie
  DOM_ELEMENTS.categorySelect.addEventListener("change", (event) => {
    const selectedGenre = event.target.value;
    fetchMovies({
      genre: selectedGenre,
      container: DOM_ELEMENTS.selectedCategoryMovies,
      titleElement: DOM_ELEMENTS.selectedCategoryTitle,
    });
  });

  // Gestion du bouton "Voir plus"
  DOM_ELEMENTS.voirPlusBtn.addEventListener("click", () => {
    if (nextPageUrl) {
      const isRandomCategory =
        DOM_ELEMENTS.randomCategoryTitle.textContent !== "";
      const currentGenre = isRandomCategory
        ? DOM_ELEMENTS.randomCategoryTitle.textContent
        : DOM_ELEMENTS.categorySelect.value;
      const currentContainer = isRandomCategory
        ? DOM_ELEMENTS.randomCategoryMovies
        : DOM_ELEMENTS.selectedCategoryMovies;
      const currentTitle = isRandomCategory
        ? DOM_ELEMENTS.randomCategoryTitle
        : DOM_ELEMENTS.selectedCategoryTitle;

      fetchMovies({
        genre: currentGenre,
        container: currentContainer,
        titleElement: currentTitle,
        url: nextPageUrl,
      });
    }
  });
}

// === Initialisation au chargement de la page ===
(function initializeApp() {
  initializeCategories();
  setupEventListeners();
})();

async function showMovieDetails(movieId) {
  console.log("showMovieDetails", movieId);

  try {
    const response = await fetch(
      `http://localhost:8000/api/v1/titles/${movieId}`
    );
    const movie = await response.json();

    // Mise à jour des informations du modal
    document.getElementById("filmModalLabel").textContent = movie.title;
    document.getElementById("film-details").innerHTML = `
      <strong>${movie.year} - ${movie.genre}</strong><br>
      <strong>${movie.rating} - ${movie.duration} minutes</strong><br>
      <strong>IMDB score: ${movie.imdb_score}/10</strong>
    `;
    document.getElementById("film-directors").textContent =
      movie.directors.join(", ");
    document.getElementById("film-synopsis").textContent = movie.synopsis;
    document.getElementById("film-cast").textContent = movie.actors.join(", ");
    document.getElementById("film-poster").src = movie.image_url;

    // Affichage du modal
    const filmModal = new bootstrap.Modal(document.getElementById("filmModal"));
    filmModal.show();
  } catch (error) {
    console.error("Erreur lors de la récupération des détails du film:", error);
  }
}
