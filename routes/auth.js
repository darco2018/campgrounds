const express = require('express');
const router = express.Router();
// authentication imports
const passport = require('passport');

const User = require('../models/user');

// show register form
// /auth/register
router.get('/register', (req, res) => {
  res.render('auth/register', { page: 'register' });
});

// process register data
// /auth/register
router.post('/register', (req, res) => {
  const newUser = new User({
    username: req.body.username
  });
  // passportLocalMongoose method to hash pswd
  User.register(newUser, req.body.password, (err, savedUser) => {
    console.log('-------- Registering user ' + newUser.username);

    if (err) {
      console.log(err);
      //absolute url when redirect but no / when render
      return res.render('auth/register', { error: err.message });
    }

    passport.authenticate('local')(req, res, function() {
      console.log('------------Local-authenticating');
      req.flash('success', 'Welcome ' + savedUser.username + '!');
      res.redirect('/campgrounds');
    });
  });
});

// show login form
// /auth/login
router.get('/login', (req, res) => {
  res.render(
    'auth/login',
    { page: 'login' } /*,  { message: req.flash('error')} */
  );
});

// process login data
// /auth/login
router.post(
  '/login',
  // middleware
  passport.authenticate('local', {
    successRedirect: '/campgrounds',
    failureRedirect: '/auth/login',
    failureFlash: true
  }),
  function(req, res) {}
);

router.get('/logout', (req, res) => {
  req.logout();
  req.flash('success', 'You have been logged out successfully');
  res.redirect('/campgrounds');
});

module.exports = router;
