const express = require('express');
const router = express.Router();
const middleware = require('../middleware'); //index.js is imported by default from middleware folder
const foodplace = require('../models/foodplace');
const Foodplace = foodplace.foodplaceModel;

/* redirect */

function handleError(req, res, error, message, page) {
  console.log(error);
  req.flash('error', message ? message : '');
  res.redirect(page);
}

/* ------------------------- ROUTES ------------------------------- */

// INDEX - show all foodplaces
// /foodplaces
router.get('/', (req, res) => {
  Foodplace.find({}, (err, foundFoodplaces) => {
    if (err) {
      handleError(req, res, err, 'Something went wrong...', 'back');
    } else {
      res.render('foodplace/index', {
        foodplaces: foundFoodplaces,
        page: 'foodplaces'
      });
    }
  });
});

// NEW - show form to create new dish
// /foodplace/new
router.get('/new', middleware.isLoggedIn, (req, res) => {
  res.render('foodplace/new');
});

// CREATE - add new foodplace
// /foodplaces
router.post('/', middleware.isLoggedIn, (req, res) => {
  Foodplace.create(req.body.foodplace, (err, savedFoodplace) => {
    if (err) {
      cconsole.log(`Error  creating comment: ${err}`);
      req.flash('error', 'Somethng went wrong...');
      req.redirect('back');
    }

    savedFoodplace.author.id = req.user.id;
    savedFoodplace.author.username = req.user.username;
    savedFoodplace.save();

    /*  const foundDish = res.locals.foundDish;
      foundDish.comments.push(savedComment);
      foundDish.save(); */
    req.flash('success', 'Successfully added foodplace...');
    res.redirect('/foodplaces');
  });
});

// SHOW - show details about dish
// foodplaces/234
// must be below /new
// SKIPPED

// EDIT - show edit form
// foodplaces/234/edit
router.get('/:id/edit', middleware.checkFoodplaceExists, (req, res) => {
  res.render('foodplace/edit', { foodplace: res.locals.foodplace });
});

// UPDATE
// foodplaces/234/update
// add ?_method=PUT in url  (method-override)
router.put('/:id/update', middleware.checkFoodplaceExists, (req, res) => {
  Foodplace.findByIdAndUpdate(
    req.params.id,
    req.body.foodplace,
    (err, updatedFoodplace) => {
      if (err || !updatedFoodplace) {
        handleError(req, res, err, 'Something went wrong...', '/foodplaces');
      } else {
        req.flash('success', 'Thank you. We will review your changes shortly.');
        res.redirect(`/foodplaces`);
      }
    }
  );
});

module.exports = router;
