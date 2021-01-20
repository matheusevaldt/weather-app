if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;
const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

// Fetching weather data from the Open Weather Map API using the location's latitude and longitude.
app.post('/weather', async (request, response) => {
    try {
        const openWeatherMapURL = `https://api.openweathermap.org/data/2.5/onecall?lat=${request.body.latitude}&lon=${request.body.longitude}&exclude=hourly,minutely&appid=${OPENWEATHERMAP_API_KEY}&units=metric`;
        const openWeatherMapResponse = await fetch(openWeatherMapURL);
        if (!openWeatherMapResponse.ok) throw new Error('Unable to fetch the data from the OpenWeatherMap API');
        const openWeatherMapJSON = await openWeatherMapResponse.json();
        const openWeatherMapData = { 
            weather_data: openWeatherMapJSON 
        };
        response.json(openWeatherMapData);
    } catch (err) {
        response.json(['Error', err.message]);
        console.log(err);
    }
});

// Fetching air quality data from the Open Air Quality API using the location's latitude and longitude.
app.post('/air-quality', async (request, response) => {
    try {
        const openAirQualityURL = `https://api.openaq.org/v1/latest?coordinates=${request.body.latitude},${request.body.longitude}`;
        const openAirQualityResponse = await fetch(openAirQualityURL);
        if (!openAirQualityResponse.ok) throw new Error('Unable to fetch the data from the OpenAirQuality API');
        const openAirQualityJSON = await openAirQualityResponse.json();
        const openAirQualityData = {
            air_quality_data: openAirQualityJSON
        }
        response.json(openAirQualityData);
    } catch (err) {
        response.json(['Error', err.message]);
        console.log(err);
    }
});

app.listen(port, () => console.log('Server updated.'));