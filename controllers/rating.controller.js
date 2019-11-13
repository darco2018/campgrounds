/* eslint-disable consistent-return */
/* eslint-disable no-use-before-define */
const express = require('express');
const mongoose = require('mongoose');
const Dish = require('../models/dish');
const Rating = require('../models/rating');
const middleware = require('../middleware'); //index.js is imported by default from middleware folder

const { flashAndRedirect } = require('../utils/index');

const router = express.Router({ mergeParams: true });
const allowedRatingLength = 2000;

const getRatings = async (req, res) => {
  try {
    let dish = await Dish.findById(req.params.id)
      .populate({
        path: 'ratings',
        options: { sort: { createdAt: -1 } } // sorting the populated ratings array to show the latest first.
      })
      .exec();

    res.render('rating/index', { dish: dish });
  } catch (err) {
    return flashAndRedirect(
      req,
      res,
      'error',
      `Error displaying the ratings. Reason:  (${err.message})`,
      'back'
    );
  }
};

const getNewRating = async (req, res) => {
  try {
    res.render('rating/new', { dish: res.locals.foundDish });
  } catch (err) {
    return flashAndRedirect(
      req,
      res,
      'error',
      `Error getting a rating. Reason: ${err.message}`,
      `back`
    );
  }
};

const postRating = async (req, res) => {
  console.log('--------------------- ENTER POST ------------------------');

  try {
    let foundDish = res.locals.foundDish;
    let rating = await assembleRating(req, foundDish);
    console.log(
      '--------------------- ASSEMBLED REVIEW ------------------------'
    );
    let savedRating = await Rating.create(rating);

    // populate ratings for the given dish
    foundDish = await Dish.findById(req.params.id)
      .populate('ratings')
      .exec();
    console.log(
      '--------------------- POPULATED DISH WITH REVIEWS ------------------------'
    );

    foundDish.ratings.push(savedRating);
    foundDish.avgScore = calculateDishAverageRating(foundDish.ratings);
    await foundDish.save();

    return flashAndRedirect(
      req,
      res,
      'success',
      'Your rating has been successfully added.',
      `/dishes/${foundDish.id}`
    );
  } catch (err) {
    return flashAndRedirect(
      req,
      res,
      'error',
      `Error saving the rating. Reason:  (${err.message})`,
      'back'
    );
  }
};

const editRating = async (req, res) => {
  try {
    const foundRating = await Rating.findById(req.params.rating_id);

    res.render('rating/edit', {
      rating: foundRating,
      dish: res.locals.foundDish
    });
  } catch (err) {
    return flashAndRedirect(
      req,
      res,
      'error',
      `Error editing the rating. Reason:  (${err.message})`,
      'back'
    );
  }
};

const putRating = async (req, res) => {
  try {
    let foundDish = res.locals.foundDish;
    let rating = assembleRating(req, foundDish);
    await Rating.findByIdAndUpdate(req.params.rating_id, rating, {
      new: true
    }).exec();

    //  Get updated ratings to recalculate dish average.
    foundDish = await Dish.findById(req.params.id)
      .populate('ratings')
      .exec();
    foundDish.avgScore = calculateDishAverageRating(foundDish.ratings);
    await foundDish.save();
    return flashAndRedirect(
      req,
      res,
      'success',
      'Successfully updated the rating...',
      `/dishes/${foundDish.id}`
    );
  } catch (err) {
    return flashAndRedirect(
      req,
      res,
      'error',
      `Error updating the rating. Reason: ${err.message}`,
      'back'
    );
  }
};

const deleteRating = async (req, res) => {
  try {
    let ratingId = req.params.rating_id;
    let deleted = await Rating.findByIdAndDelete(ratingId);
    const dishId = res.locals.foundDish.id;

    let dish = await Dish.findOneAndUpdate(
      { _id: dishId },
      { $pull: { ratings: ratingId } },
      { new: true }
    )
      .populate('ratings')
      .exec();

    // recalculate dish average
    dish.avgScore = calculateDishAverageRating(dish.ratings);
    dish.save();

    return flashAndRedirect(
      req,
      res,
      'success',
      'Successfully deleted the rating...',
      `/dishes/${dishId}`
    );
  } catch (err) {
    return flashAndRedirect(
      req,
      res,
      'error',
      `Error when deleting the rating. Reason: ${err.message}`,
      'back'
    );
  }
};

function assembleRating(req, dish) {
  if (!req) throw new Error('Cannot assemble a rating. Request is null.');

  let score = req.body.rating ? req.body.rating.score : req.body.score;

  /* let text = req.body.rating ? req.body.rating.text : req.body.text;
  text = text.substring(0, allowedRatingLength); */

  const author = {
    id: req.user.id,
    username: req.user.username
  };

  let rating = {
    score: score,
    text: ' ',
    author: author,
    dish: dish
  };

  return rating;
}

function calculateDishAverageRating(ratings) {
  if (ratings.length === 0) {
    return 0;
  }
  var sum = 0;
  ratings.forEach(function(rating) {
    sum += rating.score;
  });

  return sum / ratings.length;
}

module.exports = {
  getRatings,
  getNewRating,
  postRating,
  editRating,
  putRating,
  deleteRating,
  assembleRating
};
