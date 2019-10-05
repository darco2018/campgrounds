/* eslint-disable consistent-return */
/* eslint-disable no-use-before-define */
const express = require('express');
const mongoose = require('mongoose');
const Campground = require('../models/campground');
const comment = require('../models/comment');
const Comment = comment.commentModel;
const middleware = require('../middleware'); //index.js is imported by default from middleware folder

const router = express.Router({ mergeParams: true });

// NEW - show form to create new comment
// /campgrounds/:id/comments/new
router.get(
  '/new',
  middleware.isLoggedIn,
  middleware.checkCampgroundExists, //adds foundCampground to res.locals
  (req, res) => {
    res.render('comment/new', { campground: res.locals.foundCampground });
  }
);

// CREATE - add new comment
// /campgrounds/:id/comments
// /campgrounds/5d9372fa6c3da9223bcb1662/comments
router.post(
  '/',
  middleware.isLoggedIn,
  middleware.checkCampgroundExists,
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

      const foundCampground = res.locals.foundCampground;
      foundCampground.comments.push(savedComment);
      foundCampground.save();
      req.flash('success', 'Successfully added comment...');
      res.redirect('/campgrounds/' + req.params.id);
    });
  }
);

// EDIT - show edit form
// campgrounds/:id/comments/:comment_id/edit
router.get(
  '/:comment_id/edit',
  middleware.checkCommentExists,
  middleware.checkCommentOwnership, //includes isAuthenticated()
  middleware.checkCampgroundExists,
  (req, res) => {
    res.render('comment/edit', {
      comment: res.locals.foundComment,
      campgroundId: res.locals.foundCampground.id
    });
  }
);

// UPDATE
// campgrounds/:id/comments/:comment_id/update
// add ?_method=PUT in url  (method-override)
router.put(
  '/:comment_id/update',
  middleware.checkCommentExists,
  middleware.checkCommentOwnership, //includes isAuthenticated()
  middleware.checkCampgroundExists,

  (req, res) => {
    Comment.findByIdAndUpdate(
      req.params.comment_id,
      req.body.comment, // thanks to campground[name]/[url]/[description] in view
      (err, updatedComment) => {
        if (err) {
          console.log(`Error  updating comment: ${err}`);
          req.flash('error', 'Something went wrong...');
          res.redirect('back');
        } else {
          res.redirect(`/campgrounds/${res.locals.foundCampground.id}`);
        }
      }
    );
  }
);

// DESTROY - delete comment
// campgrounds/:id/comments/:comment_id/
// needs a FORM with post + method_override
router.delete(
  '/:comment_id',
  middleware.checkCommentExists,
  middleware.checkCommentOwnership, //includes isAuthenticated()
  middleware.checkCampgroundExists,

  (req, res) => {
    Comment.findByIdAndDelete(req.params.comment_id, err => {
      if (err) {
        console.log(`Error  deleting comment: ${err}`);
        req.flash('error', 'Something went wrong...');
        res.redirect('back');
      } else {
        req.flash('success', 'Comment deleted');
        res.redirect('/campgrounds/' + res.locals.foundCampground.id); // or req.params.id
      }
    });
  }
);

module.exports = router;
