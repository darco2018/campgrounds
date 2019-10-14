/* eslint-disable consistent-return */
/* eslint-disable no-use-before-define */
const express = require('express');
const mongoose = require('mongoose');
const Dish = require('../models/dish');
const foodplace = require('../models/foodplace');
const Foodplace = foodplace.foodplaceModel;
const middleware = require('../middleware'); //index.js is imported by default from middleware folder

const router = express.Router();
const defaultImageUrl = '/images/default.jpg';
const allowedDishNameLength = 55;

/* redirect */

function handleError(req, res, error, message, page) {
  console.log(error);
  req.flash('error', message ? message : '');
  res.redirect(page);
}

function addDefaultImage(foundDish) {
  foundDish.image = !foundDish.image ? defaultImageUrl : foundDish.image;
}

function trimDishName(foundDish) {
  foundDish.name = !foundDish.image ? defaultImageUrl : foundDish.image;
}

/* ------------------------- ROUTES ------------------------------- */

// /dishes
// INDEX - show all dishes
router.get('/', (req, res) => {
  Dish.find()
    .populate('foodplace')
    .populate('comments')
    .exec((err, allDishes) => {
      if (err) {
        handleError(req, res, err, 'Something went wrong...', 'back');
      } else {
        allDishes.forEach(function(dish) {
          let commentIDsInDish = dish.comments;
          dish.latestCommentAt = commentIDsInDish[0]
            ? commentIDsInDish[0].createdAt
            : '';
        });

        res.render('dish/index', {
          dishes: allDishes,
          page: 'dishes',
          allowedDishNameLength: allowedDishNameLength
        });
      }
    });
});

// NEW - show form to create new dish
// /dishes/new
router.get('/new', middleware.isLoggedIn, (req, res) => {
  Foodplace.find({}, (err, foundFoodplaces) => {
    if (err) {
      handleError(req, res, err, 'Something went wrong...', 'back');
    } else {
      res.render('dish/new', { foodplaces: foundFoodplaces });
    }
  });
});

// CREATE - add new dish
// /dishes
router.post('/', middleware.isLoggedIn, (req, res) => {
  console.log('>>>>>>>>>>>>>>>>> req.body.foodplace: ' + req.body.foodplace);
  /* console.log(
    '>>>>>>>>>>>>>>>>> req.body.foodplace.id: ' + req.body.foodplace.id
  ); */

  /* const foodplace = {
    id: req.body.foodplace.id
    //can be read like this because in form we have select's name=foodplace[id]
  }; */
  const author = {
    id: req.user.id,
    username: req.user.username
  };
  const newDish = {
    foodplace: req.body.foodplaceId,
    name: req.body.name,
    price: req.body.price,
    image: req.body.image,
    description: req.body.desc,
    author: author
  };

  addDefaultImage(newDish);

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
    .populate('foodplace')
    .populate('comments') // populate the comments array in a dish !!!
    .exec((err, foundDish) => {
      if (err || !foundDish) {
        handleError(req, res, err, 'Dish not found', '/dishes');
      } else {
        addDefaultImage(foundDish);
        res.render('dish/show', {
          dish: foundDish,
          allowedDishNameLength: allowedDishNameLength
        });
      }
    });
});

// EDIT - show edit form
// dishes/234/edit
router.get('/:id/edit', middleware.checkDishOwnership, (req, res) => {
  // BUGGING HERE CANT SEE <option value="<%= dish[foodplace][id] %>">" in views/dish/edit.ejs:14

  Dish.findById(req.params.id)
    .populate('foodplace')
    .exec((err, foundDish) => {
      if (err || !foundDish) {
        handleError(req, res, err, 'Dish not found', '/dishes');
      }

      Foodplace.find({}, (err, foundFoodplaces) => {
        if (err) {
          handleError(req, res, err, 'Something went wrong...', 'back');
        } else {
          res.render('dish/edit', {
            dish: foundDish,
            foodplaces: foundFoodplaces
          }); //refactor with  res.locals.dish/foundDish
        }
      });
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
        handleError(req, res, err, 'Something went wrong...', 'back');
      } else {
        req.flash('success', 'Successfully updated the dish...');
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

/* HELPERS */

function loadFoodplaces() {
  Foodplace.find({}, (err, foundFoodplaces) => {
    if (err) {
      handleError(req, res, err, 'Something went wrong...', 'back');
      return null;
    } else {
      return foundFoodplaces;
      //res.render('dish/new', { foodplaces: foundFoodplaces });
    }
  });

  return;
}

module.exports = router;
