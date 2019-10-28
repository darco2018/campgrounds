const express = require('express');
const router = express.Router();
// custom imports
const { flashAndRedirect } = require('../utils/index');

// authentication imports
const passport = require('passport');
const User = require('../models/user');

// show register form
// /auth/register
const showRegisterForm = (req, res) => {
  res.render('auth/register', { page: 'register' });
};

// process register data
// /auth/register
const postUser = async (req, res) => {
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
      `Welcome ${savedUser.username}! You can log in now!`,
      `/dishes/`
    );
  } catch (err) {
    //absolute url when redirect but no / when render
    return res.render('auth/register', { error: err.message });
  }
};

// show login form
// /auth/login
const showLoginForm = (req, res) => {
  res.render(
    'auth/login',
    { page: 'login' } //,  { message: req.flash('error')}
  );
};

const logout = async (req, res) => {
  await req.logout();
  return flashAndRedirect(
    req,
    res,
    'success',
    `You have been logged out successfully`,
    `/dishes/`
  );
};

module.exports = {
  showRegisterForm,
  postUser,
  showLoginForm,
  logout
};
