const express = require('express');
const router = express.Router();
const middleware = require('../middleware'); //index.js is imported by default from middleware folder
const Foodplace = require('../models/foodplace');
const Dish = require('../models/dish');

//---------- debug
const debug = require('debug');
debugWarn = debug('warn');
debugError = debug('error');

//--------------------- custom deps ------------------

const utils = require('../public/javascripts/utilities/utils');
const geocoding = require('../services/geocoding');
const cloudinary = require('../services/cloudinary'); // cloud image service
const { flashAndRedirect } = require('../utils/index');

// -------------------- VARS -----------------------

const defaultImageUrl = '/images/default-restaurant.jpg';
const cityCountry = ', Cracow, Poland';
const allowedFoodplaceDescLength = 2000;
const allowedDishNameLength = 49;
const allowedIntroDescriptionLength = 66;

/* ------------------------- ROUTE HANDLERS ------------------------------- */

const getFoodplaces = async (req, res) => {
  debug('>>>>>>>>> Just debug'); // shows when : node inspect  ./bin/www
  debugWarn('>>>>>>>>>> warning in debug');
  debugError('>>>>>>>>>> error in debug');

  try {
    // no callback so query is reteurned. no execution yet
    let query = Foodplace.find();
    // fileds of intereset: query.select('name  address');
    // query.limit(5);
    query.sort({ dishesCount: 'descending' });
    const foodplaces = await query.exec(); // query executed
    if (foodplaces == null) {
      foodplaces = [];
    }

    res.render('foodplace/index', {
      foodplaces: foodplaces,
      page: 'foodplaces'
    });
  } catch (err) {
    return flashAndRedirect(
      req,
      res,
      'error',
      `Error: cannot load the food places (${err.message})`,
      `back`
    );
  }
};

const getNewFoodplace = (req, res) => {
  res.render('foodplace/new');
};

const postFoodplace = async (req, res) => {
  //   if (!req.user) throw new Error('You have to be logged in to do that!');

  try {
    let result = await cloudinary.v2.uploader.upload(req.file.path);
    req.body.image = result.secure_url;
    req.body.imageId = result.public_id;
  } catch (err) {
    return flashAndRedirect(
      req,
      res,
      'error',
      `Error uploading the file. Reason: ${err.message}`,
      'back'
    );
  }

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
};

const showFoodplacesOnMap = (req, res) => {
  Foodplace.find()
    .then(foundFoodplaces => {
      if (foundFoodplaces == null) {
        foundFoodplaces = [];
      }
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
};

const showFoodplace = (req, res) => {
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
};

const editFoodplace = (req, res) => {
  res.render('foodplace/edit', { foodplace: res.locals.foodplace });
};

const showDishes = async (req, res) => {
  try {
    const foodplaceId = req.params.id;
    let foodplaces = [await Foodplace.findById(foodplaceId)];
    let dishes = await Dish.find({ foodplace: foodplaceId })
      .populate('comments')
      .exec();
    dishes = await addLatestCommentTo(dishes);
    if (dishes == null) {
      dishes = [];
    }

    res.render('foodplace/dishes', {
      foodplaces: foodplaces,
      dishes: dishes,
      allowedIntroLength: allowedIntroDescriptionLength,
      allowedDishNameLength
    });
  } catch (err) {
    return flashAndRedirect(
      req,
      res,
      'error',
      `Error showing the dishes. Reason: (${err.message})`,
      'back'
    );
  }
};

const putFoodplace = async (req, res) => {
  if (req.params.id && req.body.address) {
    var id = req.params.id;
    var address = req.body.address + cityCountry;
  } else {
    throw new Error('Invalid id and/or address in the request');
  }

  // handle image upload
  try {
    let oldFoodplace = await Foodplace.findById(req.params.id);
    if (req.file) {
      // if new img filepath, delete file from cloudinary
      await cloudinary.v2.uploader.destroy(oldFoodplace.imageId);
      let result = await cloudinary.v2.uploader.upload(req.file.path);
      req.body.image = result.secure_url;
      req.body.imageId = result.public_id;
    } else {
      // preserve old image
      req.body.image = oldFoodplace.image;
      req.body.imageId = oldFoodplace.imageId;
    }
  } catch (error) {
    return flashAndRedirect(
      req,
      res,
      'error',
      `Error uploading the file. Reason: ${err.message}`,
      'back'
    );
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
};

const deleteFoodplace = async (req, res) => {
  try {
    let foodplace = await Foodplace.findById(req.params.id);

    // remove img from cloudinary. (pre-loaded foodplacees dont have imageId property)
    if (foodplace.imageId) {
      await cloudinary.v2.uploader.destroy(foodplace.imageId);
    }

    foodplace.remove();
    return flashAndRedirect(
      req,
      res,
      'success',
      'Successfully deleted the food place...',
      `/foodplaces/`
    );
  } catch (err) {
    return flashAndRedirect(
      req,
      res,
      'error',
      `Error deleting the food place (${err.message})`,
      `back`
    );
  }
};

/* ------------------------- HELPERS ------------------------------- */

function extractRelevantGeoData(geodata) {
  const coords = geocoding.getCoordinates(geodata);
  const geoAddress = geocoding.getValueFor(geodata, 'formattedAddress');

  const extracted = {
    latitude: coords.latitude,
    longitude: coords.longitude,
    geoAddress: geoAddress
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
    fullAddress: geodata.geoAddress, // // provided by geocoder
    image: nonEmptyimage,
    imageId: req.body.imageId,
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

function addLatestCommentTo(dishes) {
  dishes.forEach(dish => {
    let latestComment = dish.comments[dish.comments.length - 1];
    dish.latestCommentAt = latestComment ? latestComment.createdAt : '';
  });
  return dishes;
}

module.exports = {
  getFoodplaces,
  getNewFoodplace,
  postFoodplace,
  showFoodplacesOnMap,
  showFoodplace,
  editFoodplace,
  showDishes,
  putFoodplace,
  deleteFoodplace
};
