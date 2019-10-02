const express = require('express');
const router = express.Router();
// authentication
const passport = require('passport');
//const LocalStrategy = require('passport-local');
const passportLocalMongoose = require('passport-local-mongoose');

const User = require('../models/user');

// show register form
// /auth/register
router.get('/register', (req, res) => {
  res.render('auth/register');
});

// process register data
// /auth/register
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

// show login form
// /auth/login
router.get('/login', (req, res) => {
  res.render('auth/login');
});

// process login data
// /auth/login
router.post(
  '/login',
  // middleware
  passport.authenticate('local', {
    successRedirect: '/campgrounds',
    failureRedirect: '/auth/login'
  }),
  function(req, res) {}
);

module.exports = router;
