// DOM Elements for Modal and Carousel
const filmsList = document.getElementById("films");
const searchInput = document.getElementById("search-input");

// Modal Elements
const movieModal = document.getElementById("movie-modal");
const modalPoster = document.getElementById("modal-poster");
const modalTitle = document.getElementById("modal-title");
const modalRuntime = document.getElementById("modal-runtime");
const modalShowtime = document.getElementById("modal-showtime");
const modalAvailableTickets = document.getElementById("modal-available-tickets");
const modalDescription = document.getElementById("modal-description");
const modalTicketPrice = document.getElementById("modal-ticket-price");
const modalTotalCost = document.getElementById("modal-total-cost");
const modalBuyTicketButton = document.getElementById("modal-buy-ticket");
const ticketQuantityInput = document.getElementById("ticket-quantity");
const closeModalButton = document.getElementById("close-modal");

// Store the movies data for searching and filtering
let allMovies = [];

// Fetch and populate the movie menu with posters only during loading
function fetchAndPopulateMovieMenu() {
  const loadingMessage = document.createElement("div");
  loadingMessage.textContent = "Fetching movies...";
  filmsList.appendChild(loadingMessage);

  fetch("http://localhost:3001/films")
    .then(response => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then(movies => {
      allMovies = movies;  // Store movies data in a global variable
      filmsList.innerHTML = ''; // Clear the loading message
      displayMovies(movies);
    })
    .catch(error => {
      filmsList.innerHTML = ''; // Clear the loading message
      filmsList.innerHTML = '<p>Error loading movies. Please try again later.</p>';
      console.error("Error fetching movies:", error);
    });
}

// Function to display movies
function displayMovies(movies) {
  filmsList.innerHTML = ''; // Clear previous list
  movies.forEach(movie => {
    const movieElement = document.createElement("div");
    movieElement.classList.add("film");

    const moviePoster = document.createElement("img");
    moviePoster.src = movie.poster;
    moviePoster.alt = movie.title;
    moviePoster.onclick = () => openMovieModal(movie);

    movieElement.appendChild(moviePoster);
    filmsList.appendChild(movieElement);
  });
}

// Search functionality
function searchMovies(query) {
  const filteredMovies = allMovies.filter(movie => 
    movie.title.toLowerCase().includes(query.toLowerCase()) || 
    movie.description.toLowerCase().includes(query.toLowerCase())
  );
  displayMovies(filteredMovies);
}

// Listen to the search input event and filter movies
searchInput.addEventListener("input", () => {
  const searchQuery = searchInput.value.trim();
  if (searchQuery) {
    searchMovies(searchQuery);
  } else {
    displayMovies(allMovies);  // Show all movies if search is empty
  }
});

// Open movie details in the modal
function openMovieModal(movie) {
  modalPoster.src = movie.poster;
  modalTitle.textContent = movie.title;
  modalRuntime.textContent = `Runtime: ${movie.runtime} mins`;
  modalShowtime.textContent = `Showtime: ${movie.showtime}`;
  modalDescription.textContent = movie.description;

  const available = movie.capacity - movie.tickets_sold;
  modalAvailableTickets.textContent = available;

  modalTicketPrice.textContent = movie.ticket_price.toFixed(2);
  modalTotalCost.textContent = (movie.ticket_price).toFixed(2);

  movieModal.style.display = "flex"; // Open the modal

  // Disable button if no tickets available and gray it out
  if (available <= 0) {
    modalBuyTicketButton.disabled = true;
    modalBuyTicketButton.style.backgroundColor = "#d3d3d3";  // Gray out the button
  } else {
    modalBuyTicketButton.disabled = false;
    modalBuyTicketButton.style.backgroundColor = ""; // Reset the button color
  }

  modalBuyTicketButton.onclick = () => handleBuyTicket(movie);
}

// Close modal when clicking the close button
closeModalButton.onclick = () => movieModal.style.display = "none";

// Close modal when clicking outside the modal content
movieModal.onclick = (event) => {
  if (event.target === movieModal) {
    movieModal.style.display = "none";
  }
};

// Handle ticket purchase
function handleBuyTicket(movie) {
  const available = movie.capacity - movie.tickets_sold;
  const quantity = parseInt(ticketQuantityInput.value);

  if (quantity > available) {
    alert("Not enough tickets available!");
  } else if (quantity > 0) {
    // Update the movie tickets_sold count locally
    movie.tickets_sold += quantity;

    // Update the server with the new tickets_sold count
    updateMovieOnServer(movie);

    // Update the UI with the new available ticket count
    modalAvailableTickets.textContent = movie.capacity - movie.tickets_sold;

    // If tickets are sold out, disable and gray out the button
    if (movie.capacity - movie.tickets_sold <= 0) {
      modalBuyTicketButton.disabled = true;
      modalBuyTicketButton.style.backgroundColor = "#d3d3d3";
    }
  } else {
    alert("Please select a valid ticket quantity!");
  }
}

// Update movie data on the server
function updateMovieOnServer(movie) {
  fetch(`http://localhost:3001/films/${movie.id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ tickets_sold: movie.tickets_sold }),
  })
  .then(response => response.json())
  .then(updatedMovie => {
    console.log("Movie updated:", updatedMovie);
  })
  .catch((error) => {
    console.error("Error updating tickets:", error);
  });
}

// Initialize the app
function init() {
  fetchAndPopulateMovieMenu();
}

// Update total cost when the number of tickets is changed
ticketQuantityInput.addEventListener("input", () => {
  const quantity = parseInt(ticketQuantityInput.value);
  const ticketPrice = parseFloat(modalTicketPrice.textContent);
  const totalCost = ticketPrice * quantity;
  modalTotalCost.textContent = totalCost.toFixed(2); // Update the total cost dynamically
});

// Close modal when the Escape key is pressed
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    movieModal.style.display = "none";
  }
});

// Start the app
init();
