async function loadCategories() {
	let page = 1;
	let nextPage = '';
	let allCategories = [];

	do {
		const res = await fetch(`http://localhost:8000/api/v1/genres?page=${page}`);
		const data = await res.json();
		nextPage = data.next;
		
		createCategoryList(allCategories, data)
		page++;

	} while (nextPage !== null);

	displayCategories(allCategories);
}

function createCategoryList(categoriesList, data) {
	for (let category of data.results){
		categoriesList.push(category)
	}
}

function displayCategories(categoriesList) {
	const categoryUl = document.getElementById("liste-categorie");
	for (let category of categoriesList) {
		const categories = document.createElement('li');
		categories.setAttribute('class', 'categorie-name')

		const linkCategory = document.createElement('a');
		linkCategory.setAttribute('href', '');
		linkCategory.setAttribute('class', 'categorie-link');
		linkCategory.innerHTML = category.name;

		categories.appendChild(linkCategory);
		categoryUl.appendChild(categories);
	}

	createCategoryClickEvent();
}

function createCategoryClickEvent(){
	let categoryList = document.getElementsByClassName("categorie-link");
	for (let i = 0; i < categoryList.length; i++){
		categoryList[i].addEventListener('click', function(event){
			event.preventDefault();
			loadCategoryContent(categoryList[i].innerHTML);
		});
	}
}

async function loadCategoryContent(categoryName) {
	const url = `http://localhost:8000/api/v1/titles?genre=${categoryName.toLowerCase()}`;
	const res = await fetch(url);
	const data = await res.json();

	console.log(data);
}

document.addEventListener("DOMContentLoaded", loadCategories);