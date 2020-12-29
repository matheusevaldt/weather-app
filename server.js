if (process.env.NODE_ENV !== 'production') require('dotenv').config();

const OPENWEATHERMAP_API_KEY = process.env.OPENWEATHERMAP_API_KEY;
const express = require('express');
const fetch = require('node-fetch');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static('public'));

app.post('/weather', async (request, response) => {
    try {
        const url_openWeatherMap = `https://api.openweathermap.org/data/2.5/onecall?lat=${request.body.latitude}&lon=${request.body.longitude}&exclude=hourly,minutely&appid=${OPENWEATHERMAP_API_KEY}&units=metric`;
        const url_openAirQuality = `https://api.openaq.org/v1/latest?coordinates=${request.body.latitude},${request.body.longitude}`;
        const openWeatherMapResponse = await fetch(url_openWeatherMap);
        const openAirQualityResponse = await fetch(url_openAirQuality);
        if (!openWeatherMapResponse.ok || !openAirQualityResponse.ok) throw new Error('Unable to fetch the data from the APIs');
        const openWeatherMapJSON = await openWeatherMapResponse.json();
        const openAirQualityJSON = await openAirQualityResponse.json();
        const data = {
            weather_data: openWeatherMapJSON,
            air_quality_data: openAirQualityJSON
        }
        response.json(data);
    } catch (err) {
        response.json(['Error', err.message]);
        console.log(err.message);
    }
});

app.listen(port, () => console.log('Server updated.'));