require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');
const userRoutes = require('./routes/userRoutes');
const cron = require('node-cron');
const User = require('./models/userModel');
const sendWeatherReport = require('./services/emailService');

const app = express();
app.use(express.json());

connectDB();

app.use('/api', userRoutes);

app.get('/', (req, res) => {
  res.send('API is working!');
});

// Cron job to send weather reports every 3 hours
cron.schedule('0 */3 * * *', async () => {
  const users = await User.find();
  users.forEach((user) => sendWeatherReport(user));
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
