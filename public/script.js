// Global variables.
const searchInput = document.querySelector('.search-input');
const searchBox = new google.maps.places.SearchBox(searchInput);
const locationIcon = document.querySelector('.location-icon');
const tomorrowIcon = document.querySelector('.tomorrow-icon');
const locationAirQuality = document.querySelector('.location-air-quality');
const loadingWeather = document.querySelector('.loading-weather');
const errorNotification = document.querySelector('.error-notification');
const weather = document.querySelector('.weather');
const buttonShowMore = document.querySelector('.button-show-more');
const moreWeather = document.querySelector('.more-weather');
const buttonScrollToTop = document.querySelector('.button-scroll-to-top');
const credits = document.querySelector('.credits');
const buttonOpenCredits = document.querySelector('.button-open-credits');
const buttonCloseCredits = document.querySelector('.button-close-credits');

// Event listeners.
buttonShowMore.addEventListener('click', showMore);
buttonScrollToTop.addEventListener('click', scrollToTop);
buttonOpenCredits.addEventListener('click', openCredits);
buttonCloseCredits.addEventListener('click', closeCredits);

// Whenever the user selects one of the locations that were showing in the autocomplete menu, do the following:
// - Display a loading spinner while the data is being fetched.
// - Get the latitude and longitude of the location.
// - Fetch the weather and air quality data of the location.
// '--> If there was an error in fetching the weather data, return an error message.
// '--> If there was an error in fetching the air quality data, notify the user of that.
// - Remove the loading spinner and display the fetched data of the location.
searchBox.addListener('places_changed', async () => {
    try {
        resetApplication();
        displayLoadingWeather();
        const location = searchBox.getPlaces()[0];
        const latitude = location.geometry.location.lat();
        const longitude = location.geometry.location.lng(); 
        const name = location.formatted_address;
        const options = {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                latitude: latitude,
                longitude: longitude
            })
        }
        fetchAirQuality(options);
        const weatherResponse = await fetch('/weather', options);
        const weatherData = await weatherResponse.json();
        console.log(weatherData);
        hideLoadingWeather();
        if (weatherData[0] === 'Error') throw new Error;
        assignWeatherData(weatherData, name);
    } catch (err) {
        console.error(err);
        weather.classList.remove('weather-display');
        errorNotification.style.display = 'flex';
    }
});

async function fetchAirQuality(options) {
    try {
        locationAirQuality.innerHTML = '<span class="title-color">Air quality:</span> working on it...';
        const airQualityResponse = await fetch('/air-quality', options);
        const airQualityData = await airQualityResponse.json();
        console.log(airQualityData);
        if (airQualityData[0] === 'Error') throw new Error;
        displayAirQuality(airQualityData.air_quality_data);
    } catch (err) {
        console.log(err);
        locationAirQuality.innerHTML = '<span class="title-color">Air quality:</span> unable to fetch the air quality data.';
    }
}

// Once the weather data has been fetched, assign it to selected elements.
function assignWeatherData(data, name) {
    setTimeout(() => weather.classList.add('weather-display'), 200);
    displayHeaderData(data.weather_data.current.weather[0].description, name);
    displayIcons(data.weather_data.current.weather[0].icon, locationIcon);
    displayTemperature(data.weather_data);
    displayTemperatureLastUpdated();
    displaySunrise(data.weather_data.current.sunrise, data.weather_data.timezone_offset);
    displaySunset(data.weather_data.current.sunset, data.weather_data.timezone_offset);
    displayWind(data.weather_data.current);
    displayPrecipitation(data.weather_data.daily[0].pop);
    displayHumidity(data.weather_data.current.humidity);
    displayVisibility(data.weather_data.current.visibility);
    displayCloudiness(data.weather_data.current.clouds);
    displayPressure(data.weather_data.current.pressure);
    displayUltravioletIndex(data.weather_data.current.uvi);
    displayTomorrowHeader(data.weather_data.daily[1].weather[0].description);
    displayIcons(data.weather_data.daily[1].weather[0].icon, tomorrowIcon);
    displayTomorrowTemperature(data.weather_data.daily[1].temp);
    displayTomorrowPrecipitation(data.weather_data.daily[1].pop);
    displayTomorrowHumidity(data.weather_data.daily[1].humidity);
    displayTomorrowUltravioletIndex(data.weather_data.daily[1].uvi);
}

// Display the name of the location and the description of the weather.
function displayHeaderData(description, name) {
    const descriptionRaw = description;
    const descriptionToUpperCase = descriptionRaw.charAt(0).toUpperCase();
    const descriptionToLowerCase = descriptionRaw.slice(1).toLowerCase();
    const descriptionAdjusted = descriptionToUpperCase + descriptionToLowerCase;
    document.querySelector('.location-description').innerHTML = descriptionAdjusted;
    document.querySelector('.location-name').innerHTML = name;
}

// Display an image that represents the state of the weather.
function displayIcons(id, where) {
    const icons = {
        '01d': '<img src="images/clear-day.png" alt="Clear sky">',
        '01n': '<img src="images/clear-night.png" alt="Clear sky">',
        '02d': '<img src="images/partly-cloudy-day.png" alt="Partly cloudy">',
        '02n': '<img src="images/partly-cloudy-night.png" alt="Partly cloudy">',
        '03d': '<img src="images/scattered-clouds.png" alt="Scattered clouds">',
        '03n': '<img src="images/scattered-clouds.png" alt="Scattered clouds">',
        '04d': '<img src="images/overcast-clouds.png" alt="Overcast clouds">',
        '04n': '<img src="images/overcast-clouds.png" alt="Overcast clouds">',
        '09d': '<img src="images/rain.png" alt="Rain">',
        '09n': '<img src="images/rain.png" alt="Rain">',
        '10d': '<img src="images/rain.png" alt="Rain">',
        '10n': '<img src="images/rain.png" alt="Rain">',
        '11d': '<img src="images/thunderstorm.png" alt="Thunderstorm">',
        '11n': '<img src="images/thunderstorm.png" alt="Thunderstorm">',
        '13d': '<img src="images/snow.png" alt="Snow">',
        '13n': '<img src="images/snow.png" alt="Snow">',
        '50d': '<img src="images/mist.png" alt="Mist">',
        '50n': '<img src="images/mist.png" alt="Mist">',
        default: '[Icon not found]'
    }
    return where.innerHTML = icons[id] || icons.default;
}

// Display the following temperatures:
// - Current temperature;
// - Feels like;
// - Today's minimum temperature;
// - Today's maximum temperature.
function displayTemperature(temperature) {
    const currentTemperature = document.querySelector('.current-temperature');
    const minimumTemperature = document.querySelector('.minimum-temperature');
    const maximumTemperature = document.querySelector('.maximum-temperature');
    const feelsLikeTemperature = document.querySelector('.feels-like-temperature');
    currentTemperature.innerHTML = `<span class="title-color">Temperature:</span> ${temperature.current.temp.toFixed(1)}º C`;
    minimumTemperature.innerHTML = `${temperature.daily[0].temp.min.toFixed(1)}º C`;
    maximumTemperature.innerHTML = `${temperature.daily[0].temp.max.toFixed(1)}º C`;
    feelsLikeTemperature.innerHTML = `<span class="title-color">Feels like:</span> ${temperature.current.feels_like.toFixed(1)}º C`;
}

// Display the time in which the temperature was last updated.
function displayTemperatureLastUpdated() {
    let date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    hours = hours < 10 ? `0${hours}` : hours;
    minutes = minutes < 10 ? `0${minutes}`: minutes;
    document.querySelector('.temperature-last-updated').innerHTML = `<span class="title-color">Last updated:</span> today at ${hours}:${minutes}`;
}

// Display the time of the day in which the sunrise occurs.
function displaySunrise(sunrise, timezoneOffset) {
    let timezone = timezoneOffset / 3600;
    let sunriseUnixTimestamp = sunrise;
    let sunriseMilliseconds = sunriseUnixTimestamp * 1000;
    let sunriseObject = new Date(sunriseMilliseconds);
    let sunriseHours = sunriseObject.getUTCHours();
    if (timezone < 0) {
        sunriseHours = sunriseHours - timezone.toString().substring(1);
    } else {
        sunriseHours = sunriseHours + timezone;
    } 
    if (sunriseHours > 24) {
        sunriseHours = sunriseHours - 24;
    }
    let hoursAdjusted = sunriseHours < 10 ? `0${sunriseHours}` : sunriseHours;
    let minutesAdjusted = sunriseObject.getMinutes() < 10 ? `0${sunriseObject.getMinutes()}` : sunriseObject.getMinutes();
    document.querySelector('.location-sunrise').innerHTML = `<span class="title-color">Sunrise:</span> ${hoursAdjusted}:${minutesAdjusted}`;
}

// Display the time of the day in which the sunset occurs.
function displaySunset(sunset, timezoneOffset) {
    let timezone = timezoneOffset / 3600;
    let sunsetUnixTimestamp = sunset;
    let sunsetMilliseconds = sunsetUnixTimestamp * 1000;
    let sunsetObject = new Date(sunsetMilliseconds);
    let sunsetHours = sunsetObject.getUTCHours() + 24;
    if (timezone < 0) {
        sunsetHours = sunsetHours - timezone.toString().substring(1);
    } else {
        sunsetHours = sunsetHours + timezone;
    }
    if (sunsetHours > 24) {
        sunsetHours = sunsetHours - 24;
    }
    let hoursAdjusted = sunsetHours < 10 ? `0${sunsetHours}` : sunsetHours;
    let minutesAdjusted = sunsetObject.getMinutes() < 10 ? `0${sunsetObject.getMinutes()}` : sunsetObject.getMinutes();
    document.querySelector('.location-sunset').innerHTML = `<span class="title-color">Sunset:</span> ${hoursAdjusted}:${minutesAdjusted}`;
}

function displayWind(wind) {
    document.querySelector('.location-wind-speed').innerHTML = `<span class="title-color">Wind speed:</span> ${wind.wind_speed} m/s`;
    document.querySelector('.location-wind-direction').innerHTML = `<span class="title-color">Wind direction:</span> ${wind.wind_deg}º`;
}

function displayPrecipitation(precipitation) {
    document.querySelector('.location-precipitation').innerHTML = `<span class="title-color">Probability of precipitation:</span> ${(precipitation * 100).toFixed(0)}%`;
}

function displayHumidity(humidity) {
    document.querySelector('.location-humidity').innerHTML = `<span class="title-color">Humidity:</span> ${humidity}%`;
}

function displayVisibility(visibility) {
    document.querySelector('.location-visibility').innerHTML = `<span class="title-color">Visibility:</span> ${visibility / 1000} km`;
}

function displayCloudiness(cloudiness) {
    document.querySelector('.location-cloudiness').innerHTML = `<span class="title-color">Cloudiness:</span> ${cloudiness}%`;
}

function displayPressure(pressure) {
    document.querySelector('.location-pressure').innerHTML = `<span class="title-color">Atmospheric pressure:</span> ${pressure} nPa`;
}

function displayUltravioletIndex(uv) {
    document.querySelector('.location-uv').innerHTML = `<span class="title-color">Ultraviolet index:</span> ${uv}`;
}

// If there are records of air quality in the specific location, display the information regarding this topic.
// If there are no records of air quality in the specific location, inform the user.
function displayAirQuality(data) {
    if (data.results.length !== 0) {
        const airQuality = data.results[0].measurements[0];
        const lastUpdated = airQuality.lastUpdated.split('T')[0];
        const lastUpdatedSplitted = lastUpdated.split('-');
        const lastUpdatedAdjusted = `${lastUpdatedSplitted[2]}/${lastUpdatedSplitted[1]}/${lastUpdatedSplitted[0]}`
        locationAirQuality.innerHTML = `
            <span class="title-color">Air quality:</span> 
            ${getAirQualityParameter(airQuality.parameter)} is at ${airQuality.value.toFixed(1)} ${airQuality.unit}. 
            Last updated in ${lastUpdatedAdjusted}.
        `;
    } else {
        locationAirQuality.innerHTML = '<span class="title-color">This location has no data for air quality.</span>';
    }
}

// Display the parameter in which the air quality is being measured.
function getAirQualityParameter(parameter) {
    const parameters = {
        'pm25': 'PM<span style="vertical-align: sub; font-size: 10px">2.5</span> (Particulate Matter 2.5)',
        'pm10': 'PM<span style="vertical-align: sub; font-size: 10px">10</span> (Particulate Matter 10)',
        'so2': 'SO<span style="vertical-align: sub; font-size: 10px">2</span> (Sulfur Dioxide)',
        'no2': 'NO<span style="vertical-align: sub; font-size: 10px">2</span> (Nitrogen Dioxide)',
        'o3': 'O<span style="vertical-align: sub; font-size: 10px">3</span> (Ozone 3)',
        'co': 'CO (Carbon Monoxide)',
        'bc': 'BC (Black Carbon)',
        default: '[Parameter not found]'
    }
    return parameters[parameter] || parameters.default;
}

// Display the description of tomorrow's weather.
function displayTomorrowHeader(description) {
    document.querySelector('.tomorrow-average-weather').innerHTML = `<span class="title-color">Average weather:</span> ${description}`;
}
 
// Display the following temperatures for the next day:
// - Average temperature during the morning;
// - Average temperature during the evening;
// - Average temperature during the night;
// - Tomorrow's maximum temperature;
// - Tomorrow's minimum temperature.
function displayTomorrowTemperature(temperature) {
    document.querySelector('.tomorrow-temperature-morning').innerHTML = `<span class="title-color">Morning<br/></span>${temperature.morn.toFixed(1)}º C`;
    document.querySelector('.tomorrow-temperature-evening').innerHTML = `<span class="title-color">Evening<br/></span>${temperature.eve.toFixed(1)}º C`;
    document.querySelector('.tomorrow-temperature-night').innerHTML = `<span class="title-color">Night<br/></span>${temperature.night.toFixed(1)}º C`;
    document.querySelector('.tomorrow-temperature-minimum').innerHTML = `${temperature.min.toFixed(1)}º C`;
    document.querySelector('.tomorrow-temperature-maximum').innerHTML = `${temperature.max.toFixed(1)}º C`;
}

function displayTomorrowPrecipitation(precipitation) {
    document.querySelector('.tomorrow-precipitation').innerHTML = `<span class="title-color">Probability of precipitation:</span> ${(precipitation * 100).toFixed(0)}%`;
}

function displayTomorrowHumidity(humidity) {
    document.querySelector('.tomorrow-humidity').innerHTML = `<span class="title-color">Humidity:</span> ${humidity}%`;
}

function displayTomorrowUltravioletIndex(uv) {
    document.querySelector('.tomorrow-uv').innerHTML = `<span class="title-color">Ultraviolet index:</span> ${uv}`;
}

function displayLoadingWeather() {
    loadingWeather.style.display = 'block';
}

function hideLoadingWeather() {
    loadingWeather.style.display = 'none';
}

// Display all the weather information fetched from the location's latitude and longitude.
function showMore() {
    buttonShowMore.style.display = 'none';
    moreWeather.style.display = 'block';
}

function openCredits() {
    credits.style.display = 'block';
}

function closeCredits() {
    credits.style.display = 'none';
}

function scrollToTop() {
    window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
}

function resetApplication() {
    searchInput.value = '';
    weather.classList.remove('weather-display');
    errorNotification.style.display = 'none';
    buttonShowMore.style.display = 'block';
    moreWeather.style.display = 'none';
    credits.style.display = 'none';
}