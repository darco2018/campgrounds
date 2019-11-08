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

const getReviews = async (req, res) => {};

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
    const foundDish = res.locals.foundDish;
    let review = await assembleReview(req, foundDish);
    let savedReview = await Review.create(review);

    foundDish.reviews.push(savedReview);
    foundDish.rating = calculateAverage(foundDish.reviews);
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

const showReview = async (req, res) => {};

const editReview = async (req, res) => {};

const putReview = async (req, res) => {};

const deleteReview = async (req, res) => {};

function assembleReview(req, dish) {
  if (!req) throw new Error('Cannot assemble a review. Request is null.');

  let rating = req.body.review ? req.body.review.rating : req.body.rating;

  let text = req.body.review ? req.body.review.text : req.body.text;
  text = text.substring(0, allowedReviewLength);

  const author = {
    id: req.user.id,
    username: req.user.username
  };

  // Dish.findById(req.params.id)
  //let dish = req.params.id;

  let review = {
    rating: rating,
    text: text,
    author: author,
    dish: dish
  };

  return review;
}

function calculateAverage(reviews) {
  if (reviews.length === 0) {
    return 0;
  }
  var sum = 0;
  reviews.forEach(function(element) {
    sum += element.rating;
  });
  return sum / reviews.length;
}

module.exports = {
  getReviews,
  getNewReview,
  postReview,
  showReview,
  editReview,
  putReview,
  deleteReview
};
