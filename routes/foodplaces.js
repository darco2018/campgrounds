const express = require('express');
const router = express.Router();
const middleware = require('../middleware'); //index.js is imported by default from middleware folder
const foodplace = require('../models/foodplace');
const Foodplace = foodplace.foodplaceModel;
const NodeGeocoder = require('node-geocoder');
//--------------------- custom deps ------------------

utils = require('../public/javascripts/utilities/utils');

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

function handleError(req, res, error, message, page) {
  console.log(error);
  req.flash('error', message ? message : '');
  res.redirect(page);
}

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
  var locationData = await geocode(location);
  var foodplace = assembleFoodplace(locationData, req);
  persistFoodplace(foodplace, req, res);
});

/* 
router.post('/', middleware.isLoggedIn, (req, res) => {
  var location = req.body.address + cityCountry;

  geocoder.geocode(location, function(err, data) {
    console.log(data);
    // handle invalid address error
    if (err || !data.length) {
      req.flash('error', 'Invalid address: ' + location);
      return res.redirect('back');
    } else {
      // clean up request data( street name, image)
      const cleanedAddress = utils.processStreetName(req.body.address);
      const nonEmptyimage = !req.body.image ? defaultImageUrl : req.body.image;
      // create foodplace
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

      // persist foodplace
      Foodplace.create(foodplace, (err, savedFoodplace) => {
        // handle error while creating
        if (err) {
          console.log(`Error  creating foodplace: ${err}`);
          req.flash('error', 'Somethng went wrong...');
          req.redirect('back');
        }
        // rredirect
        req.flash('success', 'Successfully added foodplace...');
        res.redirect('/foodplaces/' + savedFoodplace.id);
      });
    }
  });
});
 */

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
  var location = req.body.address + cityCountry;
  var locationData = await geocode(location);
  var foodplace = assembleFoodplace(locationData, req);
  updateFoodplace(foodplace, req, res);
});

/* 
// UPDATE
// foodplaces/234/update ?_method=PUT in url  (method-override)
router.put('/:id/update', middleware.checkFoodplaceExists, (req, res) => {
 
  var location = req.body.address + cityCountry;

  geocoder.geocode(location, function(err, data) {
    console.log(data);
    if (err || !data.length) {
      req.flash('error', 'Invalid address: ' + location);
      return res.redirect('back');
    } else {
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

      // ------------------------------------------------
      Foodplace.create(foodplace, (err, savedFoodplace) => {
        if (err) {
          console.log(`Error  creating foodplace: ${err}`);
          req.flash('error', 'Somethng went wrong...');
          req.redirect('back');
        } else {
          req.flash('success', 'Successfully added foodplace...');
          res.redirect('/foodplaces/' + savedFoodplace.id);
        }
      });
    }
  });
  
});
 */

async function geocode(location) {
  return geocoder.geocode(location, function(err, data) {
    console.log(data);
    if (err || !data.length) {
      req.flash('error', 'Invalid address: ' + location);
      return res.redirect('back');
    }
  });
  // returns Promise and data
}

function assembleFoodplace(data, req) {
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
    // handle error while creating
    if (err) {
      console.log(`Error  creating foodplace: ${err}`);
      req.flash('error', 'Somethng went wrong...');
      req.redirect('back');
    }
    // redirect
    req.flash('success', 'Successfully added foodplace...');
    res.redirect('/foodplaces/' + savedFoodplace.id);
  });
}

function updateFoodplace(foodplace, req, res) {
  Foodplace.findByIdAndUpdate(
    req.params.id,
    foodplace,
    (err, updatedFoodplace) => {
      if (err || !updatedFoodplace) {
        handleError(req, res, err, 'Something went wrong...', 'back');
      } else {
        req.flash('success', 'Successfully updated foodplace...');
        res.redirect(`/foodplaces/${updatedFoodplace.id}`);
      }
    }
  );
}

module.exports = router;
