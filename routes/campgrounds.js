/* eslint-disable consistent-return */
/* eslint-disable no-use-before-define */
const express = require('express');
const mongoose = require('mongoose');
const Campground = require('../models/campground');

const router = express.Router();

/* ------------------------- ROUTES ------------------------------- */

// /campgrounds
// INDEX - show all campgrounds
router.get('/', (req, res) => {
  Campground.find({}, (err, allCampgrounds) => {
    if (err) {
      console.log(`Error when finding campground ${err}`);
    } else {
      res.render('campground/index', { campgrounds: allCampgrounds });
    }
  });
});

// CREATE - add new campground
// /campgrounds
router.post('/', (req, res) => {
  console.log('Receiving form data by POST');

  const newCampground = {
    name: req.body.name,
    image: req.body.image,
    description: req.body.desc
  };

  Campground.create(newCampground, (err, savedCamp) => {
    if (err) {
      return console.log(err);
    }
    console.log(`${savedCamp} has been saved`);
    res.redirect('/campgrounds');
  });
});

// NEW - show form to create new campground
// /campgrounds/new
router.get('/new', (req, res) => {
  res.render('campground/new');
});

// SHOW - show details about campground
// campgrounds/234
// must be below /new
router.get('/:id', (req, res) => {
  Campground.findById(req.params.id)
    .populate('comments') // populate the comments array in a campground !!!
    .exec((err, foundCamp) => {
      if (err) {
        console.log(err);
      }
      res.render('campground/show', { camp: foundCamp });
    });
});

module.exports = router;
