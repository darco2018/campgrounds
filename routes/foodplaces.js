const express = require('express');
const router = express.Router();
const middleware = require('../middleware'); //index.js is imported by default from middleware folder
const foodplace = require('../models/foodplace');
const Foodplace = foodplace.foodplaceModel;
//---------- debug
const debug = require('debug');
debugWarn = debug('warn');
debugError = debug('error');

//--------------------- custom deps ------------------

const utils = require('../public/javascripts/utilities/utils');
const geocoding = require('../services/geocoding');
const { flashAndRedirect } = require('../utils/index');

// -------------------- VARS -----------------------

const defaultImageUrl = '/images/default-restaurant.jpg';
const cityCountry = ', Cracow, Poland';
const allowedFoodplaceDescLength = 2000;

/* ------------------------- ROUTES ------------------------------- */

// INDEX - shows all
// /foodplaces
router.get('/', (req, res) => {
  debug('>>>>>>>>> Just debug'); // shows when : node inspect  ./bin/www
  debugWarn('>>>>>>>>>> warning in debug');
  debugError('>>>>>>>>>> error in debug');

  Foodplace.find()
    .then(foundFoodplaces => {
      res.render('foodplace/index', {
        foodplaces: foundFoodplaces,
        page: 'foodplaces'
      });
    })
    .catch(err => {
      return flashAndRedirect(
        req,
        res,
        'error',
        `Error: cannot load the food places (${err.message})`,
        `back`
      );
    });
});

// NEW - shows add form
// /foodplace/new
router.get('/new', middleware.isLoggedIn, (req, res) => {
  res.render('foodplace/new');
});

// CREATE - persists new
// /foodplaces
router.post('/', middleware.isLoggedIn, (req, res) => {
  //   if (!req.user) throw new Error('You have to be logged in to do that!');

  if (req.body.address) {
    var address = req.body.address + cityCountry;
  } else {
    throw new Error('Error: no address field in the request body');
  }

  geocoding
    .getGeocodingDataFor(address)
    .then(geodata => extractRelevantGeoData(geodata))
    .then(extracted => assembleFoodplace(extracted, req))
    .then(foodplace => createFoodplacePromise(foodplace, req, res)) // must return promise
    .then(savedFoodplace => {
      return flashAndRedirect(
        req,
        res,
        'success',
        'Successfully created a new foodplace...',
        `/foodplaces/${savedFoodplace.id}`
      );
    })
    .catch(err => {
      return flashAndRedirect(req, res, 'error', err.message, `back`);
    });
});

// must be above /:id
// MAP INDEX - shows all on the map
// /foodplaces/map
router.get('/map', (req, res) => {
  Foodplace.find()
    .then(foundFoodplaces => {
      res.render('foodplace/map', {
        foodplaces: foundFoodplaces,
        page: 'map'
      });
    })
    .catch(err => {
      return flashAndRedirect(
        req,
        res,
        'error',
        `Error: cannot load the food places (${err.message})`,
        `back`
      );
    });
});

// must be below /new
// SHOW - shows one
// foodplaces/234
router.get('/:id', (req, res) => {
  Foodplace.findById(req.params.id)
    .then(foundFoodplace => {
      res.render('foodplace/show', { foodplace: foundFoodplace });
    })
    .catch(err => {
      return flashAndRedirect(
        req,
        res,
        'error',
        `Foodplace not found (${err.message})`,
        '/foodplaces'
      );
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

  geocoding
    .getGeocodingDataFor(address)
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

// DESTROY - delete foodplace
// foodplaces/:id
// needs a FORM with post + method_override
router.delete('/:id', middleware.checkFoodplaceExists, (req, res) => {
  Foodplace.findByIdAndDelete(req.params.id)
    .then(() => {
      return flashAndRedirect(
        req,
        res,
        'success',
        'Successfully deleted the food place...',
        `/foodplaces/`
      );
    })
    .catch(err => {
      return flashAndRedirect(
        req,
        res,
        'error',
        `Error: cannot delete the food place (${err.message})`,
        `back`
      );
    });
});

/* ------------------------- HELPERS ------------------------------- */

function extractRelevantGeoData(geodata) {
  const coords = geocoding.getCoordinates(geodata);
  const formattedAddress = geocoding.getValueFor(geodata, 'formattedAddress');
  const extracted = {
    latitude: coords.latitude,
    longitude: coords.longitude,
    formattedAddress: formattedAddress
  };

  return extracted;
}

function assembleFoodplace(geodata, req) {
  if (!req || !geodata)
    throw new Error(
      'Cannot assemble a food place. Request and/or geodata is null.'
    );

  const cleanedAddress = utils.processStreetName(req.body.address);
  const nonEmptyimage = !req.body.image ? defaultImageUrl : req.body.image;

  let description = req.body.foodplace
    ? req.body.foodplace.description
    : req.body.description;
  description = description.substring(0, allowedFoodplaceDescLength);

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
    formattedAddress: geodata.formattedAddress,
    image: nonEmptyimage,
    description: description,
    author: author
  };

  return foodplace;
}

function createFoodplacePromise(foodplace) {
  return new Promise((resolve, reject) => {
    Foodplace.create(foodplace, (err, updatedFoodplace) => {
      if (err || !updatedFoodplace) {
        reject('Error: Cannot save the foodplace...');
      } else {
        resolve(updatedFoodplace);
      }
    });
  });
}

function findByIdAndUpdatePromise(id, foodplace) {
  return new Promise((resolve, reject) => {
    Foodplace.findByIdAndUpdate(id, foodplace, (err, updatedFoodplace) => {
      if (err || !updatedFoodplace) {
        reject('Error: Cannot update the foodplace...');
      } else {
        resolve(updatedFoodplace);
      }
    });
  });
}

module.exports = router;
