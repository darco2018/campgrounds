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
router.put('/:id/update', middleware.checkFoodplaceExists, async (req, res) => {
  try {
    //req.body = null;
    var location = req.body.address + cityCountry;
    var locationData = await geocode(location, req, res); //  goes to handler, redirect in handler doesnt work
    if (!locationData.length || !locationData[0].streetName) {
      throw new Error('THROWN HERE: Invalid address...');
      //handleError(req, res, null, 'Invalid address...', 'back');
    } else {
      var foodplace = assembleFoodplace(locationData, req); // returns here to complete assembling & updating
      updateFoodplace(foodplace, req, res);
    }
  } catch (err) {
    handleError(req, res, err, 'CATCH: Somenthing went wrong...', 'back');
  }
});

/* ------------------------- HELPERS ------------------------------- */

async function geocode(location, req, res) {
  // returns Promise and data
  return geocoder.geocode(location, function(err, locationData) {
    if (err) {
      handleError(req, res, err, 'Something went wrong...', 'back');
    }
  });
}

function assembleFoodplace(data, req) {
  console.log('--------------- entering assemble ------------------');

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
    lat: data[0].latitude, // provided by geocoder
    lng: data[0].longitude, // provided by geocoder
    image: nonEmptyimage,
    description: req.body.description,
    author: author
  };

  return foodplace;
}

function persistFoodplace(foodplace, req, res) {
  Foodplace.create(foodplace, (err, savedFoodplace) => {
    if (err || !savedFoodplace) {
      handleError(req, res, err, 'Something went wrong...', 'back');
    } else {
      req.flash('success', 'Successfully added foodplace...');
      res.redirect('/foodplaces/' + savedFoodplace.id);
    }
  });
}

function updateFoodplace(foodplace, req, res) {
  console.log(
    '--------------------------- UPDATING ------------------------------'
  );

  Foodplace.findByIdAndUpdate(
    req.params.id,
    foodplace,
    (err, updatedFoodplace) => {
      if (err || !updatedFoodplace) {
        handleError(req, res, err, 'Something went wrong...', 'back');
      } else {
        req.flash('success', 'Successfully updated foodplace...');
        res.redirect(`/foodplaces/${updatedFoodplace.id}`); // gets here & throws
      }
    }
  );
}

function handleError(req, res, error, message, page) {
  console.log('------------------------ ERROR HANDLER: ' + error.message);
  req.flash('error', message ? message + error.message : '');
  res.redirect(page);
  return;
}

module.exports = router;
