/* eslint-disable consistent-return */
/* eslint-disable no-use-before-define */
const express = require('express');
const mongoose = require('mongoose');
const Dish = require('../models/dish');
const Review = require('../models/review');
const middleware = require('../middleware'); //index.js is imported by default from middleware folder

const { flashAndRedirect } = require('../utils/index');

const router = express.Router({ mergeParams: true });
const allowedReviewLength = 2000;

const getReviews = async (req, res) => {
  try {
    let dish = await Dish.findById(req.params.id)
      .populate({
        path: 'reviews',
        options: { sort: { createdAt: -1 } } // sorting the populated reviews array to show the latest first.
      })
      .exec();

    res.render('review/index', { dish: dish });
  } catch (err) {
    return flashAndRedirect(
      req,
      res,
      'error',
      `Error displaying the reviews. Reason:  (${err.message})`,
      'back'
    );
  }
};

const getNewReview = async (req, res) => {
  try {
    res.render('review/new', { dish: res.locals.foundDish });
  } catch (err) {
    return flashAndRedirect(
      req,
      res,
      'error',
      `Error getting a review. Reason: ${err.message}`,
      `back`
    );
  }
};

const postReview = async (req, res) => {
  try {
    let foundDish = res.locals.foundDish;
    let review = await assembleReview(req, foundDish);
    let savedReview = await Review.create(review);

    // populate reviews for the given dish
    foundDish = await Dish.findById(req.params.id)
      .populate('reviews')
      .exec();
    foundDish.reviews.push(savedReview);
    foundDish.rating = calculateDishAverageRating(foundDish.reviews);
    await foundDish.save();

    return flashAndRedirect(
      req,
      res,
      'success',
      'Your review has been successfully added.',
      `/dishes/${foundDish.id}`
    );
  } catch (err) {
    return flashAndRedirect(
      req,
      res,
      'error',
      `Error saving the review. Reason:  (${err.message})`,
      'back'
    );
  }
};

const editReview = async (req, res) => {
  try {
    const foundReview = await Review.findById(req.params.review_id);

    res.render('review/edit', {
      review: foundReview,
      dish: res.locals.foundDish
    });
  } catch (err) {
    return flashAndRedirect(
      req,
      res,
      'error',
      `Error editing the review. Reason:  (${err.message})`,
      'back'
    );
  }
};

const putReview = async (req, res) => {
  try {
    let foundDish = res.locals.foundDish;
    let review = assembleReview(req, foundDish);
    await Review.findByIdAndUpdate(req.params.review_id, review, {
      new: true
    }).exec();

    //  Get updated reviews to recalculate dish average.
    foundDish = await Dish.findById(req.params.id)
      .populate('reviews')
      .exec();
    foundDish.rating = calculateDishAverageRating(foundDish.reviews);
    await foundDish.save();
    return flashAndRedirect(
      req,
      res,
      'success',
      'Successfully updated the review...',
      `/dishes/${foundDish.id}`
    );
  } catch (err) {
    return flashAndRedirect(
      req,
      res,
      'error',
      `Error updating the review. Reason: ${err.message}`,
      'back'
    );
  }
};

const deleteReview = async (req, res) => {
  try {
    let reviewId = req.params.review_id;
    let deleted = await Review.findByIdAndDelete(reviewId);
    const dishId = res.locals.foundDish.id;

    let dish = await Dish.findOneAndUpdate(
      { _id: dishId },
      { $pull: { reviews: reviewId } },
      { new: true }
    )
      .populate('reviews')
      .exec();

    // recalculate dish average
    dish.rating = calculateDishAverageRating(dish.reviews);
    dish.save();

    return flashAndRedirect(
      req,
      res,
      'success',
      'Successfully deleted the review...',
      `/dishes/${dishId}`
    );
  } catch (err) {
    return flashAndRedirect(
      req,
      res,
      'error',
      `Error when deleting the review. Reason: ${err.message}`,
      'back'
    );
  }
};

function assembleReview(req, dish) {
  if (!req) throw new Error('Cannot assemble a review. Request is null.');

  let rating = req.body.review ? req.body.review.rating : req.body.rating;

  let text = req.body.review ? req.body.review.text : req.body.text;
  text = text.substring(0, allowedReviewLength);

  const author = {
    id: req.user.id,
    username: req.user.username
  };

  let review = {
    rating: rating,
    text: text,
    author: author,
    dish: dish
  };

  return review;
}

function calculateDishAverageRating(reviews) {
  if (reviews.length === 0) {
    return 0;
  }
  var sum = 0;
  reviews.forEach(function(review) {
    sum += review.rating;
  });

  return sum / reviews.length;
}

module.exports = {
  getReviews,
  getNewReview,
  postReview,
  editReview,
  putReview,
  deleteReview
};
