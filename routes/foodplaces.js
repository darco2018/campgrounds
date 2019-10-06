const express = require('express');
const router = express.Router();
const foodplace = require('../models/foodplace');
const Foodplace = foodplace.foodplaceModel;

function handleError(req, res, error, message, page) {
  console.log(error);
  req.flash('error', message ? message : '');
  res.redirect(page);
}

// INDEX - show all restaurants
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

  //res.send('FOODPLACE ROUTE');
});

module.exports = router;
