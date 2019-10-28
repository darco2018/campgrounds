const express = require('express');
const router = express.Router();
const auth = require('../controllers/auth.controller');

// authentication imports
const passport = require('passport');
const User = require('../models/user');

router.get('/register', auth.showRegisterForm);

// process register data
// /auth/register
router.post('/register', auth.postUser);

// show login form
// /auth/login
router.get('/login', auth.showLoginForm);

// process login data
// /auth/login
router.post(
  '/login',
  // middleware
  passport.authenticate('local', {
    successRedirect: '/dishes',
    failureRedirect: '/auth/login',
    failureFlash: true
  }) // no callback necessary here
);

router.get('/logout', auth.logout);

module.exports = router;
