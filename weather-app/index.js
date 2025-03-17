const express = require('express');
const connectDB = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const cron = require('node-cron');
const User = require('./models/userModel');
const { getWeatherData } = require('./services/weatherService');
const { getCityName } = require('./services/googleMapsService');
const { generateWeatherDescription } = require('./services/openAIService');
const transporter = require('./config/mailer');

require('dotenv').config();

const app = express();
app.use(express.json());

// Connect to MongoDB
connectDB();

// Routes
app.use('/api', userRoutes);

// Cron job to send weather reports every 3 hours
cron.schedule('0 */3 * * *', async () => {
  const users = await User.find();
  users.forEach(async (user) => {
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
  });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));