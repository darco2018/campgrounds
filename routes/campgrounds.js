const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

// ----------START create connection ----------
const dbName = 'campgrounds';
mongoose.connect(`mongodb://localhost:27017/${dbName}`, { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
// ----------END create connection ----------

db.once('open', () => {
  console.log(`-------------------Successfully connected! to ${dbName}!--------------------`);
});


/* function Campground(name, image) {
  this.name = name;
  this.image = image;
} */


const inMemoryDb = [
  /* new Campground('Camp1', 'https://images.unsplash.com/photo-1497900304864-273dfb3aae33?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60'),
  new Campground('Camp2', 'https://pixabay.com/get/5fe3dc46425ab108f5d084609620367d1c3ed9e04e50744f7c2d7bd69144c1_340.jpg'),
  new Campground('Camp3', 'https://pixabay.com/get/57e8d7444251ae14f6da8c7dda793f7f1636dfe2564c704c732679d4954bcc5c_340.jpg'),
  new Campground('Camp4', 'https://pixabay.com/get/57e1d3404e53a514f6da8c7dda793f7f1636dfe2564c704c732679d4954bcc5c_340.jpg'),
  new Campground('Camp5', 'https://pixabay.com/get/5fe3dc46425ab108f5d084609620367d1c3ed9e04e50744f7c2d7bd69144c1_340.jpg'),
  new Campground('Camp6', 'https://pixabay.com/get/57e8d7444251ae14f6da8c7dda793f7f1636dfe2564c704c732679d4954bcc5c_340.jpg'),
  new Campground('Camp7', 'https://pixabay.com/get/57e1d3404e53a514f6da8c7dda793f7f1636dfe2564c704c732679d4954bcc5c_340.jpg'),
  new Campground('Camp8', 'https://pixabay.com/get/5fe3dc46425ab108f5d084609620367d1c3ed9e04e50744f7c2d7bd69144c1_340.jpg'),
  new Campground('Camp9', 'https://pixabay.com/get/57e8d7444251ae14f6da8c7dda793f7f1636dfe2564c704c732679d4954bcc5c_340.jpg'),
  new Campground('Camp10', 'https://pixabay.com/get/57e1d3404e53a514f6da8c7dda793f7f1636dfe2564c704c732679d4954bcc5c_340.jpg'),
  new Campground('Camp11', 'https://pixabay.com/get/5fe3dc46425ab108f5d084609620367d1c3ed9e04e50744f7c2d7bd69144c1_340.jpg'),
  new Campground('Camp12', 'https://pixabay.com/get/57e8d7444251ae14f6da8c7dda793f7f1636dfe2564c704c732679d4954bcc5c_340.jpg'), */
];

router.get('/extra', (req, res) => {
  res.render('extra');
});

// /campgrounds
router.get('/', (req, res) => {
  res.render('campgrounds', { campgrounds: inMemoryDb });
});

// /campgrounds
router.post('/', (req, res) => {
  console.log('Sending form data by POST');
  res.redirect('/campgrounds');
});

// /campgrounds/new
router.get('/new', (req, res) => {
  res.render('new');
});

module.exports = router;
