// Correct API URL
const API_URL = "https://69346d9e4090fe3bf01fe4c5.mockapi.io/movies";

const movieListDiv = document.getElementById('movie-list');
const searchInput = document.getElementById('search-input');
const form = document.getElementById('add-movie-form');

let allMovies = [];

// --- Render Movies ---
function renderMovies(movies) {
    movieListDiv.innerHTML = "";

    movies.forEach(movie => {
        const movieElement = document.createElement("div");
        movieElement.classList.add("movie-item");

        movieElement.innerHTML = `
            <p><strong>${escapeHtml(movie.title)}</strong> 
            (${escapeHtml(String(movie.year))}) - ${escapeHtml(movie.genre)}</p>

            <div>
                <button class="edit-btn"
                    data-id="${movie.id}"
                    data-title="${escapeAttr(movie.title)}"
                    data-year="${escapeAttr(movie.year)}"
                    data-genre="${escapeAttr(movie.genre)}"
                >Edit</button>

                <button class="delete-btn" data-id="${movie.id}">
                    Delete
                </button>
            </div>
        `;

        movieListDiv.appendChild(movieElement);
    });
}

// --- Fetch Movies ---
function fetchMovies() {
    fetch(API_URL)
        .then(res => res.json())
        .then(data => {
            allMovies = data;
            renderMovies(allMovies);
        })
        .catch(err => console.error("Fetch error:", err));
}

fetchMovies();

// --- Search ---
searchInput.addEventListener("input", () => {
    const keyword = searchInput.value.toLowerCase();

    const filtered = allMovies.filter(movie =>
        movie.title.toLowerCase().includes(keyword) ||
        movie.genre.toLowerCase().includes(keyword)
    );

    renderMovies(filtered);
});

// --- Add Movie ---
form.addEventListener("submit", (event) => {
    event.preventDefault();

    const newMovie = {
        title: document.getElementById("title").value.trim(),
        genre: document.getElementById("genre").value.trim(),
        year: parseInt(document.getElementById("year").value)
    };

    if (!newMovie.title || isNaN(newMovie.year)) {
        alert("Please fill all fields correctly.");
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

// --- Edit & Delete ---
movieListDiv.addEventListener("click", (e) => {
    const btn = e.target;
    const id = btn.dataset.id;

    // DELETE
    if (btn.classList.contains("delete-btn")) {
        if (!confirm("Are you sure you want to delete this?")) return;

        fetch(`${API_URL}/${id}`, { method: "DELETE" })
            .then(res => res.json())
            .then(() => fetchMovies())
            .catch(err => console.error("DELETE error:", err));
    }

    // EDIT
    if (btn.classList.contains("edit-btn")) {
        const title = prompt("New title:", btn.dataset.title);
        const year = prompt("New year:", btn.dataset.year);
        const genre = prompt("New genre:", btn.dataset.genre);

        if (!title || !year || !genre) return;

        const updatedMovie = {
            title,
            year: parseInt(year),
            genre
        };

        fetch(`${API_URL}/${id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(updatedMovie)
        })
            .then(res => res.json())
            .then(() => fetchMovies())
            .catch(err => console.error("EDIT error:", err));
    }
});

// --- Safety helpers ---
function escapeHtml(str) {
    return String(str)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function escapeAttr(str) {
    return String(str)
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}
