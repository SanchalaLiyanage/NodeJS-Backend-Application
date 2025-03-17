const { OpenAI } = require('openai');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const generateWeatherDescription = async (weatherData) => {
  const prompt = `Describe the weather in a creative way. Temperature: ${weatherData.temperature}°C, Condition: ${weatherData.description}.`;
  const response = await openai.completions.create({
    model: 'text-davinci-003',
    prompt,
    max_tokens: 50
  });
  return response.choices[0].text.trim();
};

module.exports = { generateWeatherDescription };