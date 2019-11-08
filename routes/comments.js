/* eslint-disable consistent-return */
/* eslint-disable no-use-before-define */
const express = require('express');
const middleware = require('../middleware'); //index.js is imported by default from middleware folder
const comment = require('../controllers/comment.controller');
const router = express.Router({ mergeParams: true });

router.get(
  '/new',
  middleware.isLoggedIn,
  middleware.checkDishExists,
  comment.getNewComment
);

router.post(
  '/',
  middleware.isLoggedIn,
  middleware.checkDishExists,
  comment.postComment
);

router.get(
  '/:comment_id/edit',
  middleware.checkCommentExists,
  middleware.checkCommentOwnership, //includes isAuthenticated()
  middleware.checkDishExists,
  comment.editComment
);

router.put(
  '/:comment_id',
  middleware.checkCommentExists,
  middleware.checkCommentOwnership, //includes isAuthenticated()
  middleware.checkDishExists,
  comment.putComment
);

router.delete(
  '/:comment_id',
  middleware.checkCommentExists,
  middleware.checkCommentOwnership, //includes isAuthenticated()
  middleware.checkDishExists,
  comment.deleteComment
);

module.exports = router;
