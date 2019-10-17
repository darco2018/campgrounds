const NodeGeocoder = require('node-geocoder');
const geocoder = NodeGeocoder({
  provider: 'here',
  httpAdapter: 'https',
  apiKey: process.env.GOOGLE_MAPS_APIKEY,
  appId: process.env.APP_ID,
  appCode: process.env.APP_CODE,
  formatter: null
  // Set options.production to true (default false) to use HERE's production server environment.
});

function getGeocodingDataFor(address) {
  const promise = geocoder
    .geocode(address) // these errors go to catch, skipping then's
    .then(geocodingData => {
      if (!geocodingData) {
        throw new Error('GeocodingData is null or undefined');
      }

      if (!isValidAddressFor(geocodingData, 'streetName')) {
        throw new Error('Invalid address');
      }

      return geocodingData;
    })
    .catch(err => {
      if (err.message === 'Invalid address') {
        throw err;
      }

      throw new Error(
        `Geocoding error. 
          Cannot establish the location of the foodplace on the map. 
          (${err.message})`
      );
    });

  return promise;
}

function isValidAddressFor(locationData, geoProperty) {
  if (!locationData) {
    return false;
  }
  return Boolean(locationData.length > 0 && locationData[0][geoProperty]);
}

function getCoordinates(geodata) {
  const coords = {
    latitude: geodata[0].latitude,
    longitude: geodata[0].longitude
  };
  return coords;
}

function getValueFor(geodata, key) {
  const value = geodata[0][key];
  if (!value) {
    throw new Error("Can't find value for the key " + key);
  }
  return value;
}

// all methods are instrance methods called on object
module.exports = {
  getGeocodingDataFor: getGeocodingDataFor,
  getCoordinates: getCoordinates,
  getValueFor: getValueFor
};
