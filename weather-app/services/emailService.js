const transporter = require('../config/mailer');
const getWeatherData = require('./weatherService');
const getCityName = require('./googleMapsService');
const generateWeatherDescription = require('./openAIService');

const sendWeatherReport = async (user) => {
  const weatherData = await getWeatherData(user.location.lat, user.location.lon);
  const cityName = await getCityName(user.location.lat, user.location.lon);
  const weatherDescription = await generateWeatherDescription(weatherData);

  const mailOptions = {
    from: process.env.GMAIL_USER,
    to: user.email,
    subject: `Weather Report for ${cityName}`,
    text: `Temperature: ${weatherData.temperature}°C\nCondition: ${weatherData.description}\n\n${weatherDescription}`,
  };

  transporter.sendMail(mailOptions, (err, info) => {
    if (err) console.error('Error sending email:', err);
    else console.log('Email sent:', info.response);
  });
};

module.exports = sendWeatherReport;
