// Correct API URL
const API_URL = "https://69346d9e4090fe3bf01fe4c5.mockapi.io/movies";

const movieListDiv = document.getElementById('movie-list');
const searchInput = document.getElementById('search-input');
const form = document.getElementById('add-movie-form');

let allMovies = [];

// Render Movies
function renderMovies(movies) {
    movieListDiv.innerHTML = "";

    movies.forEach(movie => {
        const movieElement = document.createElement("div");
        movieElement.classList.add("movie-item");

        movieElement.innerHTML = `
            <p><strong>${movie.title}</strong> (${movie.year}) - ${movie.genre}</p>
            <div>
                <button class="edit-btn" data-id="${movie.id}">Edit</button>
                <button class="delete-btn" data-id="${movie.id}">Delete</button>
            </div>
        `;

        movieListDiv.appendChild(movieElement);
    });
}

// Fetch Movies (NO CACHE FIX)
function fetchMovies() {
    fetch(API_URL, { cache: "no-store" })
        .then(response => response.json())
        .then(data => {
            allMovies = data;
            renderMovies(allMovies);
        })
        .catch(err => console.error("Fetch error:", err));
}

fetchMovies();

// Search
searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.toLowerCase();

    const filtered = allMovies.filter(movie =>
        movie.title.toLowerCase().includes(keyword) ||
        movie.genre.toLowerCase().includes(keyword)
    );

    renderMovies(filtered);
});

// Add Movie
form.addEventListener("submit", (event) => {
    event.preventDefault();

    const newMovie = {
        title: document.getElementById("title").value.trim(),
        genre: document.getElementById("genre").value.trim(),
        year: Number(document.getElementById("year").value)
    };

    if (!newMovie.title || !newMovie.year) {
        alert("Please enter a valid title and year.");
        return;
    }

    fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newMovie)
    })
        .then(res => res.json())
        .then(() => {
            form.reset();
            fetchMovies();
        })
        .catch(err => console.error("POST error:", err));
});

// EDIT + DELETE (Event Delegation)
movieListDiv.addEventListener("click", (e) => {
    const id = e.target.dataset.id;

    // DELETE
    if (e.target.classList.contains("delete-btn")) {
        if (!confirm("Delete this movie?")) return;

        fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        })
            .then(() => fetchMovies())
            .catch(err => console.error("DELETE error:", err));
    }

    // EDIT
    if (e.target.classList.contains("edit-btn")) {
        const movie = allMovies.find(m => m.id === id);

        const newTitle = prompt("New title:", movie.title);
        const newYear = prompt("New year:", movie.year);
        const newGenre = prompt("New genre:", movie.genre);

        if (!newTitle || !newYear || !newGenre) return;

        const updatedMovie = {
            title: newTitle,
            year: Number(newYear),
            genre: newGenre
        };

        fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedMovie)
        })
            .then(() => fetchMovies())
            .catch(err => console.error("PUT error:", err));
    }
});
