const searchInput = document.querySelector('.search-input');
const searchBox = new google.maps.places.SearchBox(searchInput);
const localName = document.querySelector('.local-name');
const localIcon = document.querySelector('.local-icon');
const localDescription = document.querySelector('.local-description');
const temperatureLastUpdated = document.querySelector('.temperature-last-updated');
const localTemperatureCurrent = document.querySelector('.local-temperature-current');
const localTemperatureFeelsLike = document.querySelector('.local-temperature-feels-like');
const localTemperatureMinimum = document.querySelector('.local-temperature-minimum');
const localTemperatureMaximum = document.querySelector('.local-temperature-maximum');
const localSunrise = document.querySelector('.local-sunrise');
const localSunset = document.querySelector('.local-sunset');
const localPrecipitation = document.querySelector('.local-precipitation');
const localHumidity = document.querySelector('.local-humidity');
const localWindSpeed = document.querySelector('.local-wind-speed');
const localWindDirection = document.querySelector('.local-wind-direction');
const localVisibility = document.querySelector('.local-visibility');
const localCloudiness = document.querySelector('.local-cloudiness');
const localPressure = document.querySelector('.local-pressure');
const localUV = document.querySelector('.local-uv');
const localAirQuality = document.querySelector('.local-air-quality');
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
const notifyError = document.querySelector('.notify-error');
const weatherData = document.querySelector('.weather-data');
const showMoreButton = document.querySelector('.show-more-button');
const moreWeatherData = document.querySelector('.more-weather-data');
const buttonScrollToTop = document.querySelector('.button-scroll-to-top');
const moreInfo = document.querySelector('.more-info');
const buttonOpenMoreInfo = document.querySelector('.button-open-more-info');
const buttonCloseMoreInfo = document.querySelector('.button-close-more-info');

showMoreButton.addEventListener('click', showMore);
buttonScrollToTop.addEventListener('click', scrollToTop);
buttonOpenMoreInfo.addEventListener('click', openMoreInfo);
buttonCloseMoreInfo.addEventListener('click', closeMoreInfo);


searchBox.addListener('places_changed', async () => {
    try {
        loadingWeather.style.display = 'block';
        resetDOM();
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
        if (weather[0] === 'Error') {
            weatherData.style.display = 'none';
            notifyError.style.display = 'flex';
            return;
        } 
        displayData(weather, localName);
    } catch (err) {
        console.error(err);
    }
});

function displayData(data, name) {
    loadingWeather.style.display = 'none';

        setTimeout(() => weatherData.classList.add('weather-data-display'), 200);
        localName.innerHTML = name;
        getIcon(data.weather_data.current.weather[0].icon, localIcon);
        const description = data.weather_data.current.weather[0].description;
        const descriptionToUpperCase = description.charAt(0).toUpperCase();
        const descriptionToLowerCase = description.slice(1).toLowerCase();
        const descriptionAdjusted = descriptionToUpperCase + descriptionToLowerCase;
        localDescription.innerHTML = descriptionAdjusted;
        getTemperatureLastUpdated();
        localTemperatureCurrent.innerHTML = `<span class="title-info">Temperature: </span>${data.weather_data.current.temp.toFixed(1)}º C`;
        localTemperatureFeelsLike.innerHTML = `<span class="title-info">Feels like: </span>${data.weather_data.current.feels_like.toFixed(1)}º C`;
        localTemperatureMinimum.innerHTML = `${data.weather_data.daily[0].temp.min.toFixed(1)}º C`;
        localTemperatureMaximum.innerHTML = `${data.weather_data.daily[0].temp.max.toFixed(1)}º C`;
        getSunriseAndSunset(data);
        localPrecipitation.innerHTML = `<span class="title-info">Probability of precipitation: </span>${(data.weather_data.daily[0].pop * 100).toFixed(0)}%`;
        localHumidity.innerHTML = `<span class="title-info">Humidity: </span>${data.weather_data.current.humidity}%`;
        localWindSpeed.innerHTML = `<span class="title-info">Wind speed: </span>${data.weather_data.current.wind_speed} m/s`;
        localWindDirection.innerHTML = `<span class="title-info">Wind direction: </span>${data.weather_data.current.wind_deg}º`;
        localVisibility.innerHTML = `<span class="title-info">Visibility: </span>${data.weather_data.current.visibility / 1000} km`;
        localCloudiness.innerHTML = `<span class="title-info">Cloudiness: </span>${data.weather_data.current.clouds}%`;
        localPressure.innerHTML = `<span class="title-info">Atmospheric pressure: </span>${data.weather_data.current.pressure} nPa`;
        localUV.innerHTML = `<span class="title-info">Ultraviolet index: </span>${data.weather_data.current.uvi}`;
        getAirQuality(data);
        getIcon(data.weather_data.daily[1].weather[0].icon, tomorrowIcon);
        tomorrowAverageDescription.innerHTML = `<span class="title-info">Average weather: </span>${data.weather_data.daily[1].weather[0].description}`;
        tomorrowTemperatureMorning.innerHTML = `<span class="title-info">Morning<br/></span>${data.weather_data.daily[1].temp.morn.toFixed(1)}º C`;
        tomorrowTemperatureEvening.innerHTML = `<span class="title-info">Evening<br/></span>${data.weather_data.daily[1].temp.eve.toFixed(1)}º C`;
        tomorrowTemperatureNight.innerHTML = `<span class="title-info">Night<br/></span>${data.weather_data.daily[1].temp.night.toFixed(1)}º C`;
        tomorrowTemperatureMinimum.innerHTML = `${data.weather_data.daily[1].temp.min.toFixed(1)}º C`;
        tomorrowTemperatureMaximum.innerHTML = `${data.weather_data.daily[1].temp.max.toFixed(1)}º C`;
        tomorrowPrecipitation.innerHTML = `<span class="title-info">Probability of precipitation: </span>${(data.weather_data.daily[1].pop * 100).toFixed(0)}%`;
        tomorrowHumidity.innerHTML = `<span class="title-info">Humidity: </span>${data.weather_data.daily[1].humidity}%`;
        tomorrowUV.innerHTML = `<span class="title-info">Ultraviolet index: </span>${data.weather_data.daily[1].uvi}`;

}

function getTemperatureLastUpdated() {
    const date = new Date();
    let hours = date.getHours();
    let minutes = date.getMinutes();
    hours = hours < 10 ? `0${hours}` : hours;
    minutes = minutes < 10 ? `0${minutes}`: minutes;
    temperatureLastUpdated.innerHTML = `<span class="title-info">Last updated:</span> today at ${hours}:${minutes}`;
}

function getSunriseAndSunset(data) {
    const timezoneOffset = data.weather_data.timezone_offset;
    const adjustHours = timezoneOffset / 3600;
    const sunriseUnixTimestamp = data.weather_data.current.sunrise;
    const sunsetUnixTimestamp = data.weather_data.current.sunset;
    const sunriseMilliseconds = sunriseUnixTimestamp * 1000;
    const sunsetMilliseconds = sunsetUnixTimestamp * 1000;
    const sunriseObject = new Date(sunriseMilliseconds);
    const sunsetObject = new Date(sunsetMilliseconds);
    let sunriseHours = sunriseObject.getUTCHours();
    let sunsetHours = sunsetObject.getUTCHours();

    sunsetHours = sunsetHours + 24;
    if (adjustHours < 0) {
        const sunriseDifference = adjustHours.toString().substring(1);
        const sunsetDifference = adjustHours.toString().substring(1);
        sunriseHours = sunriseHours - sunriseDifference;
        sunsetHours = sunsetHours - sunsetDifference;
    } else {
        sunriseHours = sunriseHours + adjustHours;
        sunsetHours = sunsetHours + adjustHours;
    }

    if (sunriseHours > 24) {
        sunriseHours = sunriseHours - 24;
    }

    if (sunsetHours > 24) {
        sunsetHours = sunsetHours - 24;
    }

    const sunriseHoursAdjusted = sunriseHours < 10 ? `0${sunriseHours}` : sunriseHours;
    const sunriseMinutes = sunriseObject.getMinutes() < 10 ? `0${sunriseObject.getMinutes()}` : sunriseObject.getMinutes();
    const sunsetHoursAdjusted = sunsetHours < 10 ? `0${sunsetHours}` : sunsetHours;
    const sunsetMinutes = sunsetObject.getMinutes() < 10 ? `0${sunsetObject.getMinutes()}` : sunsetObject.getMinutes();
    localSunrise.innerHTML = `<span class="title-info">Sunrise: </span>${sunriseHoursAdjusted}:${sunriseMinutes}`;
    localSunset.innerHTML = `<span class="title-info">Sunset: </span>${sunsetHoursAdjusted}:${sunsetMinutes}`;
}

function getIcon(id, where) {
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

function getAirQuality(data) {
    if (data.air_quality_data.results.length !== 0) {
        const airQuality = data.air_quality_data.results[0].measurements[0];
        const lastUpdated = airQuality.lastUpdated.split('T')[0];
        const lastUpdatedSplitted = lastUpdated.split('-');
        const lastUpdatedAdjusted = `${lastUpdatedSplitted[2]}/${lastUpdatedSplitted[1]}/${lastUpdatedSplitted[0]}`
        localAirQuality.innerHTML = `<span class="title-info">Air quality: </span>${getAirQualityParameter(airQuality.parameter)} is at ${airQuality.value.toFixed(1)} ${airQuality.unit}. Last updated in ${lastUpdatedAdjusted}.`;
    } else {
        localAirQuality.innerHTML = '<span class="title-info">No data about air quality.</span>';
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











function showMore() {
    showMoreButton.style.display = 'none';
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

function resetDOM() {
    weatherData.classList.remove('weather-data-display');
    searchInput.value = '';
    showMoreButton.style.display = 'block';
    moreWeatherData.style.display = 'none';
    notifyError.style.display = 'none';
    closeMoreInfo();
}