// Correct API URL
const API_URL = "https://69346c064090fe3bf01fe10a.mockapi.io/movies";


const movieListDiv = document.getElementById('movie-list');
const searchInput = document.getElementById('search-input');
const form = document.getElementById('add-movie-form');

let allMovies = [];

// Render Movies to screen (keeps ID as string)
function renderMovies(movies) {
    movieListDiv.innerHTML = "";

    movies.forEach(movie => {
        const movieElement = document.createElement("div");
        movieElement.classList.add("movie-item");

        movieElement.innerHTML = `
            <p><strong>${escapeHtml(movie.title)}</strong> (${escapeHtml(String(movie.year))}) - ${escapeHtml(movie.genre)}</p>
            <div>
                <button class="edit-btn" data-id="${movie.id}" data-title="${escapeAttr(movie.title)}" data-year="${escapeAttr(movie.year)}" data-genre="${escapeAttr(movie.genre)}">Edit</button>
                <button class="delete-btn" data-id="${movie.id}">Delete</button>
            </div>
        `;

        movieListDiv.appendChild(movieElement);
    });
}

// Fetch movies
function fetchMovies() {
    fetch(API_URL)
        .then(response => response.json())
        .then(data => {
            allMovies = data; // keep IDs as strings
            renderMovies(allMovies);
        })
        .catch(err => console.error("Fetch error:", err));
}

fetchMovies();

// Search bar filter
searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.toLowerCase();

    const filtered = allMovies.filter(movie =>
        movie.title.toLowerCase().includes(keyword) ||
        movie.genre.toLowerCase().includes(keyword)
    );

    renderMovies(filtered);
});

// Add Movie (POST)
form.addEventListener("submit", (event) => {
    event.preventDefault();

    const newMovie = {
        title: document.getElementById("title").value.trim(),
        genre: document.getElementById("genre").value.trim(),
        year: parseInt(document.getElementById("year").value, 10)
    };

    if (!newMovie.title || !newMovie.year) {
        alert("Please provide title and year.");
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

// Event delegation for Edit/Delete buttons
movieListDiv.addEventListener("click", (e) => {
    const target = e.target;

    // DELETE
    if (target.classList.contains("delete-btn")) {
        const id = target.dataset.id;

        if (!confirm("Delete this movie?")) return;

        fetch(`${API_URL}/${id}`, {
            method: "DELETE"
        })
            .then(res => res.json())
            .then(() => fetchMovies())
            .catch(err => console.error("DELETE error:", err));
    }

    // EDIT
    if (target.classList.contains("edit-btn")) {
        const id = target.dataset.id;

        const currentTitle = target.dataset.title;
        const currentYear = target.dataset.year;
        const currentGenre = target.dataset.genre;

        const newTitle = prompt("Enter new title:", currentTitle);
        const newYear = prompt("Enter new year:", currentYear);
        const newGenre = prompt("Enter new genre:", currentGenre);

        if (!newTitle || !newYear || !newGenre) return;

        const updatedMovie = {
            title: newTitle,
            year: parseInt(newYear, 10),
            genre: newGenre
        };

        fetch(`${API_URL}/${id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedMovie)
        })
            .then(res => res.json())
            .then(() => fetchMovies())
            .catch(err => console.error("PUT error:", err));
    }
});

// Helpers
function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function escapeAttr(val) {
    return String(val).replaceAll('"', "&quot;").replaceAll("'", "&#39;");
}
