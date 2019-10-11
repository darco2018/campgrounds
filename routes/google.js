const express = require('express');
const router = express.Router();
const foodplace = require('../models/foodplace');

const Foodplace = foodplace.foodplaceModel;

router.get('/', (req, res) => {
  Foodplace.findOne({ name: /McDonald/i }, function(err, foundFoodPlace) {
    if (err) {
      console.log(err);
      res.redirect('back');
    } else {
      res.render('google', { foundFoodPlace, foundFoodPlace });
    }
  });
});

module.exports = router;
