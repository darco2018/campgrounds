var express = require('express');
var router = express.Router({ mergeParams: true });
const rating = require('../controllers/rating.controller');
var middleware = require('../middleware');

// INDEX - all ratings for a given DISH
router.get('/', rating.getRatings);

router.get(
  '/new',
  middleware.isLoggedIn,
  middleware.checkDishExists,
  middleware.checkRatingExists,
  rating.getNewRating
);

router.post(
  '/',
  middleware.isLoggedIn,
  middleware.checkDishExists,
  middleware.checkRatingExists,
  rating.postRating
);

router.get(
  '/:rating_id/edit',
  middleware.checkRatingOwnership, //includes isAuthenticated()
  middleware.checkDishExists,
  rating.editRating
);

router.put(
  '/:rating_id',
  middleware.checkDishExists,
  middleware.checkRatingOwnership, //includes isAuthenticated()
  rating.putRating
);

router.delete(
  '/:rating_id',
  /* middleware.checkRatingExists, otherwise msg You already wrote a rating */
  middleware.checkRatingOwnership, //includes isAuthenticated()
  middleware.checkDishExists,
  rating.deleteRating
);

module.exports = router;
