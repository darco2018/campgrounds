const express = require('express');

const router = express.Router();

/* GET home page. */
router.get('/', (req, res) => {
  res.render('landing', { title: 'Dishes' });
});

module.exports = router;
