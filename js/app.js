async function displayBestMovie(url, filter) {
	const res = await fetch(url + filter);
	const data = await res.json();

	const firstMovieUrl = data.results[0]["url"];
	const response = await fetch(firstMovieUrl);
	const newData = await response.json();

	const bestImdbTitle = document.getElementById("best-imdb-title");
	const bestImdbDescription = document.getElementById("best-imdb-description");
	const bestImdbImage = document.getElementById("best-imdb-image");

	bestImdbTitle.innerHTML = newData["title"];
	bestImdbDescription.innerHTML = newData["description"];
	bestImdbImage.setAttribute("src", newData["image_url"]);
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
		infinite: true
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
		slidesVisible: 4
	});
}

function createCarouselElements(movie, divParent) {
	let figure = document.createElement('figure');
	figure.setAttribute('class', 'movie-figure');

	let img = document.createElement('img');
	img.setAttribute("src", movie["image_url"]);

	let title = document.createElement('figcaption');
	title.innerHTML = movie["title"];

	figure.appendChild(img);
	figure.appendChild(title);
	divParent.appendChild(figure);
}

document.addEventListener("DOMContentLoaded", function(){
	const url = "http://localhost:8000/api/v1/titles?";
	const imdbScoreFilter = "sort_by=-imdb_score";
	const adventureFilter = "genre=action&sort_by=-votes"
	const animationFilter = "genre=animation&sort_by=-votes"

	const bestMovies = document.getElementById("best-score-carousel");
	const adventure = document.getElementById('action-movies');
	const animation = document.getElementById('animation-movies');

	displayBestMovie(url, imdbScoreFilter);
	loadBestImdbScoreMovies(url, imdbScoreFilter, bestMovies);
	loadCategoryMovies(url, adventureFilter, adventure);
	loadCategoryMovies(url, animationFilter, animation);
});

class Carousel {
	/*
	* @param {HTMLElement} element
	* @param {Object} options
	* @param {Object} options.slidesToScroll - Nombre d'éléments à faire défiler
	* @param {Object} options.slidesVisible - Nombre d'éléments visibles dans un slide
	* @param {boolean} options.infinite
	*/ 
	constructor(element, options = {}) {
		this.element = element;
		this.options = Object.assign({}, {
			slidesToScroll: 1,
			slidesVisible: 4,
			infinite: true
		}, options);

		let children = [].slice.call(element.children);
		this.isMobile = false;
		this.currentItem = 0;

		// Modification du DOM
		this.root = this.createDivWithClass('carousel');
		this.root.setAttribute('tabindex', '0');
		this.container = this.createDivWithClass('carousel__container');
		this.root.appendChild(this.container);
		this.element.appendChild(this.root);
		this.items = children.map((child) => {
			let item = this.createDivWithClass('carousel__item');
			item.appendChild(child);
			return item;
		});
		if(this.options.infinite) {
			this.offset = this.options.slidesVisible * 2 - 1;
			this.items = [
				...this.items.slice(this.items.lenght - this.offset).map(item => item.cloneNode(true)),
				...this.items,
				...this.items.slice(0, this.offset).map(item => item.cloneNode(true))
			];
			this.goToItem(this.offset, false);
		}

		this.items.forEach(item => this.container.appendChild(item));
		this.setStyle();
		this.createNavigation();

		

		// Evenements
		this.onWindowResize();
		window.addEventListener('resize', this.onWindowResize.bind(this));
		this.root.addEventListener('keyup', (e) => {
			if(e.key === 'ArrowRight') {
				this.next();
			} else if(e.key === 'ArrowLeft') {
				this.prev();
			}
		})
		if(this.options.infinite) {
			this.container.addEventListener('transitionend', this.resetInfinite.bind(this));
		}
	}

	createDivWithClass (className) {
		let div = document.createElement('div');
		div.setAttribute('class', className);
		return div;
	}

	/*
	* Applique les bonnes dimensions aux éléments du carousel
	*/
	setStyle() {
		let ratio = this.items.length / this.slidesVisible;
		this.container.style.width = (ratio * 100) + '%';
		this.items.forEach(item => item.style.width = ((100 / this.slidesVisible) / ratio) + '%');
	}

	createNavigation() {
		let nextButton = this.createDivWithClass('carousel__next');
		let prevButton = this.createDivWithClass('carousel__prev');
		this.root.appendChild(nextButton);
		this.root.appendChild(prevButton);

		nextButton.addEventListener('click', this.next.bind(this));
		prevButton.addEventListener('click', this.prev.bind(this));
	}

	next() {
		this.goToItem(this.currentItem + this.slidesToScroll);
	}

	prev() {
		this.goToItem(this.currentItem - this.slidesToScroll);
	}

	/*
	* Déplace le carousel vers l'élément ciblé
	* @param {number} index
	*/
	goToItem(index, animation = true) {
		if (index < 0) {
			index = this.items.length - this.options.slidesVisible;
		} else if (index >= this.items.length || (this.items[this.currentItem + this.slidesVisible] === undefined && index > this.currentItem)) {
			index = 0;
		}
		let translateX = index * -100 / this.items.length;
		if(animation === false){
			this.container.style.transition = 'none';
		}
		this.container.style.transform = 'translate3d(' + translateX + '%, 0, 0)';
		this.container.offsetHeight; //force le repaint
		if(animation === false) {
			this.container.style.transition = '';
		}
		this.currentItem = index;
	}

	/*
	* Déplace le container pour donner l'impression d'un slide infini
	*/
	resetInfinite() {
		if(this.currentItem <= this.options.slidesToScroll) {
			this.goToItem(this.currentItem + (this.items.length - 2 * this.offset), false);
		} else if(this.currentItem >= this.items.length - this.offset) {
			this.goToItem(this.currentItem - (this.items.length - 2 * this.offset), false);
		}
	}

	onWindowResize() {
		let mobile = window.innerWidth < 800;

		if(mobile !== this.isMobile) {
			this.isMobile = mobile;
			this.setStyle();
		}
	}

	/*
	* @returns {number} 
	*/
	get slidesToScroll() {
		return this.isMobile ? 1 : this.options.slidesToScroll;
	}

	/*
	* @returns {number} 
	*/
	get slidesVisible() {
		return this.isMobile ? 1 : this.options.slidesVisible;
	}
}