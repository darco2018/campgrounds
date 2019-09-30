/* eslint-disable consistent-return */
/* eslint-disable no-use-before-define */
const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

/* CREATE DB CONNECTION - start */

const dbName = 'express_camp';
mongoose.connect(`mongodb://localhost:27017/${dbName}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));

/* CREATE DB CONNECTION - end */

db.once('open', () => {
  console.log(`-------- Successfully connected to ${dbName} -------`);
  // saveMockCampgrounds(); run once to seed db
});

/* create model */
const Campground = require('../models/campground');

/* ------------------------- ROUTES ------------------------------- */

// /campgrounds
// INDEX - show all campgrounds
router.get('/', (req, res) => {
  Campground.find({}, (err, allCampgrounds) => {
    if (err) {
      console.log(`Error when finding campground ${err}`);
    } else {
      res.render('campgrounds', { campgrounds: allCampgrounds });
      //  res.render('campgrounds', { campgrounds: inMemoryDb });
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
    description: req.body.desc,
  };
  Campground.create(newCampground, (err, savedCamp) => {
    if (err) {
      return console.log(`Error is: ${err}`);
    }
    console.log(`${savedCamp} has been saved`);
    res.redirect('/campgrounds');
  });
});

// NEW - show form to create new campground
// /campgrounds/new
router.get('/new', (req, res) => {
  res.render('new');
});

// SHOW - show details about campground
// campgrounds/234
// must be below /new
router.get('/:id', (req, res) => {
  Campground.findById(req.params.id, (err, foundCamp) => {
    if (err) {
      return console.log.bind(console, err);
    }
    res.render('show', { camp: foundCamp });
  });
});

module.exports = router;
