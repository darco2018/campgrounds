/* eslint-disable consistent-return */
/* eslint-disable no-use-before-define */
const express = require('express');
const mongoose = require('mongoose');
const Campground = require('../models/campground');
const comment = require('../models/comment');
const Comment = comment.commentModel;

const router = express.Router();

/* ---------- LOGGED in -------------*/
// move it to auth
function isLoggedIn(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  res.redirect('/auth/login');
}

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

// NEW - show form to create new comment
// /campgrounds/:id/comments/new
router.get('/:id/comments/new', isLoggedIn, (req, res) => {
  // find campground and send it back
  Campground.findById(req.params.id, (err, found) => {
    console.log('id: ' + req.params.id);
    console.log('found: ' + found);

    if (err) {
      console.log(err);
      res.redirect('/campgrounds/' + found._id);
    }
    res.render('comment/new', { campground: found });
  });
});

// CREATE - add new comment
// /campgrounds/:id/comments
// /campgrounds/5d9372fa6c3da9223bcb1662/comments
router.post('/:id/comments', isLoggedIn, (req, res) => {
  console.log('Receiving COMMENT form data by POST');

  Campground.findById(req.params.id, (err, savedCampground) => {
    if (err) {
      console.log(err);
      res.redirect('/campgrounds/' + req.params.id);
    }

    Comment.create(req.body.comment, (err, savedComment) => {
      if (err) {
        console.log(err);
      }
      savedCampground.comments.push(savedComment);
      savedCampground.save();
      console.log('Saved a new comment');

      res.redirect('/campgrounds/' + req.params.id);
    });
  });
});

module.exports = router;
