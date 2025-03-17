const { Client } = require('@googlemaps/google-maps-services-js');
require('dotenv').config();

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

module.exports = { getCityName };