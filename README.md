# Weather App API

This is a **Node.js backend application** that stores users' emails and locations, fetches weather data for their locations, and sends hourly weather reports every 3 hours. The application integrates with **OpenWeatherMap API** for weather data, **Google Maps API** for reverse geocoding, and **OpenAI API** for generating creative weather descriptions.

---

## Features

1. **User Management**:
   - Add a new user with email and location.
   - Update a user's location.
2. **Weather Data**:
   - Fetch weather data for a user's location using OpenWeatherMap API.
   - Store weather data in the database with date and time.
   - Retrieve weather data for a specific day.
3. **Weather Reports**:
   - Send weather reports to users every 3 hours via email.
   - Include creative weather descriptions generated using OpenAI.
4. **Geocoding**:
   - Use Google Maps API to get the city name from coordinates.
5. **Deployment**:
   - Deployable on platforms like **Vercel** or **AWS**.

---

## Technologies Used

- **Backend**: Node.js, Express
- **Database**: MongoDB (with Mongoose)
- **APIs**:
  - OpenWeatherMap API (for weather data)
  - Google Maps API (for reverse geocoding)
  - OpenAI API (for generating weather descriptions)
- **Email Service**: Nodemailer (with Gmail)
- **Cron Jobs**: Node-cron (for scheduling weather reports)
- **Deployment**: Vercel or AWS

---
