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
const allowedDishNameLength = 49;
const allowedIntroDescriptionLength = 66;
const allowedDescriptionLength = 2000;

/* redirect */

function handleError(req, res, error, message, page) {
  console.log(error);
  req.flash('error', message ? message : '');
  res.redirect(page);
}

function trimDishName(foundDish) {
  foundDish.name = !foundDish.image ? defaultImageUrl : foundDish.image;
}

/* ------------------------- ROUTES ------------------------------- */

// /dishes
// INDEX - show all dishes
router.get('/', async (req, res) => {
  try {
    let dishes = await Dish.find()
      .populate('foodplace')
      .populate('comments')
      .exec(); //returns full-fledged Promise in mongoose

    dishes = await addLatestCommentTo(dishes);

    res.render('dish/index', {
      dishes: dishes,
      page: 'dishes',
      allowedDishNameLength: allowedDishNameLength,
      allowedIntroLength: allowedIntroDescriptionLength
    });
  } catch (err) {
    return flashAndRedirect(
      req,
      res,
      'error',
      `Error. Cannot load the dishes. Reason: ${err.message}`,
      `back`
    );
  }
  /* 2ND VERSION: const promise = fn.then(val=>{//process val; return sth}).catch(err) 
  Dish.find()
    .populate('foodplace')
    .populate('comments')
    .then(dishes => addLatestCommentTo(dishes))
    .then(dishes => {
      res.render('dish/index', {
        dishes: dishes,
        page: 'dishes',
        allowedDishNameLength: allowedDishNameLength,
        allowedIntroLength: allowedIntroDescriptionLength
      });
    })
    .catch(err => {
      return flashAndRedirect(
        req,
        res,
        'error',
        `Error: cannot load the dishes (${err.message})`,
        `back`
      );
    });
     */
});

// NEW - show form to create new dish
// /dishes/new
router.get('/new', middleware.isLoggedIn, async (req, res) => {
  try {
    let foodplaces = await Foodplace.find().exec();
    res.render('dish/new', { foodplaces: foodplaces });
  } catch (err) {
    return flashAndRedirect(
      req,
      res,
      'error',
      `Error. Cannot show the form. Reason: ${err.message}`,
      `back`
    );
  }
  /* 
  Foodplace.find({}, (err, foundFoodplaces) => {
    if (err) {
      handleError(req, res, err, 'Something went wrong...', 'back');
    } else {
      res.render('dish/new', { foodplaces: foundFoodplaces });
    }
  }); */
});

// CREATE - add new dish
// /dishes
router.post('/', middleware.isLoggedIn, async (req, res) => {
  //if (!req.user) throw new Error('You have to be logged in to do that!');
  try {
    let dish = await assembleDish(req);
    let savedDish = await Dish.create(dish);

    // increment dish count for the given foodplace
    const foodplaceId = savedDish.foodplace;
    await Foodplace.findOneAndUpdate(
      { _id: foodplaceId },
      { $inc: { dishesCount: 1 } }
    ).exec();

    return flashAndRedirect(
      req,
      res,
      'success',
      'Successfully created a new dish...',
      `/dishes/${savedDish.id}`
    );
  } catch (err) {
    return flashAndRedirect(
      req,
      res,
      'error',
      `Foodplace not found (${err.message})`,
      'back'
    );
  }
});

// SHOW - show details about dish
// dishes/234
// must be below /new
router.get('/:id', async (req, res) => {
  try {
    let dish = await Dish.findById(req.params.id)
      .populate('foodplace')
      .populate('comments')
      .exec();

    res.render('dish/show', {
      dish: dish,
      allowedDishNameLength: allowedDishNameLength
    });
  } catch (err) {
    return flashAndRedirect(
      req,
      res,
      'error',
      `Error loading the dish. Reason: ${err.message}`,
      'back'
    );
  }
  /* 
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
    });*/
});

// EDIT - show edit form
// dishes/234/edit
router.get('/:id/edit', middleware.checkDishOwnership, async (req, res) => {
  try {
    let dish = await Dish.findById(req.params.id)
      .populate('foodplace')
      .exec();

    let foodplaces = await Foodplace.find().exec();

    res.render('dish/edit', {
      dish: dish,
      foodplaces: foodplaces
    }); //refactor with  res.locals.dish/foundDish
  } catch (err) {
    return flashAndRedirect(
      req,
      res,
      'error',
      `Error. Cannot show the edit form. Reason: ${err.message}`,
      'back'
    );
  }
  /* 
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
    }); */
});

// UPDATE
// dishes/234/update
// add ?_method=PUT in url  (method-override)
router.put('/:id/update', middleware.checkDishOwnership, async (req, res) => {
  // checkDishOwnership does checkDishExists first
  try {
    let dish = await assembleDish(req);
    let updated = await Dish.findByIdAndUpdate(req.params.id, dish).exec();

    return flashAndRedirect(
      req,
      res,
      'success',
      'Successfully updated the dish...',
      `/dishes/${updated.id}`
    );
  } catch (err) {
    return flashAndRedirect(
      req,
      res,
      'error',
      `Error. Cannot update the dish. Reason: ${err.message}`,
      'back'
    );
  }
  /* 

  Dish.findByIdAndUpdate(
    req.params.id,
    req.body.dish,
    (err, updatedDish) => {
      if (err || !updatedDish) {
        handleError(req, res, err, 'Something went wrong...', 'back');
      } else {
        req.flash('success', 'Successfully updated the dish...');
        res.redirect(`/dishes/${updatedDish.id}`);
      }
    }
  ); */
});

// DESTROY - delete dish
// dishes/:id
// needs a FORM with post + method_override (// checkDishOwnership does checkDishExists)
router.delete('/:id', middleware.checkDishOwnership, async (req, res) => {
  try {
    let deleted = await Dish.findByIdAndDelete(req.params.id).exec();
    const foodplaceId = deleted.foodplace;
    //decrease dish count for the given foodplace
    await Foodplace.findOneAndUpdate(
      { _id: foodplaceId },
      { $inc: { dishesCount: -1 } }
    ).exec();

    return flashAndRedirect(
      req,
      res,
      'success',
      'Successfully deleted the dish...',
      `/dishes/`
    );
  } catch (err) {
    return flashAndRedirect(
      req,
      res,
      'error',
      `Error when deleting the dish. Reason: ${err.message}`,
      '/dishes/'
    );
  }
  /* 
  Dish.findByIdAndDelete(req.params.id, (err, deletedDish) => {
    if (err) {
      handleError(req, res, err, 'Something went wrong...', 'back');
    } else {
      // decrement dish count in foodplace
      const foodplaceId = deletedDish.foodplace;
      Foodplace.findOneAndUpdate(
        { _id: foodplaceId },
        { $inc: { dishesCount: -1 } }
      ).exec();
      res.redirect('/dishes/');
    }
  }); */
});

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

function findByIdAndUpdatePromise(id, foodplace) {
  return new Promise((resolve, reject) => {
    Foodplace.findByIdAndUpdate(id, foodplace, (err, updatedFoodplace) => {
      if (err || !updatedFoodplace) {
        reject('Error: Cannot update the foodplace...');
      } else {
        resolve(updatedFoodplace);
      }
    });
  });
}

function flashAndRedirect(req, res, flashStatus, flashMsg, url) {
  req.flash(flashStatus, flashMsg);
  res.redirect(url);
}

function addLatestCommentTo(dishes) {
  dishes.forEach(dish => {
    let latestComment = dish.comments[0];
    dish.latestCommentAt = latestComment ? latestComment.createdAt : '';
  });
  return dishes;
}

function assembleDish(req) {
  if (!req) throw new Error('Cannot assemble a dish. Request is null.');  

  let image = req.body.dish ? req.body.dish.image : req.body.image;
  image = !image ? defaultImageUrl : image;

  let description = req.body.dish ? req.body.dish.description : req.body.description;
  description = description.substring(0, allowedDescriptionLength);

  const author = {
    id: req.user.id,
    username: req.user.username
  };

  let dish = {
    foodplace: req.body.dish ? req.body.dish.foodplace : req.body.foodplaceId,
    name: req.body.dish ? req.body.dish.name : req.body.name,
    price: req.body.dish ? req.body.dish.price : req.body.price,
    image: image,
    description: description,
    author: author
  };

  return dish;
}

module.exports = router;
