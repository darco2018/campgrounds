const express = require('express');
const Dish = require('../models/dish');
const Foodplace = require('../models/foodplace');
const Comment = require('../models/comment');
const User = require('../models/user');

const getStats = async (req, res) => {
  try {
    const dishCount = Dish.countDocuments({});
    const foodplaceCount = Foodplace.countDocuments({});
    const commentCount = Comment.countDocuments({});
    const userCount = User.countDocuments({});

    let results = await Promise.all([
      dishCount,
      foodplaceCount,
      commentCount,
      userCount
    ]);
    console.log(results);

    res.send(`Dishes: ${results[0]}<br>
              Foodplaces: ${results[1]}<br>
              Comments: ${results[2]}<br>
              Users: ${results[3]}
              `);
  } catch (err) {
    res.send(`Error: ${err}`);
  }
};

module.exports = {
  getStats
};
