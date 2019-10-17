const express = require('express');
const router = express.Router();
const middleware = require('../middleware'); //index.js is imported by default from middleware folder
const foodplace = require('../models/foodplace');
const Foodplace = foodplace.foodplaceModel;

//--------------------- custom deps ------------------

const utils = require('../public/javascripts/utilities/utils');
const geocoding = require('../services/geocoding');

// -------------------- VARS -----------------------

const defaultImageUrl = '/images/default-restaurant.jpg';
const cityCountry = ', Cracow, Poland';

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

function flashAndRedirect(req, res, flashStatus, flashMsg, url) {
  req.flash(flashStatus, flashMsg);
  res.redirect(url);
}

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
    formattedAddress: geodata.formattedAddress,
    image: nonEmptyimage,
    description: req.body.description,
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

function handleError(req, res, error, message, page) {
  req.flash('error', message ? message + error.message : '');
  res.redirect(page);
  return;
}

module.exports = router;
