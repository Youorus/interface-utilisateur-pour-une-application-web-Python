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
// Gestion du Loader
// ============================

/**
 * Affiche le loader à l'écran.
 */
function showLoader() {
  document.getElementById("loader").classList.remove("hidden");
}

/**
 * Masque le loader de l'écran.
 */
function hideLoader() {
  document.getElementById("loader").classList.add("hidden");
}

// ============================
// Création de la carte de film
// ============================
/**
 * Crée une carte d'affichage pour un film.
 * @param {Object} movie - Les données du film.
 * @returns {string} - Le HTML de la carte du film.
 */
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
// Affichage du meilleur film
// ============================
let bestMovie = null;

/**
 * Affiche les détails du meilleur film.
 * @param {Object} movie - Les données du film à afficher.
 */
function displayBestMovie(movie) {
  const bestMovieContainer = document.querySelector(".best-movie");

  const bestMovieHTML = `
    <div class="col-md-3">
      <img src="${movie.image_url}" alt="${
    movie.title
  }" class="img-fluid rounded" />
    </div>
    <div class="col-md-9 d-flex flex-column">
      <h4 class="fw-bold titre-text">${movie.title}</h4>
      <p class="movie-description">
        ${movie.description || "Description non disponible."}
      </p>
      <div class="text-end">
        <button class="btn-detail" onclick="showMovieDetails(${
          movie.id
        })">Détails</button>
      </div>
    </div>
  `;

  bestMovieContainer.innerHTML = bestMovieHTML;
}

// ============================
// Récupération du meilleur film
// ============================
/**
 * Récupère et affiche le film avec le plus de votes.
 */
async function fetchBestMovie() {
  showLoader(); // Affiche le loader
  try {
    const response = await fetch(MOVIES_ENDPOINT);
    const data = await response.json();
    const totalPages = Math.ceil(data.count / data.results.length);
    const maxPages = Math.min(totalPages, 100);

    const urls = Array.from(
      { length: maxPages },
      (_, i) => `${MOVIES_ENDPOINT}?page=${i + 1}`
    );
    const fetchPromises = urls.map((url) =>
      fetch(url).then((res) => res.json())
    );
    const allPagesData = await Promise.all(fetchPromises);

    allPagesData.forEach((pageData) => {
      pageData?.results.forEach((movie) => {
        if (!bestMovie || movie.votes > bestMovie.votes) {
          bestMovie = movie;
        }
      });
    });

    const bestMovieDetailsResponse = await fetch(
      `${MOVIES_ENDPOINT}${bestMovie.id}`
    );
    const bestMovieDetails = await bestMovieDetailsResponse.json();

    displayBestMovie(bestMovieDetails);
  } catch (error) {
    console.error("Erreur lors de la récupération des films:", error);
  } finally {
    hideLoader(); // Masque le loader après le chargement
  }
}

// ============================
// Récupération des films
// ============================
/**
 * Récupère les films d'un genre spécifique ou d'une URL donnée.
 * @param {Object} params - Paramètres pour la récupération des films.
 * @param {string|null} params.genre - Genre du film.
 * @param {HTMLElement} params.container - Conteneur DOM pour afficher les films.
 * @param {HTMLElement} params.titleElement - Élément DOM pour afficher le titre du genre.
 * @param {string|null} params.url - URL spécifique pour la récupération des films.
 */
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
/**
 * Initialise les catégories de films disponibles.
 */
async function initializeCategories() {
  try {
    let genres = [];
    let nextPageUrl = GENRES_ENDPOINT;

    // Récupération de toutes les pages de genres
    while (nextPageUrl) {
      const response = await fetch(nextPageUrl);
      const data = await response.json();
      genres = [...genres, ...data.results];
      nextPageUrl = data.next; // Passe à la page suivante s'il y en a une
    }

    // Affiche un genre aléatoire
    if (genres.length > 0) {
      const randomGenre = genres[Math.floor(Math.random() * genres.length)];
      fetchMovies({
        genre: randomGenre.name,
        container: DOM.randomCategoryMovies,
        titleElement: DOM.randomCategoryTitle,
      });

      // Ajout des genres dans le select
      genres.forEach((genre) => {
        const option = new Option(genre.name, genre.name);
        DOM.categorySelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des genres:", error);
  }
}

// ============================
// Gestion des événements
// ============================
/**
 * Configure les écouteurs d'événements pour les interactions utilisateur.
 */
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
/**
 * Affiche les détails d'un film dans une modale.
 * @param {number} movieId - ID du film à afficher.
 */
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
    document.getElementById("film-synopsis").textContent =
      movie.long_description;
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
  fetchBestMovie();
})();
