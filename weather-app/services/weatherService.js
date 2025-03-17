const axios = require('axios');

const getWeatherData = async (lat, lon) => {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${process.env.OPENWEATHERMAP_API_KEY}&units=metric`;
  const response = await axios.get(url);
  return {
    temperature: response.data.main.temp,
    description: response.data.weather[0].description
  };
};

module.exports = { getWeatherData };