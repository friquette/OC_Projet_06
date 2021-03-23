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