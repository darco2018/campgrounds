/* eslint-disable consistent-return */
/* eslint-disable no-use-before-define */
const express = require('express');
const mongoose = require('mongoose');
const Dish = require('../models/dish');
const comment = require('../models/comment');
const Comment = comment.commentModel;
const middleware = require('../middleware'); //index.js is imported by default from middleware folder

const { flashAndRedirect } = require('../utils/index');

const router = express.Router({ mergeParams: true });
const allowedCommentLength = 2000;

const getNewComment = async (req, res) => {
  try {
    res.render('comment/new', { dish: res.locals.foundDish });
  } catch (err) {
    return flashAndRedirect(
      req,
      res,
      'error',
      `Error getting a comment. Reason: ${err.message}`,
      `back`
    );
  }
};

const postComment = async (req, res) => {
  try {
    let comment = await assembleComment(req);
    let savedComment = await Comment.create(comment);

    const foundDish = res.locals.foundDish;
    foundDish.comments.push(savedComment);
    await foundDish.save();

    return flashAndRedirect(
      req,
      res,
      'success',
      'Successfully added a new comment...',
      `/dishes/${foundDish.id}`
    );
  } catch (err) {
    return flashAndRedirect(
      req,
      res,
      'error',
      `Error saving the comment. Reason:  (${err.message})`,
      'back'
    );
  }
};

const editComment = (req, res) => {
  res.render('comment/edit', {
    comment: res.locals.foundComment,
    dishId: res.locals.foundDish.id
  });
};

const putComment = async (req, res) => {
  try {
    let comment = await assembleComment(req);
    let updated = await Comment.findByIdAndUpdate(
      req.params.comment_id,
      comment
    ).exec();

    return flashAndRedirect(
      req,
      res,
      'success',
      'Successfully updated the comment...',
      `/dishes/${res.locals.foundDish.id}`
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
};

const deleteComment = async (req, res) => {
  try {
    let commentId = req.params.comment_id;
    console.log('>>>>>>>>>>>> commentId: ' + commentId);

    let deleted = await Comment.findByIdAndDelete(commentId);
    const dishId = res.locals.foundDish.id; // or req.params.id
    await Dish.findOneAndUpdate(
      { _id: dishId },
      { $pull: { comments: commentId } }
    ).exec();

    return flashAndRedirect(
      req,
      res,
      'success',
      'Successfully deleted the comment...',
      `/dishes/${dishId}`
    );
  } catch (err) {
    return flashAndRedirect(
      req,
      res,
      'error',
      `Error when deleting the comment. Reason: ${err.message}`,
      'back'
    );
  }

  Comment.findByIdAndDelete(req.params.comment_id, err => {
    if (err) {
      console.log(`Error  deleting comment: ${err}`);
      req.flash('error', 'Something went wrong...');
      res.redirect('back');
    } else {
      req.flash('success', 'Comment deleted');
      res.redirect('/dishes/' + res.locals.foundDish.id); // or req.params.id
    }
  });
};

function assembleComment(req) {
  if (!req) throw new Error('Cannot assemble a comment. Request is null.');

  let text = req.body.comment ? req.body.comment.text : req.body.text;
  text = text.substring(0, allowedCommentLength);

  const author = {
    id: req.user.id,
    username: req.user.username
  };

  let comment = {
    text: text,
    author: author
  };

  return comment;
}

module.exports = {
  getNewComment,
  postComment,
  editComment,
  putComment,
  deleteComment
};
