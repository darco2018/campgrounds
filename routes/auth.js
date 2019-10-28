const express = require('express');
const router = express.Router();
// custom imports
const { flashAndRedirect } = require('../utils/index');

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
router.post('/register', async (req, res) => {
  try {
    const newUser = new User({
      username: req.body.username
    });
    // passportLocalMongoose method to hash pswd
    let savedUser = await User.register(newUser, req.body.password);
    await passport.authenticate('local');

    return flashAndRedirect(
      req,
      res,
      'success',
      `Welcome ${savedUser.username}!`,
      `/dishes/`
    );
  } catch (err) {
    //absolute url when redirect but no / when render
    return res.render('auth/register', { error: err.message });
  }
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
    successRedirect: '/dishes',
    failureRedirect: '/auth/login',
    failureFlash: true
  }),
  function(req, res) {}
);

router.get('/logout', async (req, res) => {
  await req.logout();
  return flashAndRedirect(
    req,
    res,
    'success',
    `You have been logged out successfully`,
    `/dishes/`
  );
});

module.exports = router;
