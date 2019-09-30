/* eslint-disable consistent-return */
/* eslint-disable no-use-before-define */
const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

// ----------START create connection ----------
const dbName = 'express_camp';
mongoose.connect(`mongodb://localhost:27017/${dbName}`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error'));
// ----------END create connection ----------

db.once('open', () => {
  console.log(`-------- Successfully connected to ${dbName} -------`);
  // saveMockCampgrounds(); run once to seed db
});

// --------- START create model ----------

const campgroundSchema = new mongoose.Schema({
  name: String,
  image: String,
  description: String,
});

console.log('Compiling Campground schema');
const Campground = mongoose.model('Campground', campgroundSchema);

// --------- END create model ----------

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

// ------- ADD MOCK PLAYGROUNDS ---------------------------------

/*
const inMemoryDb = [
 new Campground('Camp1', 'https://images.unsplash.com/photo-1497900304864-273dfb3aae33?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60'),
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
  new Campground('Camp12', 'https://pixabay.com/get/57e8d7444251ae14f6da8c7dda793f7f1636dfe2564c704c732679d4954bcc5c_340.jpg'),
];
 */

function saveMockCampgrounds() {
  console.log('Saving mock campgrounds');
  const campgrounds = [
    {
      name: 'Camp1',
      image:
        'https://images.unsplash.com/photo-1497900304864-273dfb3aae33?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60',
      description: 'Nicely situated. Clean',
    },
    {
      name: 'Camp2',
      image:
        'https://images.unsplash.com/photo-1515408320194-59643816c5b2?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60',
      description: 'No dogs allowed. dirty.',
    },
    {
      name: 'Camp3',
      image:
        'https://images.unsplash.com/photo-1476041800959-2f6bb412c8ce?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=crop&w=500&q=60',
      description: 'Far from the beach. noisy',
    },
  ];

  campgrounds.forEach((item) => {
    createCampground(item);
  });
}

function createCampground(camp) {
  Campground.create(camp, (err, savedCamp) => {
    if (err) {
      return console.log(`Error is: ${err}`);
    }
    console.log(`${savedCamp} has been saved`);
  });
}

module.exports = router;
