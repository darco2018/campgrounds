const express = require('express');
const router = express.Router();
// authentication
const passport = require('passport');
//const LocalStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');

const User = require('../models/user');

// show register form
router.get('/register', (req, res) => {
  res.render('auth/register');
});

// process register data
router.post('/register', (req, res) => {
  const newUser = new User({
    username: req.body.username
  });
  // passportLocalMongoose method to hash pswd
  User.register(newUser, req.body.password, (err, user) => {
    console.log('-------- Registering user ' + newUser.username);

    if (err) {
      console.log(err);
      return res.render('auth/register');
    }

    passport.authenticate('local')(req, res, function() {
      console.log('------------Local-authenticating');
      res.redirect('/campgrounds');
    });
  });
});

module.exports = router;
