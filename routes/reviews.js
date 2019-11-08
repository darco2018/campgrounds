var express = require('express');
var router = express.Router({ mergeParams: true });
const review = require('../controllers/review.controller');
var middleware = require('../middleware');

// INDEX - all reviews for a given DISH
router.get('/', review.getReviews);

router.get(
  '/new',
  middleware.isLoggedIn,
  middleware.checkDishExists,
  middleware.checkReviewExists,
  review.getNewReview
);

router.post(
  '/',
  middleware.isLoggedIn,
  middleware.checkDishExists,
  middleware.checkReviewExists,
  review.postReview
);

router.get(
  '/:review_id/edit',
  middleware.checkReviewOwnership, //includes isAuthenticated()
  middleware.checkDishExists,
  review.editReview
);

router.put(
  '/:review_id',
  middleware.checkDishExists,
  middleware.checkReviewOwnership, //includes isAuthenticated()
  review.putReview
);

router.delete(
  '/:review_id',
  middleware.checkReviewExists,
  middleware.checkReviewOwnership, //includes isAuthenticated()
  middleware.checkDishExists,
  review.deleteReview
);

module.exports = router;
