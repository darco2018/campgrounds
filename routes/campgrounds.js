/* eslint-disable consistent-return */
/* eslint-disable no-use-before-define */
const express = require('express');
const mongoose = require('mongoose');
const Campground = require('../models/campground');
const middleware = require('../middleware'); //index.js is imported by default from middleware folder

const router = express.Router();

/* redirect */

function handleError(req, res, error, message, page) {
  console.log(error);
  req.flash('error', message ? message : '');
  res.redirect(page);
}

/* ------------------------- ROUTES ------------------------------- */

// /campgrounds
// INDEX - show all campgrounds
router.get('/', (req, res) => {
  Campground.find({}, (err, allCampgrounds) => {
    if (err) {
      handleError(req, res, err, 'Something went wrong...', 'back');
    } else {
      res.render('campground/index', {
        campgrounds: allCampgrounds,
        page: 'campgrounds'
      });
    }
  });
});

// NEW - show form to create new campground
// /campgrounds/new
router.get('/new', middleware.isLoggedIn, (req, res) => {
  res.render('campground/new');
});

// CREATE - add new campground
// /campgrounds
router.post('/', middleware.isLoggedIn, (req, res) => {
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

  Campground.create(newCampground, (err, savedCamp) => {
    if (err) {
      handleError(req, res, err, 'Something went wrong...', 'back');
    } else {
      res.redirect('/campgrounds');
    }
  });
});

// SHOW - show details about campground
// campgrounds/234
// must be below /new
router.get('/:id', (req, res) => {
  // OK
  Campground.findById(req.params.id)
    .populate('comments') // populate the comments array in a campground !!!
    .exec((err, foundCampground) => {
      if (err || !foundCampground) {
        handleError(req, res, err, 'Campground not found', '/campgrounds');
      }
      res.render('campground/show', { campground: foundCampground });
    });
});

// EDIT - show edit form
// campgrounds/234/edit
router.get('/:id/edit', middleware.checkCampgroundOwnership, (req, res) => {
  Campground.findById(req.params.id, (err, foundCampground) => {
    if (err || !foundCampground) {
      handleError(req, res, err, 'Campground not found', '/campgrounds');
    }
    res.render('campground/edit', { campground: foundCampground });
  });
});

// UPDATE
// campgrounds/234/update
// add ?_method=PUT in url  (method-override)
router.put('/:id/update', middleware.checkCampgroundOwnership, (req, res) => {
  // checkCampgroundOwnership does checkCampgroundExists first

  Campground.findByIdAndUpdate(
    req.params.id,
    req.body.campground, // thanks to campground[name]/[url]/[description] in view
    (err, updatedCampground) => {
      if (err || !updatedCampground) {
        handleError(req, res, err, 'Something went wrong...', '/campgrounds');
      } else {
        res.redirect(`/campgrounds/${updatedCampground.id}`);
      }
    }
  );
});

// DESTROY - delete campground
// campgrounds/:id
// needs a FORM with post + method_override
router.delete(
  '/:id',
  middleware.checkCampgroundOwnership, // does checkCampgroundExists
  (req, res) => {
    Campground.findByIdAndDelete(req.params.id, err => {
      if (err) {
        handleError(req, res, err, 'Something went wrong...', 'back');
      } else {
        res.redirect('/campgrounds/');
      }
    });
  }
);

module.exports = router;
