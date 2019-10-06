// all middleware
const Campground = require('../models/campground');
const comment = require('../models/comment');
const Comment = comment.commentModel;

const middlewareObj = {};

/* ALTERNATIVE
const middlewareObj = {
    checkCampgroundOwnership: function(){

    }
}; 
module.exports = middlewareObj;

or 

module.exports = {
    checkCampgroundOwnership: function(){
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
    //find campground & check permissions to edit/upadte/delete campground
    Comment.findById(req.params.comment_id, (err, foundComment) => {
      if (err || !foundComment) {
        // !null -> true
        console.log(err);
        req.flash('error', 'Comment not found');
        res.redirect('/campgrounds'); // breaks for 'back'
      } else {
        // equals is a mongoose method as foundCampground.author.id isa mongoose object, not string
        if (foundComment.author.id.equals(req.user.id)) {
          // User is campground's owner
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

middlewareObj.checkCampgroundOwnership = function(req, res, next) {
  middlewareObj.checkCampgroundExists;

  if (req.isAuthenticated()) {
    //find campground & check permissions to edit/upadte/delete cmapground
    Campground.findById(
      req.params.id,

      (err, foundCampground) => {
        if (err || !foundCampground) {
          // !null -> true
          console.log(err);
          req.flash('error', 'Campground not found');
          res.redirect('/campgrounds'); // breaks for 'back'
        } else {
          // equals is a mongoose method as foundCampground.author.id isa mongoose object, not string
          if (foundCampground.author.id.equals(req.user.id)) {
            // User is campground's owner
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

middlewareObj.checkCampgroundExists = function(req, res, next) {
  Campground.findById(req.params.id, function(err, campground) {
    if (err || !campground) {
      req.flash('error', 'Error: Campground not found.');
      res.redirect('/campgrounds');
    } else {
      //res.locals.foundCampground and we don't need to send it back to the template either.
      res.locals.foundCampground = campground;
      next();
    }
  });
};

middlewareObj.checkCommentExists = function(req, res, next) {
  Comment.findById(req.params.comment_id, function(err, comment) {
    if (err || !comment) {
      req.flash('error', 'Error: Comment not found.');
      res.redirect('/campgrounds');
    } else {
      res.locals.foundComment = comment;
      next();
    }
  });
};

module.exports = middlewareObj;
