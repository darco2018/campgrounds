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
  req.flash('error', 'Please have to be logged in to do that.'); // error is the key
  res.redirect('/auth/login');
};

middlewareObj.checkCommentOwnership = function(req, res, next) {
  // replaces isLoggedIn
  if (req.isAuthenticated()) {
    //find campground & check permissions to edit/upadte/delete cmapground
    Comment.findById(req.params.comment_id, (err, foundComment) => {
      if (err) {
        console.log(err);
      }

      // equals is a mongoose method as foundCampground.author.id isa mongoose object, not string
      if (foundComment.author.id.equals(req.user.id)) {
        // User is campground's owner
        next();
      } else {
        // User is not authorized to do this operation
        req.flash('error', "You don't have permission to do that");
        res.redirect('back');
      }
    });
  } else {
    // User is NOT authenticated
    req.flash('error', 'You  have to be logged in to do that.'); // error is the key
    res.redirect('back');
  }
};

middlewareObj.checkCampgroundOwnership = function(req, res, next) {
  // replaces isLoggedIn
  if (req.isAuthenticated()) {
    //find campground & check permissions to edit/upadte/delete cmapground
    Campground.findById(req.params.id, (err, foundCampground) => {
      if (err) {
        console.log(err);
        req.flash('error', 'Campground not found');
        req.redirect('back');
      }

      // equals is a mongoose method as foundCampground.author.id isa mongoose object, not string
      if (foundCampground.author.id.equals(req.user.id)) {
        // User is campground's owner
        next();
      } else {
        // User is not authorized to do this operation
        req.flash('error', "You don't have permission to do that");
        res.redirect('back');
      }
    });
  } else {
    // User is NOT authenticated'
    req.flash('error', 'You have to be logged in to do that.'); // error is the key
    res.redirect('back');
  }
};

module.exports = middlewareObj;
