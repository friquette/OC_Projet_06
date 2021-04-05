class Modal {

	/*
	* @param {HTLMElement} element
	* @param {string} url - url of the movie we want to display
	*/
	constructor(element, url) {
		this.element = element;
		this.url = url;

		this.element.addEventListener('click', this.openModal.bind(this));
		this.modal = null;
		this.previouslyFocusedElement = null;

		window.addEventListener('keyup', (e) => {
			if(e.key === "Escape"  || e.key === "Esc") {
				this.closeModal(e);
			}
			if(e.key === "Tab" && this.modal !== null) {
				this.modal.querySelector("button").focus();
			}
		});
	}

	/*
	* @param {Event} e - current event
	*/
	openModal(e) {
		e.preventDefault();

		this.modal = document.querySelector(this.element.getAttribute('href'));
		this.previouslyFocusedElement = document.querySelector(':focus');
		this.modal.style.display = "flex";
		this.modal.removeAttribute('aria-hidden');
		this.modal.setAttribute('aria-modal', 'true');

		this.displayMovieInformation();

		this.modal.addEventListener('click', this.closeModal.bind(this));
		this.modal.querySelector('.close-modal').addEventListener('click', this.closeModal.bind(this));
		this.modal.querySelector('.stop-propagation').addEventListener('click', this.stopPropagation.bind(this));
		
	}

	/*
	* @param {Event} e - current event
	*/
	closeModal(e) {
		if(this.modal === null) return;
		e.preventDefault();

		this.modal.style.display = 'none';
		if(this.previouslyFocusedElement !== null) this.previouslyFocusedElement.focus();
		this.modal.setAttribute('aria-hidden', 'true');
		this.modal.removeAttribute('aria-modal');

		this.deleteMovieInformation();

		this.modal.removeEventListener('click', this.closeModal.bind(this));
		this.modal.querySelector('.close-modal').removeEventListener('click', this.closeModal);
		this.modal.querySelector('.stop-propagation').removeEventListener('click', this.stopPropagation);
		this.modal = null;
	}

	stopPropagation(e) {
		e.stopPropagation();
	}

	/*
	* Async function - creates all HTMLElements and add them into the modal to display movies information
	*/
	async displayMovieInformation() {
		const res = await fetch(this.url);
		const data = await res.json();

		const movieInformation = document.querySelector('#movie-information');

		let movieTitle = document.createElement('h2');
		movieTitle.innerHTML = data['original_title'];

		let movieDetails = document.createElement('div');
		movieDetails.setAttribute('class', 'movie-details');

		let movieMainInformation = document.createElement('div');
		movieMainInformation.setAttribute('class', 'movie-main-information');

		let movieDate = document.createElement('p');
		movieDate.innerHTML = data['year'];

		let movieDuration = document.createElement('p');
		movieDuration.innerHTML = this.durationCalculation(data['duration']);

		let movieDescription = document.createElement('p')
		movieDescription.innerHTML = data['long_description'];

		let movieDirector = document.createElement('p');
		movieDirector.innerHTML = `Réalisé par: ${data['directors'].join(', ')}`;

		let movieActors = document.createElement('p');
		movieActors.innerHTML = `Acteurs: ${data['actors'].join(', ')}`;

		let movieGenres = document.createElement('p');
		movieGenres.innerHTML = `Genre: ${data['genres'].join(', ')}`;

		let movieCountries = document.createElement('p');
		movieCountries.innerHTML = `Pays: ${data['countries'].join(', ')}`;

		let movieBoxOffice = document.createElement('p');
		movieBoxOffice.innerHTML = this.convertIntoCurrency(data['worldwide_gross_income']);

		let movieRated = document.createElement('p');
		movieRated.innerHTML = 	`${data['rated'] === "Not rated or unkown rating" || data['rated'] === "0" ? "" : "Rated: " + data['rated']}`;

		let movieImdbScore = document.createElement('p')
		movieImdbScore.innerHTML = 	`IMDb: ${data['imdb_score']}`;

		let moviePicture = document.querySelector("#movie-picture");
		moviePicture.setAttribute('src', data["image_url"]);

		movieDetails.appendChild(movieImdbScore);
		movieDetails.appendChild(movieDuration);
		movieDetails.appendChild(movieDate);
		movieDetails.appendChild(movieRated);

		movieMainInformation.appendChild(movieDescription);
		movieMainInformation.appendChild(movieDirector);
		movieMainInformation.appendChild(movieActors);
		movieMainInformation.appendChild(movieGenres);
		movieMainInformation.appendChild(movieCountries);
		movieMainInformation.appendChild(movieBoxOffice);

		movieInformation.appendChild(movieTitle);
		movieInformation.appendChild(movieDetails);
		movieInformation.appendChild(movieMainInformation);
	}

	deleteMovieInformation() {
		const movieInformation = document.querySelector('#movie-information');
		movieInformation.innerHTML = '';

		const moviePicture = document.querySelectorAll('.modal-wrapper img');
		moviePicture[0].setAttribute('src', '');
	}

	/*
	* Converts minutes into format h:mm
	* @param {number} duration - duration from current movie
	* @returns {string}
	*/
	durationCalculation(duration) {
		let m = duration % 60;
		let h = (duration - m) / 60;
		return `${h}h${(m < 10 ? "0" + m : m)}`;
	}

	/*
	* Converts number into USD currency
	* @param {number} income - income from current movie
	* @returns {string}
	*/
	convertIntoCurrency(income) {
		let formatter = new Intl.NumberFormat('fr-FR', {
			style: 'currency',
			currency: 'USD',
			maximumFractionDigits: 0,
		});

		return income !== null ? `Résultat au Box Office: ${formatter.format(income)}` : "";
	}
}