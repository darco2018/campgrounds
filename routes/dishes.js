/* eslint-disable consistent-return */
/* eslint-disable no-use-before-define */
const express = require('express');
const mongoose = require('mongoose');
const Dish = require('../models/dish');
const middleware = require('../middleware'); //index.js is imported by default from middleware folder

const router = express.Router();

/* redirect */

function handleError(req, res, error, message, page) {
  console.log(error);
  req.flash('error', message ? message : '');
  res.redirect(page);
}

/* ------------------------- ROUTES ------------------------------- */

// /dishes
// INDEX - show all dishes
router.get('/', (req, res) => {
  Dish.find({}, (err, allDishes) => {
    if (err) {
      handleError(req, res, err, 'Something went wrong...', 'back');
    } else {
      res.render('dish/index', {
        dishes: allDishes,
        page: 'dishes'
      });
    }
  });
});

// NEW - show form to create new dish
// /dishes/new
router.get('/new', middleware.isLoggedIn, (req, res) => {
  res.render('dish/new');
});

// CREATE - add new dish
// /dishes
router.post('/', middleware.isLoggedIn, (req, res) => {
  const author = {
    id: req.user.id,
    username: req.user.username
  };
  const newDish = {
    name: req.body.name,
    price: req.body.price,
    image: req.body.image,
    description: req.body.desc,
    author: author
  };

  Dish.create(newDish, (err, savedDish) => {
    if (err) {
      handleError(req, res, err, 'Something went wrong...', 'back');
    } else {
      res.redirect('/dishes');
    }
  });
});

// SHOW - show details about dish
// dishes/234
// must be below /new
router.get('/:id', (req, res) => {
  // OK
  Dish.findById(req.params.id)
    .populate('comments') // populate the comments array in a dish !!!
    .exec((err, foundDish) => {
      if (err || !foundDish) {
        handleError(req, res, err, 'Dish not found', '/dishes');
      }
      res.render('dish/show', { dish: foundDish });
    });
});

// EDIT - show edit form
// dishes/234/edit
router.get('/:id/edit', middleware.checkDishOwnership, (req, res) => {
  Dish.findById(req.params.id, (err, foundDish) => {
    if (err || !foundDish) {
      handleError(req, res, err, 'Dish not found', '/dishes');
    }
    res.render('dish/edit', { dish: foundDish });
  });
});

// UPDATE
// dishes/234/update
// add ?_method=PUT in url  (method-override)
router.put('/:id/update', middleware.checkDishOwnership, (req, res) => {
  // checkDishOwnership does checkDishExists first

  Dish.findByIdAndUpdate(
    req.params.id,
    req.body.dish, // thanks to dish[name]/[url]/[description] in view
    (err, updatedDish) => {
      if (err || !updatedDish) {
        handleError(req, res, err, 'Something went wrong...', '/dishes');
      } else {
        res.redirect(`/dishes/${updatedDish.id}`);
      }
    }
  );
});

// DESTROY - delete dish
// dishes/:id
// needs a FORM with post + method_override
router.delete(
  '/:id',
  middleware.checkDishOwnership, // does checkDishExists
  (req, res) => {
    Dish.findByIdAndDelete(req.params.id, err => {
      if (err) {
        handleError(req, res, err, 'Something went wrong...', 'back');
      } else {
        res.redirect('/dishes/');
      }
    });
  }
);

module.exports = router;
