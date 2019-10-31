// all middleware
const Dish = require('../models/dish');
const Comment = require('../models/comment');
const Foodplace = require('../models/foodplace');

const middlewareObj = {};

/* ALTERNATIVE
const middlewareObj = {
    checkDishOwnership: function(){

    }
}; 
module.exports = middlewareObj;

or 

module.exports = {
    checkDishOwnership: function(){
    }
}
*/

/* ---------- LOGGEDIN  & AUTHORISATION middleware ------------*/

middlewareObj.isLoggedIn = function(req, res, next) {
  if (req.isAuthenticated()) {
    return next();
  }
  // put this line before redirect, to pass it to hext route
  req.flash('error', 'You have to be logged in to do that.'); // error is the key
  res.redirect('/auth/login');
};

middlewareObj.checkCommentOwnership = function(req, res, next) {
  // replaces isLoggedIn
  if (req.isAuthenticated()) {
    //find dish & check permissions to edit/upadte/delete dish
    Comment.findById(req.params.comment_id, (err, foundComment) => {
      if (err || !foundComment) {
        // !null -> true
        console.log(err);
        req.flash('error', 'Comment not found');
        res.redirect('/dishes'); // breaks for 'back'
      } else {
        // equals is a mongoose method as foundDish.author.id isa mongoose object, not string
        if (foundComment.author.id.equals(req.user.id)) {
          // User is dish's owner
          next();
        } else {
          // User is not authorized to do this operation
          req.flash('error', "You don't have permission to do that");
          res.redirect('back');
        }
      }
    });
  } else {
    // User is NOT authenticated
    req.flash('error', 'You  have to be logged in to do that.'); // error is the key
    res.redirect('back');
  }
};

middlewareObj.checkDishOwnership = function(req, res, next) {
  middlewareObj.checkDishExists;

  if (req.isAuthenticated()) {
    //find dish & check permissions to edit/upadte/delete cmapground
    Dish.findById(
      req.params.id,

      (err, foundDish) => {
        if (err || !foundDish) {
          // !null -> true
          console.log(err);
          req.flash('error', 'Dish not found');
          res.redirect('/dishes'); // breaks for 'back'
        } else {
          // equals is a mongoose method as foundDish.author.id isa mongoose object, not string
          if (foundDish.author.id.equals(req.user.id)) {
            // User is dish's owner
            next();
          } else {
            // User is not authorized to do this operation
            req.flash('error', "You don't have permission to do that");
            res.redirect('back');
          }
        }
      }
    );
  } else {
    // User is NOT authenticated'
    req.flash('error', 'You have to be logged in to do that.'); // error is the key
    res.redirect('back');
  }
};

middlewareObj.checkDishExists = function(req, res, next) {
  Dish.findById(req.params.id, function(err, dish) {
    if (err || !dish) {
      req.flash('error', 'Error: Dish not found.');
      res.redirect('/dishes');
    } else {
      //res.locals.foundDish and we don't need to send it back to the template either.
      res.locals.foundDish = dish;
      next();
    }
  });
};

middlewareObj.checkCommentExists = function(req, res, next) {
  Comment.findById(req.params.comment_id, function(err, comment) {
    if (err || !comment) {
      req.flash('error', 'Error: Comment not found.');
      res.redirect('/dishes');
    } else {
      res.locals.foundComment = comment;
      next();
    }
  });
};

middlewareObj.checkFoodplaceExists = function(req, res, next) {
  Foodplace.findById(req.params.id, function(err, foundFoodplace) {
    if (err || !foundFoodplace) {
      req.flash('error', 'Error: Food place not found.');
      res.redirect('/foodplaces');
    } else {
      res.locals.foodplace = foundFoodplace;
      next();
    }
  });
};

middlewareObj.checkReviewExists = function (req, res, next) {
  if (req.isAuthenticated()) {
      Dish.findById(req.params.id).populate("reviews").exec(function (err, foundDish) {
          if (err || !foundDish) {
              req.flash("error", "Dish not found.");
              res.redirect("back");
          } else {
              // check if req.user._id exists in foundDish.reviews
              // some() true if any array element matches
              var foundUserReview = foundDish.reviews.some(function (review) {
                  return review.author.id.equals(req.user._id);
              });
              if (foundUserReview) {
                  req.flash("error", "You already wrote a review.");
                  return res.redirect("/dishes/" + foundDish._id);
              }
              // if the review was not found, go to the next middleware
              next();
          }
      });
  } else {
      req.flash("error", "You need to login first.");
      res.redirect("back");
  }
};

middlewareObj.checkReviewOwnership = function(req, res, next) {
  if(req.isAuthenticated()){
      Review.findById(req.params.review_id, function(err, foundReview){
          if(err || !foundReview){
              res.redirect("back");
          }  else {
              // does user own the comment?
              if(foundReview.author.id.equals(req.user._id)) {
                  next();
              } else {
                  req.flash("error", "You don't have permission to do that");
                  res.redirect("back");
              }
          }
      });
  } else {
      req.flash("error", "You need to be logged in to do that");
      res.redirect("back");
  }
};

module.exports = middlewareObj;
