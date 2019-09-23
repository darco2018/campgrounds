const express = require('express');
const request = require('request');

const router = express.Router();

function Campground(name, image) {
  this.name = name;
  this.image = image;
}

const inMemoryDb = [
  new Campground('Camp1', 'https://pixabay.com/get/57e1d3404e53a514f6da8c7dda793f7f1636dfe2564c704c732679d4954bcc5c_340.jpg'),
  new Campground('Camp2', 'https://pixabay.com/get/5fe3dc46425ab108f5d084609620367d1c3ed9e04e50744f7c2d7bd69144c1_340.jpg'),
  new Campground('Camp3', 'https://pixabay.com/get/57e8d7444251ae14f6da8c7dda793f7f1636dfe2564c704c732679d4954bcc5c_340.jpg'),
];

// /campgrounds
router.get('/', (req, res) => {
  // res.send('Displaying list of campgrounds');
  res.render('campgrounds', { campgrounds: inMemoryDb });
});

// /campgrounds
router.post('/', (req, res) => {
  console.log('Sending form data by POST');

  res.redirect('/campgrounds');
});

// /campgrounds/new
router.get('/new', (req, res) => {
  // res.send('Showing the form for a new campground');
  res.render('newcampground');
});

module.exports = router;
