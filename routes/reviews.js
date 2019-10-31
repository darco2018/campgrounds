var express = require('express');
var router = express.Router({ mergeParams: true });
var Dish = require('../models/dish');
var Review = require('../models/review');
var middleware = require('../middleware');

// Reviews Index
router.get('/', function(req, res) {
  res.render("review/index");
  /* Dish.findById(req.params.id).populate({
        path: "reviews",
        options: {sort: {createdAt: -1}} // sorting the populated reviews array to show the latest first
    }).exec(function (err, dish) {
        if (err || !dish) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        res.render("review/index", {dish: dish});
    }); */
});

module.exports = router;
