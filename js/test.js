let askWeather = new XMLHttpRequest();
askWeather.onreadystatechange = function() {
	if(this.readyState == 4 && this.status == 200){
		let response = askWeather.responseText;
		console.log(response);
	}
};

askWeather.open("GET", "https://www.prevision-meteo.ch/services/json/paris");
askWeather.send();