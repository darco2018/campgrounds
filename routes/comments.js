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
  (req, res) => {
    Comment.create(req.body.comment, (err, savedComment) => {
      if (err) {
        cconsole.log(`Error  creating comment: ${err}`);
        req.flash('error', 'Somethng went wrong...');
        req.redirect('back');
      }

      savedComment.author.id = req.user.id;
      savedComment.author.username = req.user.username;
      savedComment.save();

      const foundDish = res.locals.foundDish;
      foundDish.comments.push(savedComment);
      foundDish.save();
      req.flash('success', 'Successfully added comment...');
      res.redirect('/dishes/' + req.params.id);
    });
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

  (req, res) => {
    Comment.findByIdAndUpdate(
      req.params.comment_id,
      req.body.comment, // thanks to dish[name]/[url]/[description] in view
      (err, updatedComment) => {
        if (err) {
          console.log(`Error  updating comment: ${err}`);
          req.flash('error', 'Something went wrong...');
          res.redirect('back');
        } else {
          res.redirect(`/dishes/${res.locals.foundDish.id}`);
        }
      }
    );
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

  (req, res) => {
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

module.exports = router;
