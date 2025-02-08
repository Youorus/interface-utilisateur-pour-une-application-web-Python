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
  voirPlusButtons: {
    random: document.getElementById("voir-plus-random"),
    selected: document.getElementById("voir-plus-selected"),
  },
  bestMovieContainer: document.querySelector(".best-movie"), // ✅ Conteneur pour le meilleur film
};

// ============================
// Variables Globales
// ============================
const pagination = {
  random: { next: null, previous: null },
  selected: { next: null, previous: null },
};

let isReversing = false; // Pour détecter l'état "Voir moins"

// ============================
// Gestion du Loader
// ============================
const toggleLoader = (show) => {
  document.getElementById("loader").classList.toggle("hidden", !show);
};

// ============================
// Création de la carte de film
// ============================
const createMovieCard = (movie) => `
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

// ============================
// Affichage des Films
// ============================
const displayMovies = (movies, container) => {
  movies.forEach((movie) => {
    container.insertAdjacentHTML("beforeend", createMovieCard(movie));
  });
};

// ============================
// Affichage du Meilleur Film
// ============================
const displayBestMovie = (movie) => {
  DOM.bestMovieContainer.innerHTML = `
    <div class="col-md-3">
      <img src="${movie.image_url}" alt="${
    movie.title
  }" class="img-fluid rounded" />
    </div>
    <div class="col-md-9 d-flex flex-column">
      <h4 class="fw-bold titre-text">${movie.title}</h4>
      <p class="movie-description">${
        movie.description || "Description non disponible."
      }</p>
      <div class="text-end">
        <button class="btn-detail" onclick="showMovieDetails(${
          movie.id
        })">Détails</button>
      </div>
    </div>
  `;
};

// ============================
// Gestion de la Pagination
// ============================
const updatePagination = (data, type) => {
  pagination[type].next = data.next;
  pagination[type].previous = data.previous;

  DOM.voirPlusButtons[type].textContent = data.next
    ? "Voir plus"
    : "Voir moins";
  if (isReversing && !data.previous) isReversing = false;
};

// ============================
// Récupération des Films
// ============================
const fetchMovies = async ({
  genre = null,
  container,
  titleElement,
  url = null,
  type = "random",
}) => {
  toggleLoader(true);
  try {
    const fetchUrl = url || `${MOVIES_ENDPOINT}?genre=${genre}`;
    const response = await fetch(fetchUrl);
    const data = await response.json();

    if (!url && genre) {
      container.innerHTML = "";
      titleElement.textContent = genre;
    }

    if (isReversing) container.innerHTML = "";

    displayMovies(data.results, container);
    updatePagination(data, type);
  } catch (error) {
    console.error(`Erreur lors de la récupération des films (${type}):`, error);
  } finally {
    toggleLoader(false);
  }
};

// ============================
// Récupération du Meilleur Film
// ============================
const fetchBestMovie = async () => {
  toggleLoader(true);
  try {
    const response = await fetch(MOVIES_ENDPOINT);
    const data = await response.json();

    const totalPages = Math.ceil(data.count / data.results.length);
    const maxPages = Math.min(totalPages, 100); // Limite à 100 pages pour optimisation

    const urls = Array.from(
      { length: maxPages },
      (_, i) => `${MOVIES_ENDPOINT}?page=${i + 1}`
    );
    const fetchPromises = urls.map((url) =>
      fetch(url).then((res) => res.json())
    );
    const allPagesData = await Promise.all(fetchPromises);

    // Trouver le film avec le plus de votes
    const bestMovie = allPagesData
      .flatMap((page) => page.results)
      .reduce(
        (max, movie) => (movie.votes > (max?.votes || 0) ? movie : max),
        null
      );

    if (bestMovie) {
      const bestMovieDetailsResponse = await fetch(
        `${MOVIES_ENDPOINT}${bestMovie.id}`
      );
      const bestMovieDetails = await bestMovieDetailsResponse.json();
      displayBestMovie(bestMovieDetails);
    }
  } catch (error) {
    console.error("Erreur lors de la récupération du meilleur film:", error);
  } finally {
    toggleLoader(false);
  }
};

// ============================
// Initialisation des Catégories
// ============================
const initializeCategories = async () => {
  try {
    let genres = [];
    let nextPageUrl = GENRES_ENDPOINT;

    while (nextPageUrl) {
      const response = await fetch(nextPageUrl);
      const data = await response.json();
      genres = [...genres, ...data.results];
      nextPageUrl = data.next;
    }

    if (genres.length > 0) {
      const randomGenre = genres[Math.floor(Math.random() * genres.length)];
      fetchMovies({
        genre: randomGenre.name,
        container: DOM.randomCategoryMovies,
        titleElement: DOM.randomCategoryTitle,
        type: "random",
      });

      genres.forEach((genre) => {
        const option = new Option(genre.name, genre.name);
        DOM.categorySelect.appendChild(option);
      });
    }
  } catch (error) {
    console.error("Erreur lors de la récupération des genres:", error);
  }
};

// ============================
// Gestion des Événements
// ============================
const handleVoirPlusClick = (type) => {
  const { next, previous } = pagination[type];

  if (DOM.voirPlusButtons[type].textContent === "Voir plus" && next) {
    fetchMovies({
      container: DOM[`${type}CategoryMovies`],
      titleElement: DOM[`${type}CategoryTitle`],
      url: next,
      type,
    });
  } else if (
    DOM.voirPlusButtons[type].textContent === "Voir moins" &&
    previous
  ) {
    isReversing = true;
    fetchMovies({
      container: DOM[`${type}CategoryMovies`],
      titleElement: DOM[`${type}CategoryTitle`],
      url: previous,
      type,
    });
  }
};

const setupEventListeners = () => {
  DOM.categorySelect.addEventListener("change", (event) => {
    fetchMovies({
      genre: event.target.value,
      container: DOM.selectedCategoryMovies,
      titleElement: DOM.selectedCategoryTitle,
      type: "selected",
    });
  });

  Object.keys(DOM.voirPlusButtons).forEach((type) => {
    DOM.voirPlusButtons[type].addEventListener("click", () =>
      handleVoirPlusClick(type)
    );
  });
};

// ============================
// Affichage des Détails du Film
// ============================
const showMovieDetails = async (movieId) => {
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
};

// ============================
// Initialisation de l'Application
// ============================
(function initializeApp() {
  initializeCategories();
  setupEventListeners();
  fetchBestMovie(); // ✅ Appel de la logique du meilleur film
})();
