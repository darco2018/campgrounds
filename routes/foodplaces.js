const express = require('express');
const router = express.Router();
const middleware = require('../middleware'); //index.js is imported by default from middleware folder
const foodplace = require('../models/foodplace');
const Foodplace = foodplace.foodplaceModel;
const NodeGeocoder = require('node-geocoder');
//--------------------- custom deps ------------------

const utils = require('../public/javascripts/utilities/utils');

// -------------------- VARS -----------------------

const defaultImageUrl = '/images/default-restaurant.jpg';
const cityCountry = ', Cracow, Poland';

const geocoder = NodeGeocoder({
  provider: 'here',
  httpAdapter: 'https',
  apiKey: process.env.GOOGLE_MAPS_APIKEY,
  appId: process.env.APP_ID,
  appCode: process.env.APP_CODE,
  formatter: null
  // Set options.production to true (default false) to use HERE's production server environment.
});

/* ------------------------- ROUTES ------------------------------- */

// INDEX - shows all
// /foodplaces
router.get('/', (req, res) => {
  Foodplace.find({}, (err, foundFoodplaces) => {
    if (err) {
      handleError(req, res, err, 'Something went wrong...', 'back');
    } else {
      res.render('foodplace/index', {
        foodplaces: foundFoodplaces,
        page: 'foodplaces'
      });
    }
  });
});

// NEW - shows add form
// /foodplace/new
router.get('/new', middleware.isLoggedIn, (req, res) => {
  res.render('foodplace/new');
});

// CREATE - persists new
// /foodplaces
router.post('/', middleware.isLoggedIn, async (req, res) => {
  var location = req.body.address + cityCountry;
  var locationData = await geocode(location, req, res);
  var foodplace = await assembleFoodplace(locationData, req);
  persistFoodplace(foodplace, req, res);
});

// must be below /new
// SHOW - shows one
// foodplaces/234
router.get('/:id', (req, res) => {
  Foodplace.findById(req.params.id).exec((err, foundFoodplace) => {
    if (err || !foundFoodplace) {
      handleError(req, res, err, 'Foodplace not found', '/foodplaces');
    } else {
      res.render('foodplace/show', {
        foodplace: foundFoodplace
      });
    }
  });
});

// EDIT - shows edit form
// foodplaces/234/edit
router.get('/:id/edit', middleware.checkFoodplaceExists, (req, res) => {
  res.render('foodplace/edit', { foodplace: res.locals.foodplace });
});

// UPDATE - updates
// foodplaces/234/update ?_method=PUT in url  (method-override)
router.put('/:id/update', middleware.checkFoodplaceExists, (req, res) => {
  if (req.params.id && req.body.address) {
    var id = req.params.id;
    var address = req.body.address + cityCountry;
  } else {
    throw new Error('Invalid id and/or address in the request');
  }

  getFoodplaceGeocodingData(address)
    .then(geodata => extractRelevantGeoData(geodata))
    .then(extracted => assembleFoodplace(extracted, req))
    .then(foodplace => findByIdAndUpdatePromise(id, foodplace))
    .then(updatedFoodplace => {
      return flashAndRedirect(
        req,
        res,
        'success',
        'Successfully updated foodplace...',
        `/foodplaces/${updatedFoodplace.id}`
      );
    })
    .catch(err => {
      return flashAndRedirect(req, res, 'error', err.message, `back`);
    });
});

function flashAndRedirect(req, res, flashStatus, flashMsg, url) {
  req.flash(flashStatus, flashMsg);
  res.redirect(url);
}

/* ------------------------- HELPERS ------------------------------- */

function extractRelevantGeoData(geodata) {
  console.log('----------> extractRelevantGeoData');

  const latitude = geodata[0].latitude;
  const longitude = geodata[0].longitude;
  const formattedAddress = geodata[0].formattedAddress;
  const extracted = { latitude, longitude, formattedAddress };
  return extracted;
}

function assembleFoodplace(geodata, req) {
  console.log('----------> assembleFoodplace');
  console.log('----------> assembleFoodplace geodata: ' + geodata);
  console.dir(geodata);
  const cleanedAddress = utils.processStreetName(req.body.address);
  const nonEmptyimage = !req.body.image ? defaultImageUrl : req.body.image;
  const author = {
    id: req.user.id,
    username: req.user.username
  };

  var foodplace = {
    name: req.body.name,
    address: cleanedAddress,
    city: req.body.city,
    lat: geodata.latitude, // provided by geocoder
    lng: geodata.longitude, // provided by geocoder
    //formattedAddress: geodata.formattedAddress
    image: nonEmptyimage,
    description: req.body.description,
    author: author
  };

  return foodplace;
}

function persistFoodplace(foodplace, req, res) {
  console.log('----------> persistFoodplace');
  Foodplace.create(foodplace, (err, savedFoodplace) => {
    if (err || !savedFoodplace) {
      handleError(req, res, err, 'Something went wrong...', 'back');
    } else {
      req.flash('success', 'Successfully added foodplace...');
      res.redirect('/foodplaces/' + savedFoodplace.id);
    }
  });
}

function findByIdAndUpdatePromise(id, foodplace) {
  console.log('----------> findByIdAndUpdatePromise');

  return new Promise((resolve, reject) => {
    Foodplace.findByIdAndUpdate(id, foodplace, (err, updatedFoodplace) => {
      if (err || !updatedFoodplace) {
        reject('Something went wrong...');
      } else {
        resolve(updatedFoodplace);
      }
    });
  });
}

function handleError(req, res, error, message, page) {
  console.log('------------------------ ERROR HANDLER: ' + error.message);
  req.flash('error', message ? message + error.message : '');
  res.redirect(page);
  return;
}

function getFoodplaceGeocodingData(address) {
  const promise = geocoder
    .geocode(address) // these errors go to catch, skipping then's
    .then(geocodingData => {
      if (!geocodingData) {
        throw new Error('geocodingData is null or undefined');
      }
      if (!isValidSAddress(geocodingData)) {
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

function isValidSAddress(locationData) {
  if (!locationData) {
    return false;
  }
  return Boolean(locationData.length > 0 && locationData[0].streetName);
}

module.exports = router;
