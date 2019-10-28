/* eslint-disable consistent-return */
/* eslint-disable no-use-before-define */
const express = require('express');
const mongoose = require('mongoose');
const Dish = require('../models/dish');
const comment = require('../models/comment');
const Comment = comment.commentModel;
const middleware = require('../middleware'); //index.js is imported by default from middleware folder

const router = express.Router({ mergeParams: true });

// NEW - show form to create new comment
// /dishes/:id/comments/new
router.get(
  '/new',
  middleware.isLoggedIn,
  middleware.checkDishExists, //adds foundDish to res.locals
  async (req, res) => {
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
  }
);

// CREATE - add new comment
// /dishes/:id/comments
// /dishes/5d9372fa6c3da9223bcb1662/comments
router.post(
  '/',
  middleware.isLoggedIn,
  middleware.checkDishExists,
  async (req, res) => {
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
  }
);

// EDIT - show edit form
// dishes/:id/comments/:comment_id/edit
router.get(
  '/:comment_id/edit',
  middleware.checkCommentExists,
  middleware.checkCommentOwnership, //includes isAuthenticated()
  middleware.checkDishExists,
  (req, res) => {
    res.render('comment/edit', {
      comment: res.locals.foundComment,
      dishId: res.locals.foundDish.id
    });
  }
);

// UPDATE
// dishes/:id/comments/:comment_id/update
// add ?_method=PUT in url  (method-override)
router.put(
  '/:comment_id/update',
  middleware.checkCommentExists,
  middleware.checkCommentOwnership, //includes isAuthenticated()
  middleware.checkDishExists,

  async (req, res) => {
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
  }
);

// DESTROY - delete comment
// dishes/:id/comments/:comment_id/
// needs a FORM with post + method_override
router.delete(
  '/:comment_id',
  middleware.checkCommentExists,
  middleware.checkCommentOwnership, //includes isAuthenticated()
  middleware.checkDishExists,

  async (req, res) => {
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
  }
);

function assembleComment(req) {
  if (!req) throw new Error('Cannot assemble a comment. Request is null.');

  const author = {
    id: req.user.id,
    username: req.user.username
  };

  let comment = {
    text: req.body.comment ? req.body.comment.text : req.body.text,
    author: author
  };

  return comment;
}

function flashAndRedirect(req, res, flashStatus, flashMsg, url) {
  req.flash(flashStatus, flashMsg);
  res.redirect(url);
}

module.exports = router;
