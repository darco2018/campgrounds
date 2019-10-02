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
router.post('/', isLoggedIn, (req, res) => {
  console.log('Receiving form data by POST');

  const author = {
    id: req.user.id,
    username: req.user.username
  };
  const newCampground = {
    name: req.body.name,
    image: req.body.image,
    description: req.body.desc,
    author: author
  };

  console.log(req.user);

  Campground.create(newCampground, (err, savedCamp) => {
    if (err) {
      return console.log(err);
    }

    console.log(`Campground: ${savedCamp} has been saved`);
    res.redirect('/campgrounds');
  });
});

// NEW - show form to create new campground
// /campgrounds/new
router.get('/new', isLoggedIn, (req, res) => {
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

/* ---------- LOGGEDIN middleware ------------*/
// move it to auth
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/auth/login');
}

module.exports = router;
