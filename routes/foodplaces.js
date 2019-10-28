const express = require('express');
const router = express.Router();
const middleware = require('../middleware'); //index.js is imported by default from middleware folder
const foodplace = require('../controllers/foodplace.controller');

router.get('/', foodplace.getFoodplaces);

router.get('/new', middleware.isLoggedIn, foodplace.getNewFoodplace);

router.post('/', middleware.isLoggedIn, foodplace.postFoodplace);

// /map must be above /:id
router.get('/map', foodplace.showFoodplacesOnMap);

router.get('/:id', foodplace.showFoodplace);

router.get(
  '/:id/edit',
  middleware.checkFoodplaceExists,
  foodplace.editFoodplace
);

router.put(
  '/:id/update',
  middleware.checkFoodplaceExists,
  foodplace.putFoodplace
);

router.delete(
  '/:id',
  middleware.checkFoodplaceExists,
  foodplace.deleteFoodplace
);

module.exports = router;
