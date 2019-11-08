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



function assembleReview(req) {
  if (!req) throw new Error('Cannot assemble a review. Request is null.');

  let rating = req.body.rating ? req.body.review.rating : req.body.rating;

  let text = req.body.review ? req.body.review.text : req.body.text;
  text = text.substring(0, allowedReviewLength);

  const author = {
    id: req.user.id,
    username: req.user.username
  };

  // Dish.findById(req.params.id)
  let dish = req.params.id;

  let review = {
    rating: rating,
    text: text,
    author: author,
    dish: dish
  };

  return review;
}

module.exports = {

};
/* 
module.exports = {
  getReviews,
  getNewReview,
  postReview,
  showReview,
  editReview,
  putReview,
  deleteReview
};
 */