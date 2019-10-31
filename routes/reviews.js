var express = require('express');
var router = express.Router({ mergeParams: true });
var Dish = require('../models/dish');
var Review = require('../models/review');
var middleware = require('../middleware');

// Reviews Index - display reviews for a given DISH
router.get('/', function(req, res) {
  //IMPORTANT! Replace id with req.params.id
  Dish.findById('5d999dbd4029930fa9e8ebd3')
    .populate({
      path: 'reviews',
      options: { sort: { createdAt: -1 } } // sorting the populated reviews array to show the latest first
    })
    .exec(function(err, dish) {
      if (err || !dish) {
        req.flash('error', err.message);
        return res.redirect('back');
      }

      res.render('review/index', { dish: dish });
    });
});

// Reviews New
// middleware.checkReviewExistence checks if a user already reviewed the dish, only one review per user is allowed
router.get(
  '/new',
  //IMPORTANT! REMOVE COMMENTS FOR NEXT LINE
  /*  middleware.isLoggedIn, */
  middleware.checkReviewExists,
  function(req, res) {
    //IMPORTANT! Replace id with req.params.id
    Dish.findById('5d999dbd4029930fa9e8ebd3', function(err, dish) {
      if (err) {
        req.flash('error', err.message);
        return res.redirect('back');
      }
      res.render('review/new', { dish: dish });
    });
  }
);

// Reviews Create
router.post(
  '/',
  //IMPORTANT! REMOVE COMMENTS FOR NEXT LINE
  /*  middleware.isLoggedIn, */
  middleware.checkReviewExists,
  function(req, res) {
    Dish.findById(req.params.id)
      .populate('reviews')
      .exec(function(err, dish) {
        if (err) {
          req.flash('error', err.message);
          return res.redirect('back');
        }
        Review.create(req.body.review, function(err, review) {
          if (err) {
            req.flash('error', err.message);
            return res.redirect('back');
          }
          //add author username/id and associated dish to the review
          review.author.id = req.user._id;
          review.author.username = req.user.username;
          review.dish = dish;
          //save review
          review.save();
          dish.reviews.push(review);
          // calculate the new average review for the dish
          dish.rating = calculateAverage(dish.reviews);
          //save dish
          dish.save();
          req.flash('success', 'Your review has been successfully added.');
          res.redirect('/dishs/' + dish._id);
        });
      });
  }
);

// Reviews Edit  reviews/5dba711a74c31463a57ce407/edit
router.get('/:review_id/edit', middleware.checkReviewOwnership, function(
  req,
  res
) {
  //IMPORTANT! Replace id with req.params.review_id
  Review.findById('5dbab354bc3d6d5c949e7d71', function(err, foundReview) {
    if (err) {
      req.flash('error', err.message);
      return res.redirect('back');
    }
    console.log(foundReview);
    res.render('review/edit', { dish_id: req.params.id, review: foundReview });
  });
});

// Reviews Update
router.put("/:review_id", middleware.checkReviewOwnership, function (req, res) {
    Review.findByIdAndUpdate(req.params.review_id, req.body.review, {new: true}, function (err, updatedReview) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        Dish.findById(req.params.id).populate("reviews").exec(function (err, dish) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            // recalculate dish average
            dish.rating = calculateAverage(dish.reviews);
            //save changes
            dish.save();
            req.flash("success", "Your review was successfully edited.");
            res.redirect('/dishes/' + dish._id);
        });
    });
});


// Reviews Delete
router.delete("/:review_id", middleware.checkReviewOwnership, function (req, res) {
    Review.findByIdAndRemove(req.params.review_id, function (err) {
        if (err) {
            req.flash("error", err.message);
            return res.redirect("back");
        }
        // pull removes the reference of the review from dish's array
        Dish.findByIdAndUpdate(req.params.id, {$pull: {reviews: req.params.review_id}}, {new: true}).populate("reviews").exec(function (err, dish) {
            if (err) {
                req.flash("error", err.message);
                return res.redirect("back");
            }
            // recalculate dish average
            dish.rating = calculateAverage(dish.reviews);
            //save changes
            dish.save();
            req.flash("success", "Your review was deleted successfully.");
            res.redirect("/dishs/" + req.params.id);
        });
    });
});


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

module.exports = router;
