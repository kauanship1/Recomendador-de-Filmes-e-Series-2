const apiKey = 'c1736cd4dfc68e4b43b4b66d81e31580';  // Substitua pela sua chave de API do TMDb
const baseUrl = 'https://api.themoviedb.org/3';
const language = 'pt-BR';

// Função para buscar filmes populares com trailers
async function fetchPopularMovies(genreId = null) {
    let url = `${baseUrl}/movie/popular?api_key=${apiKey}&language=${language}&page=1`;

    if (genreId) {
        url = `${baseUrl}/discover/movie?api_key=${apiKey}&language=${language}&with_genres=${genreId}`;
    }

    const response = await fetch(url);
    const data = await response.json();

    // Para cada filme, buscar o trailer
    const moviesWithTrailers = await Promise.all(data.results.map(async (movie) => {
        const trailerUrl = await fetchTrailer(movie.id);
        return {
            ...movie,
            trailerUrl
        };
    }));

    return moviesWithTrailers;
}

// Função para buscar o trailer de um filme
async function fetchTrailer(movieId) {
    const response = await fetch(`${baseUrl}/movie/${movieId}/videos?api_key=${apiKey}&language=${language}`);
    const data = await response.json();
    const trailer = data.results.find(video => video.type === 'Trailer');
    return trailer ? `https://www.youtube.com/watch?v=${trailer.key}` : null;
}

// Função para buscar filmes pelo título
async function fetchMoviesByTitle(title) {
    const response = await fetch(`${baseUrl}/search/movie?api_key=${apiKey}&language=${language}&query=${encodeURIComponent(title)}&page=1`);
    const data = await response.json();
    return data.results;
}

// Função para exibir os filmes com trailers
async function displayMovies(genreId = null, title = null) {
    let movies;
    if (title) {
        movies = await fetchMoviesByTitle(title);
    } else {
        movies = await fetchPopularMovies(genreId);
    }

    const recommendationsSection = document.getElementById('recomendacoes');
    recommendationsSection.innerHTML = ''; // Limpa recomendações anteriores

    movies.forEach(movie => {
        const card = document.createElement('div');
        card.classList.add('card');

        const image = document.createElement('img');
        image.src = `https://image.tmdb.org/t/p/w500/${movie.poster_path}`;
        image.alt = movie.title;

        const titleElement = document.createElement('h3');
        titleElement.textContent = movie.title;

        const overview = document.createElement('p');
        overview.textContent = movie.overview;

        // Criar link para o trailer
        const trailerLink = document.createElement('a');
        trailerLink.href = movie.trailerUrl;
        trailerLink.target = "_blank"; // Abre em nova aba
        trailerLink.textContent = "Assistir Trailer";
        trailerLink.classList.add('trailer-link'); // Classe para estilização

        card.appendChild(image);
        card.appendChild(titleElement);
        card.appendChild(overview);
        card.appendChild(trailerLink); // Adiciona o link do trailer

        recommendationsSection.appendChild(card);
    });
}

// Função para buscar filmes por gênero
function filtrarPorGenero() {
    const generoSelecionado = document.getElementById('genero').value;
    let genreId = null;

    // Mapeamento de IDs de gêneros com base no TMDb
    const genres = {
        'acao': 28,
        'comedia': 35,
        'drama': 18,
        'aventura': 12,
        'fantasia': 14
    };

    if (generoSelecionado !== 'todos') {
        genreId = genres[generoSelecionado];
    }

    const titleInput = document.getElementById('titulo').value;
    displayMovies(genreId, titleInput);
}

// Função para buscar por título
function buscarPorTitulo() {
    const title = document.getElementById('titulo').value;
    const genreId = document.getElementById('genero').value !== 'todos' ? genreId : null;

    displayMovies(genreId, title);
}

// Carregar filmes ao abrir a página
displayMovies();
