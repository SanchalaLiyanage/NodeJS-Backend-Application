const express = require('express');
const User = require('../models/userModel');
const { getWeatherData } = require('../services/weatherService');
const { getCityName } = require('../services/googleMapsService');
const { generateWeatherDescription } = require('../services/openAIService');
const transporter = require('../config/mailer');

const router = express.Router();

// Create a new user
router.post('/users', async (req, res) => {
  const { email, lat, lon } = req.body;
  const user = new User({ email, location: { lat, lon } });
  await user.save();
  res.status(201).json(user);
});

// Update user location
router.put('/users/:email', async (req, res) => {
  const { email } = req.params;
  const { lat, lon } = req.body;
  const user = await User.findOneAndUpdate({ email }, { location: { lat, lon } }, { new: true });
  res.json(user);
});

// Get weather data for a specific date
router.get('/weather/:email/:date', async (req, res) => {
  const { email, date } = req.params;
  const user = await User.findOne({ email });
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  const weatherData = user.weatherData.filter(data => data.date.toISOString().split('T')[0] === date);
  if (weatherData.length === 0) {
    return res.status(404).json({ message: 'No weather data found for the specified date' });
  }

  res.json(weatherData);
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

module.exports = router;