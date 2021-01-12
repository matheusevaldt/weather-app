// Global variables.
const searchInput = document.querySelector('.search-input');
const searchBox = new google.maps.places.SearchBox(searchInput);

const localIcon = document.querySelector('.local-icon');
const tomorrowIcon = document.querySelector('.tomorrow-icon');

const tomorrowAverageDescription = document.querySelector('.tomorrow-average-description');
const tomorrowTemperatureMorning = document.querySelector('.tomorrow-temperature-morning');
const tomorrowTemperatureEvening = document.querySelector('.tomorrow-temperature-evening');
const tomorrowTemperatureNight = document.querySelector('.tomorrow-temperature-night');
const tomorrowTemperatureMinimum = document.querySelector('.tomorrow-temperature-minimum');
const tomorrowTemperatureMaximum = document.querySelector('.tomorrow-temperature-maximum');
const tomorrowPrecipitation = document.querySelector('.tomorrow-precipitation');
const tomorrowHumidity = document.querySelector('.tomorrow-humidity');
const tomorrowUV = document.querySelector('.tomorrow-uv');
const loadingWeather = document.querySelector('.loading-weather');
const errorNotification = document.querySelector('.error-notification');
const weatherData = document.querySelector('.weather-data');
const buttonShowMore = document.querySelector('.button-show-more');
const moreWeatherData = document.querySelector('.more-weather-data');
const buttonScrollToTop = document.querySelector('.button-scroll-to-top');
const moreInfo = document.querySelector('.more-info');
const buttonOpenMoreInfo = document.querySelector('.button-open-more-info');
const buttonCloseMoreInfo = document.querySelector('.button-close-more-info');

// Event listeners.
buttonShowMore.addEventListener('click', showMore);
buttonScrollToTop.addEventListener('click', scrollToTop);
buttonOpenMoreInfo.addEventListener('click', openMoreInfo);
buttonCloseMoreInfo.addEventListener('click', closeMoreInfo);

// Whenever the user selects one of the places that were showing in the autocomplete dropbox list, do the following:
// - Get the latitude and longitude of the selected place.
// - Fetch weather and air quality data of the selected place.
// - If there were errors in the process, display an error message.
// - Display the fetched data of the selected place in the DOM.
searchBox.addListener('places_changed', async () => {
    try {
        resetApplication();
        displayLoadingWeather();
        const local = searchBox.getPlaces()[0];
        const latitude = local.geometry.location.lat();
        const longitude = local.geometry.location.lng(); 
        const localName = local.formatted_address;
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
        const response = await fetch('/weather', options);
        const weather = await response.json();
        console.log(weather);
        hideLoadingWeather();
        if (weather[0] === 'Error') {
            weatherData.style.display = 'none';
            errorNotification.style.display = 'flex';
            return;
        }
        assignData(weather, localName);
    } catch (err) {
        console.error(err);
    }
});

function assignData(data, name) {
    setTimeout(() => weatherData.classList.add('weather-data-display'), 200);
    displayHeaderData(data.weather_data.current.weather[0].description, name);
    displayIcons(data.weather_data.current.weather[0].icon, localIcon);
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
    displayAirQuality(data.air_quality_data);
    displayIcons(data.weather_data.daily[1].weather[0].icon, tomorrowIcon);
}

function displayHeaderData(localDescription, localName) {
    const description = localDescription;
    const descriptionToUpperCase = description.charAt(0).toUpperCase();
    const descriptionToLowerCase = description.slice(1).toLowerCase();
    const descriptionAdjusted = descriptionToUpperCase + descriptionToLowerCase;
    document.querySelector('.local-description').innerHTML = descriptionAdjusted;
    document.querySelector('.local-name').innerHTML = localName;
}

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

function displayTemperature(temperature) {
    const localTemperatureCurrent = document.querySelector('.local-temperature-current');
    const localTemperatureMinimum = document.querySelector('.local-temperature-minimum');
    const localTemperatureMaximum = document.querySelector('.local-temperature-maximum');
    const localTemperatureFeelsLike = document.querySelector('.local-temperature-feels-like');
    localTemperatureCurrent.innerHTML = `<span class="title-color">Temperature:</span> ${temperature.current.temp.toFixed(1)}º C`;
    localTemperatureMinimum.innerHTML = `${temperature.daily[0].temp.min.toFixed(1)}º C`;
    localTemperatureMaximum.innerHTML = `${temperature.daily[0].temp.max.toFixed(1)}º C`;
    localTemperatureFeelsLike.innerHTML = `<span class="title-color">Feels like:</span> ${temperature.current.feels_like.toFixed(1)}º C`;
}

function displayTemperatureLastUpdated() {
    let date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    hours = hours < 10 ? `0${hours}` : hours;
    minutes = minutes < 10 ? `0${minutes}`: minutes;
    document.querySelector('.temperature-last-updated').innerHTML = `<span class="title-color">Last updated:</span> today at ${hours}:${minutes}`;
}

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

    if (sunriseHours > 24) sunriseHours = sunriseHours - 24;

    let hoursAdjusted = sunriseHours < 10 ? `0${sunriseHours}` : sunriseHours;
    let minutesAdjusted = sunriseObject.getMinutes() < 10 ? `0${sunriseObject.getMinutes()}` : sunriseObject.getMinutes();
    document.querySelector('.local-sunrise').innerHTML = `<span class="title-color">Sunrise:</span> ${hoursAdjusted}:${minutesAdjusted}`;
}

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

    if (sunsetHours > 24) sunsetHours = sunsetHours - 24;

    let hoursAdjusted = sunsetHours < 10 ? `0${sunsetHours}` : sunsetHours;
    let minutesAdjusted = sunsetObject.getMinutes() < 10 ? `0${sunsetObject.getMinutes()}` : sunsetObject.getMinutes();
    document.querySelector('.local-sunset').innerHTML = `<span class="title-color">Sunset:</span> ${hoursAdjusted}:${minutesAdjusted}`;
}

function displayWind(wind) {
    document.querySelector('.local-wind-speed').innerHTML = `<span class="title-color">Wind speed:</span> ${wind.wind_speed} m/s`;
    document.querySelector('.local-wind-direction').innerHTML = `<span class="title-color">Wind direction:</span> ${wind.wind_deg}º`;
}

function displayPrecipitation(precipitation) {
    document.querySelector('.local-precipitation').innerHTML = `<span class="title-color">Probability of precipitation:</span> ${(precipitation * 100).toFixed(0)}%`;
}

function displayHumidity(humidity) {
    document.querySelector('.local-humidity').innerHTML = `<span class="title-color">Humidity:</span> ${humidity}%`;
}

function displayVisibility(visibility) {
    document.querySelector('.local-visibility').innerHTML = `<span class="title-color">Visibility:</span> ${visibility / 1000} km`;
}

function displayCloudiness(cloudiness) {
    document.querySelector('.local-cloudiness').innerHTML = `<span class="title-color">Cloudiness:</span> ${cloudiness}%`;
}

function displayPressure(pressure) {
    document.querySelector('.local-pressure').innerHTML = `<span class="title-color">Atmospheric pressure:</span> ${pressure} nPa`;
}

function displayUltravioletIndex(uv) {
    document.querySelector('.local-uv').innerHTML = `<span class="title-color">Ultraviolet index:</span> ${uv}`;
}

function displayAirQuality(data) {
    const localAirQuality = document.querySelector('.local-air-quality');
    if (data.results.length !== 0) {
        const airQuality = data.results[0].measurements[0];
        const lastUpdated = airQuality.lastUpdated.split('T')[0];
        const lastUpdatedSplitted = lastUpdated.split('-');
        const lastUpdatedAdjusted = `${lastUpdatedSplitted[2]}/${lastUpdatedSplitted[1]}/${lastUpdatedSplitted[0]}`
        localAirQuality.innerHTML = `
            <span class="title-color">Air quality:</span> 
            ${getAirQualityParameter(airQuality.parameter)} is at ${airQuality.value.toFixed(1)} ${airQuality.unit}. 
            Last updated in ${lastUpdatedAdjusted}.
        `;
    } else {
        localAirQuality.innerHTML = '<span class="title-color">No data about air quality.</span>';
    }
}

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

// function displayWeather(data, name) {
//     setTimeout(() => weatherData.classList.add('weather-data-display'), 200);
//     localName.innerHTML = name;
//     getIcon(data.weather_data.current.weather[0].icon, localIcon);
//     const description = data.weather_data.current.weather[0].description;
//     const descriptionToUpperCase = description.charAt(0).toUpperCase();
//     const descriptionToLowerCase = description.slice(1).toLowerCase();
//     const descriptionAdjusted = descriptionToUpperCase + descriptionToLowerCase;
//     localDescription.innerHTML = descriptionAdjusted;
//     getTemperatureLastUpdated();
//     localTemperatureCurrent.innerHTML = `<span class="title-info">Temperature: </span>${data.weather_data.current.temp.toFixed(1)}º C`;
//     localTemperatureFeelsLike.innerHTML = `<span class="title-info">Feels like: </span>${data.weather_data.current.feels_like.toFixed(1)}º C`;
//     localTemperatureMinimum.innerHTML = `${data.weather_data.daily[0].temp.min.toFixed(1)}º C`;
//     localTemperatureMaximum.innerHTML = `${data.weather_data.daily[0].temp.max.toFixed(1)}º C`;
//     getSunriseAndSunset(data);
//     localPrecipitation.innerHTML = `<span class="title-info">Probability of precipitation: </span>${(data.weather_data.daily[0].pop * 100).toFixed(0)}%`;
//     localHumidity.innerHTML = `<span class="title-info">Humidity: </span>${data.weather_data.current.humidity}%`;
//     localWindSpeed.innerHTML = `<span class="title-info">Wind speed: </span>${data.weather_data.current.wind_speed} m/s`;
//     localWindDirection.innerHTML = `<span class="title-info">Wind direction: </span>${data.weather_data.current.wind_deg}º`;
//     localVisibility.innerHTML = `<span class="title-info">Visibility: </span>${data.weather_data.current.visibility / 1000} km`;
//     localCloudiness.innerHTML = `<span class="title-info">Cloudiness: </span>${data.weather_data.current.clouds}%`;
//     localPressure.innerHTML = `<span class="title-info">Atmospheric pressure: </span>${data.weather_data.current.pressure} nPa`;
//     localUV.innerHTML = `<span class="title-info">Ultraviolet index: </span>${data.weather_data.current.uvi}`;
//     getAirQuality(data);
//     getIcon(data.weather_data.daily[1].weather[0].icon, tomorrowIcon);

//     tomorrowAverageDescription.innerHTML = `<span class="title-info">Average weather: </span>${data.weather_data.daily[1].weather[0].description}`;
//     tomorrowTemperatureMorning.innerHTML = `<span class="title-info">Morning<br/></span>${data.weather_data.daily[1].temp.morn.toFixed(1)}º C`;
//     tomorrowTemperatureEvening.innerHTML = `<span class="title-info">Evening<br/></span>${data.weather_data.daily[1].temp.eve.toFixed(1)}º C`;
//     tomorrowTemperatureNight.innerHTML = `<span class="title-info">Night<br/></span>${data.weather_data.daily[1].temp.night.toFixed(1)}º C`;
//     tomorrowTemperatureMinimum.innerHTML = `${data.weather_data.daily[1].temp.min.toFixed(1)}º C`;
//     tomorrowTemperatureMaximum.innerHTML = `${data.weather_data.daily[1].temp.max.toFixed(1)}º C`;
//     tomorrowPrecipitation.innerHTML = `<span class="title-info">Probability of precipitation: </span>${(data.weather_data.daily[1].pop * 100).toFixed(0)}%`;
//     tomorrowHumidity.innerHTML = `<span class="title-info">Humidity: </span>${data.weather_data.daily[1].humidity}%`;
//     tomorrowUV.innerHTML = `<span class="title-info">Ultraviolet index: </span>${data.weather_data.daily[1].uvi}`;

// }



function displayLoadingWeather() {
    loadingWeather.style.display = 'block';
}

function hideLoadingWeather() {
    loadingWeather.style.display = 'none';
}

function showMore() {
    buttonShowMore.style.display = 'none';
    moreWeatherData.style.display = 'block';
}

function scrollToTop() {
    window.scroll({
        top: 0,
        left: 0,
        behavior: 'smooth'
      });
}

function openMoreInfo() {
    moreInfo.style.display = 'block';
}

function closeMoreInfo() {
    moreInfo.style.display = 'none';
}

function resetApplication() {
    searchInput.value = '';
    weatherData.classList.remove('weather-data-display');
    errorNotification.style.display = 'none';
    buttonShowMore.style.display = 'block';
    moreWeatherData.style.display = 'none';
    moreInfo.style.display = 'none';
}