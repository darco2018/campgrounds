const express = require('express');
const router = express.Router();
const admin = require('../controllers/admin.controller');

router.get('/info', admin.getStats);

module.exports = router;
