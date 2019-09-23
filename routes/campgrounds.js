const express = require('express');
const request = require('request');

const router = express.Router();

// /campgrounds
router.get('/', (req, res) => {
  res.send('Displaying list of campgrounds');
});

router.post('/', (req, res) => {
  console.log('Sending form data');
  res.redirect('/');
});

// /campgrounds/new
router.get('/new', (req, res) => {
  res.send('Showing the form for a new campground');
});

module.exports = router;
