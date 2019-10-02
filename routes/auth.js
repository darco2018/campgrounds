const express = require('express');
const router = express.Router();

// show register form
router.get('/register', (req, res) => {
  res.render('auth/register');
});

// process register data
router.post('/register', (req, res) => {
  res.send('REGISTER POST ROUTE');
});

module.exports = router;
