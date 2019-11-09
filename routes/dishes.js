/* eslint-disable consistent-return */
/* eslint-disable no-use-before-define */
const express = require('express');
const router = express.Router();
const middleware = require('../middleware'); //index.js is imported by default from middleware folder
const dish = require('../controllers/dish.controller');

/* ------------------------- ROUTES------------------------------- */

// INDEX - show all dishes
router.get('/', dish.getDishes);

// NEW - show form to create new dish
router.get('/new', middleware.isLoggedIn, dish.getNewDish);

// CREATE - add new dish
router.post('/', middleware.isLoggedIn, middleware.upload.single('image'), dish.postDish);

// SHOW - show details about dish
// dishes/234
// must be below /new
router.get('/:id', dish.showDish);

// EDIT - show edit form
// dishes/234/edit
router.get('/:id/edit', middleware.checkDishOwnership, dish.editDish);

// UPDATE
// dishes/234/update
// add ?_method=PUT in url  (method-override)
router.put('/:id', middleware.checkDishOwnership, middleware.upload.single('dish[image]'), dish.putDish);

// DESTROY - delete dish
// needs a FORM with post + method_override (// checkDishOwnership does checkDishExists)
router.delete('/:id', middleware.checkDishOwnership, dish.deleteDish);

module.exports = router;
