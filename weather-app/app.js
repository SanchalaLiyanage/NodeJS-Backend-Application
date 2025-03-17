require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const nodemailer = require('nodemailer');
const cron = require('node-cron');
const { OpenAI } = require('openai');
const { Client } = require('@googlemaps/google-maps-services-js');

const app = express();
app.use(express.json());

// MongoDB connection
mongoose.connect(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// User Schema
const userSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  location: { type: { lat: Number, lon: Number }, required: true },
  weatherData: [{ date: Date, temperature: Number, description: String }]
});
const User = mongoose.model('User', userSchema);

// OpenWeatherMap API
const getWeatherData = async (lat, lon) => {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=aecaae1e90b8b86048d404c7b264f7f7&units=metric`;
  const response = await axios.get(url);
  return {
    temperature: response.data.main.temp,
    description: response.data.weather[0].description
  };
};

// OpenAI for weather description
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

// Google Maps Geocoding API
const googleMapsClient = new Client({});
const getCityName = async (lat, lon) => {
  const response = await googleMapsClient.reverseGeocode({
    params: {
      latlng: `${lat},${lon}`,
      key: process.env.GOOGLE_MAPS_API_KEY
    }
  });
  return response.data.results[0].formatted_address;
};

// Nodemailer setup
const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS
  }
});

// Send weather report email
const sendWeatherReport = async (user) => {
  const weatherData = await getWeatherData(user.location.lat, user.location.lon);
  const cityName = await getCityName(user.location.lat, user.location.lon);
  const weatherDescription = await generateWeatherDescription(weatherData);

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: user.email,
    subject: `Weather Report for ${cityName}`,
    text: `Temperature: ${weatherData.temperature}°C\nCondition: ${weatherData.description}\n\n${weatherDescription}`
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) console.error('Error sending email:', err);
    else console.log('Email sent:', info.response);
  });
};

// Cron job to send weather reports every 3 hours
cron.schedule('0 */3 * * *', async () => {
  const users = await User.find();
  users.forEach(user => sendWeatherReport(user));
});

// Routes
app.post('/users', async (req, res) => {
  const { email, lat, lon } = req.body;
  const user = new User({ email, location: { lat, lon } });
  await user.save();
  res.status(201).json(user);
});

app.put('/users/:email', async (req, res) => {
  const { email } = req.params;
  const { lat, lon } = req.body;
  const user = await User.findOneAndUpdate({ email }, { location: { lat, lon } }, { new: true });
  res.json(user);
});

app.get('/weather/:email/:date', async (req, res) => {
  const { email, date } = req.params;
  const user = await User.findOne({ email });
  const weatherData = user.weatherData.filter(data => data.date.toISOString().split('T')[0] === date);
  res.json(weatherData);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
