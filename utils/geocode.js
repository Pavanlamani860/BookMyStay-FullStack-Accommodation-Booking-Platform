const axios = require("axios");

module.exports.geocodeLocation = async (location, country) => {
  const query = `${location}, ${country}`;

  const response = await axios.get(
    "https://nominatim.openstreetmap.org/search",
    {
      params: {
        q: query,
        format: "json",
        limit: 1,
      },
      headers: {
        // REQUIRED by Nominatim policy
        "User-Agent": "BookMyStay/1.0 (college project)",
      },
    },
  );

  if (!response.data || response.data.length === 0) {
    return null;
  }

  return {
    lat: parseFloat(response.data[0].lat),
    lng: parseFloat(response.data[0].lon),
  };
};
