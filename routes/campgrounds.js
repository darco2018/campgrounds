/* eslint-disable consistent-return */
/* eslint-disable no-use-before-define */
const express = require('express');
const mongoose = require('mongoose');
const Campground = require('../models/campground');
const middleware = require('../middleware'); //index.js is imported by default from middleware folder

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
router.post('/', middleware.isLoggedIn, (req, res) => {
  console.log('Receiving form data by POST');

  const author = {
    id: req.user.id,
    username: req.user.username
  };
  const newCampground = {
    name: req.body.name,
    price: req.body.price,
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
router.get('/new', middleware.isLoggedIn, (req, res) => {
  res.render('campground/new');
});

// SHOW - show details about campground
// campgrounds/234
// must be below /new
router.get('/:id', (req, res) => {
  Campground.findById(req.params.id)
    .populate('comments') // populate the comments array in a campground !!!
    .exec((err, foundCampground) => {
      if (err || !foundCampground) {
        // !null -> true
        console.log(err);
        req.flash('error', 'Campground not found');
        res.redirect('/campgrounds'); // breaks for 'back'
      }
      res.render('campground/show', { campground: foundCampground });
    });
});

// EDIT - show edit form
// campgrounds/234/edit
router.get('/:id/edit', middleware.checkCampgroundOwnership, (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    if (err) {
      console.log(err);
    }
    res.render('campground/edit', { campground: foundCampground });
  });
});

// UPDATE
// campgrounds/234/update
// add ?_method=PUT in url  (method-override)
router.put('/:id/update', middleware.checkCampgroundOwnership, (req, res) => {
  // PUT uses this part of query string: _method=PUT

  const campgroundId = req.params.id;

  Campground.findByIdAndUpdate(
    campgroundId,
    req.body.campground, // thanks to campground[name]/[url]/[description] in view
    (err, updatedCampground) => {
      if (err || !updatedCampground) {
        // !null -> true
        console.log(
          `Error when retrieving campground ${updatedCampground}; ${err}`
        );
        req.flash('error', 'Campground not found');
        res.redirect('/campgrounds'); // breaks for 'back'
      } else {
        res.redirect(`/campgrounds/${campgroundId}`);
      }
    }
  );
});

// DESTROY - delete campground
// campgrounds/:id
// needs a FORM with post + method_override
router.delete('/:id', middleware.checkCampgroundOwnership, (req, res) => {
  console.log('--------deleting-------------');

  Campground.findByIdAndDelete(req.params.id, err => {
    if (err) {
      console.log(err);
      res.redirect('/campgrounds/');
    }
    console.log('Deleted campground with id ' + req.params.id);
    res.redirect('/campgrounds/');
  });
});

module.exports = router;
