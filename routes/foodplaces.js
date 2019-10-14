const express = require('express');
const router = express.Router();
const middleware = require('../middleware'); //index.js is imported by default from middleware folder
const foodplace = require('../models/foodplace');
const Foodplace = foodplace.foodplaceModel;
const NodeGeocoder = require('node-geocoder');

const defaultImageUrl = '/images/default-restaurant.jpg';
const cityCountry = ', Cracow, Poland';

function preventNullImage(image) {
  return !image ? defaultImageUrl : image;
}

function cleanAddress(address) {
  return address
    .replace('ulica', '')
    .replace('ul', '')
    .replace('ul.', '');
}

const geocoder = NodeGeocoder({
  provider: 'here',
  httpAdapter: 'https',
  apiKey: process.env.GOOGLE_MAPS_APIKEY,
  appId: process.env.APP_ID,
  appCode: process.env.APP_CODE,
  formatter: null
  // Set options.production to true (default false) to use HERE's production server environment.
});

/* redirect */

function handleError(req, res, error, message, page) {
  console.log(error);
  req.flash('error', message ? message : '');
  res.redirect(page);
}

/* ------------------------- ROUTES ------------------------------- */

// INDEX - show all foodplaces
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

// NEW - show form to create new dish
// /foodplace/new
router.get('/new', middleware.isLoggedIn, (req, res) => {
  res.render('foodplace/new');
});

// CREATE - add new foodplace
// /foodplaces
router.post('/', middleware.isLoggedIn, (req, res) => {
  /* geocoder.geocode(
    { address: req.body.address, country: 'Poland' },
    (err, res) => {
      console.log(res);
    }
  ); */

  // ------------------------------------------------
  var location = req.body.address + cityCountry;

  geocoder.geocode(location, function(err, data) {
    console.log(data);
    if (err || !data.length) {
      req.flash('error', 'Invalid address: ' + location);
      return res.redirect('back');
    } else {
      const cleanedAddress = cleanAddress(req.body.address);
      const nonEmptyimage = preventNullImage(req.body.image);
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
        }

        /* savedFoodplace.author.id = req.user.id;
      savedFoodplace.author.username = req.user.username;
      savedFoodplace.save(); */

        /*  const foundDish = res.locals.foundDish;
        foundDish.comments.push(savedComment);
        foundDish.save(); */
        req.flash('success', 'Successfully added foodplace...');
        res.redirect('/foodplaces/' + savedFoodplace.id);
      });
    }
  });
});

// SHOW - show details about dish
// foodplaces/234
// must be below /new
router.get('/:id', (req, res) => {
  Foodplace.findById(req.params.id).exec((err, foundFoodplace) => {
    if (err || !foundFoodplace) {
      handleError(req, res, err, 'Foodplace not found', '/foodplaces');
    } else {
      // preventNullImage(foundFoodplace);
      res.render('foodplace/show', {
        foodplace: foundFoodplace
      });
    }
  });
});

// EDIT - show edit form
// foodplaces/234/edit
router.get('/:id/edit', middleware.checkFoodplaceExists, (req, res) => {
  res.render('foodplace/edit', { foodplace: res.locals.foodplace });
});

// UPDATE
// foodplaces/234/update
// add ?_method=PUT in url  (method-override)
router.put('/:id/update', middleware.checkFoodplaceExists, (req, res) => {
  var location = req.body.address + cityCountry;

  geocoder.geocode(location, function(err, data) {
    console.log(data);
    if (err || !data.length) {
      req.flash('error', 'Invalid address: ' + location);
      return res.redirect('back');
    } else {
      const cleanedAddress = cleanAddress(req.body.address);
      const nonEmptyimage = preventNullImage(req.body.image);
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

module.exports = router;
