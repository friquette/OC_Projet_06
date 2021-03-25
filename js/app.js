async function displayBestMovie(url, filter) {
	const res = await fetch(url + filter);
	const data = await res.json();

	const firstMovieUrl = data.results[0]["url"];
	const response = await fetch(firstMovieUrl);
	const newData = await response.json();

	const bestImdbTitle = document.getElementById("best-imdb-title");
	const bestImdbDescription = document.getElementById("best-imdb-description");
	const bestImdbImage = document.getElementById("best-imdb-image");
	const detailButton = document.getElementById('detail-button');

	bestImdbTitle.innerHTML = newData["title"];
	bestImdbDescription.innerHTML = newData["description"];
	bestImdbImage.setAttribute("src", newData["image_url"]);
	new Modal(detailButton, firstMovieUrl);
}

async function loadBestImdbScoreMovies(url, filter, divParent) {
	const res = await fetch(url + filter);
	const data = await res.json();
	let firstMovies = await createMoviesList(url, filter);

	for (i = 1; i <= 7; i++){
		const movieUrl = firstMovies[i]["url"];
		const response = await fetch(movieUrl);
		const newData = await response.json();

		createCarouselElements(newData, divParent);		
	}

	new Carousel(divParent, {
		slidesToScroll: 1,
		slidesVisible: 4,
		loop: false
	});
}

async function loadCategoryMovies(url, filter, divParent) {
	const res = await fetch(url + filter);
	const data = await res.json();
	let firstMovies = await createMoviesList(url, filter);
	loadSevenFirstMovies(firstMovies, divParent);
}

async function createMoviesList(url, filter) {
	let moviesList = [];
	for (let i = 1; i < 3; i++) {
		const urls = `${url}page=${i}&${filter}`;
		const response = await fetch(urls);
		const newData = await response.json();

		for (let movie of newData.results){
			moviesList.push(movie);
		}
	}
	return moviesList;
}

async function loadSevenFirstMovies(movieList, divParent) {
	for (j = 0; j <= 6; j++){
		const movieUrl = movieList[j]["url"];
		const res = await fetch(movieUrl);
		const data = await res.json();

		createCarouselElements(data, divParent);
	}

	new Carousel(divParent, {
		slidesToScroll: 1,
		slidesVisible: 4,
		loop: false
	});
}

function createCarouselElements(movie, divParent) {
	let figure = document.createElement('figure');
	figure.setAttribute('class', 'movie-figure');
	figure.setAttribute('href', '#modal');

	let img = document.createElement('img');
	img.setAttribute("src", movie["image_url"]);

	let title = document.createElement('figcaption');
	title.innerHTML = movie["original_title"];

	figure.appendChild(img);
	figure.appendChild(title);
	divParent.appendChild(figure);
	
	new Modal(figure, movie['url']);
}

document.addEventListener("DOMContentLoaded", async function(){
	const url = "http://localhost:8000/api/v1/titles?";
	const imdbScoreFilter = "sort_by=-imdb_score";
	const actionFilter = "genre=action&sort_by=-votes"
	const animationFilter = "genre=animation&sort_by=-votes"
	const horrorFilter = "genre=horror&sort_by=-votes"

	const bestMovies = document.getElementById("best-score-carousel");
	const action = document.getElementById('action-movies');
	const animation = document.getElementById('animation-movies');
	const horror = document.getElementById('horror-movies');

	await displayBestMovie(url, imdbScoreFilter);
	await loadBestImdbScoreMovies(url, imdbScoreFilter, bestMovies);
	await loadCategoryMovies(url, actionFilter, action);
	await loadCategoryMovies(url, animationFilter, animation);
	await loadCategoryMovies(url, horrorFilter, horror);
});