/* eslint-disable consistent-return */
/* eslint-disable no-use-before-define */
const express = require('express');
const mongoose = require('mongoose');
const Dish = require('../models/dish');
const Foodplace = require('../models/foodplace');
const ratingController = require('./rating.controller');
const Rating = require('../models/rating');
const Comment = require('../models/comment');
//const middleware = require('../middleware'); //index.js is imported by default from middleware folder
const { flashAndRedirect } = require('../utils/index');
const cloudinary = require('../services/cloudinary'); // cloud image service

const router = express.Router();
const defaultImageUrl = '/images/default.jpg';
const allowedDishNameLength = 49;
const allowedIntroDescriptionLength = 66;
const allowedDescriptionLength = 2000;

/* ------------------------- ROUTES ------------------------------- */

const getDishes = async (req, res) => {
  // freezes the code: eval(require('locus')); // req.query.search
  try {
    let dishes = null;
    if (req.query.search) {
      const regex = new RegExp(escapeRegex(req.query.search), 'gi');

      dishes = await Dish.find({name: regex})
        .populate('foodplace')
        .populate('comments')
        .exec(); //returns full-fledged Promise in mongoose
    } else {
      dishes = await Dish.find()
        .populate('foodplace')
        .populate('comments')
        .exec(); //returns full-fledged Promise in mongoose
    }

    dishes = await addLatestCommentTo(dishes);
    if (dishes == null) {
      dishes = [];
    }

    res.render('dish/index', {
      dishes: dishes,
      page: 'dishes',
      allowedDishNameLength: allowedDishNameLength,
      allowedIntroLength: allowedIntroDescriptionLength
    });
  } catch (err) {
    return flashAndRedirect(
      req,
      res,
      'error',
      `Error. Cannot load the dishes. Reason: ${err.message}`,
      `back`
    );
  }
};

const getNewDish = async (req, res) => {
  try {
    let foodplaces = await Foodplace.find().exec();
    res.render('dish/new', { foodplaces: foodplaces });
  } catch (err) {
    return flashAndRedirect(
      req,
      res,
      'error',
      `Error. Cannot show the form. Reason: ${err.message}`,
      `back`
    );
  }
};

const postDish = async (req, res) => {
  //if (!req.user) throw new Error('You have to be logged in to do that!');
  try {
    let result = await cloudinary.v2.uploader.upload(req.file.path);
    if (req.body.dish) {
      req.body.dish.image = result.secure_url;
      req.body.dish.imageId = result.public_id;
    } else {
      req.body.image = result.secure_url;
      req.body.imageId = result.public_id;
    }
  } catch (err) {
    return flashAndRedirect(
      req,
      res,
      'error',
      `Error uploading the file. Reason: ${err.message}`,
      'back'
    );
  }

  try {
    let dish = await assembleDish(req);
    let savedDish = await Dish.create(dish);

    //create rating
    let rating = ratingController.assembleRating(req, savedDish);
    // no need to calculate avg rating
    savedDish.avgScore = req.body.dish ? req.body.dish.score : req.body.score;
    let savedRating = await Rating.create(rating);
    savedDish.ratings.push(savedRating);

    // create comment from dish.description
    let comment = assembleComment(req);
    let savedComment = await Comment.create(comment);
    savedDish.comments.push(savedComment);

    await savedDish.save();

    // increment dish count for the given foodplace
    const foodplaceId = savedDish.foodplace;
    await Foodplace.findOneAndUpdate(
      { _id: foodplaceId },
      { $inc: { dishesCount: 1 } }
    ).exec();

    return flashAndRedirect(
      req,
      res,
      'success',
      'Successfully created a new dish...',
      `/dishes/${savedDish.id}`
    );
  } catch (err) {
    return flashAndRedirect(
      req,
      res,
      'error',
      `Error creating a new dish. Reason: (${err.message})`,
      'back'
    );
  }
};

const showDish = async (req, res) => {
  try {
    let dish = await Dish.findById(req.params.id)
      .populate('foodplace')
      .populate('comments')
      .populate({
        path: 'ratings',
        options: { sort: { createdAt: -1 } }
      })
      .exec();

    if (dish == null) {
      throw new Error('Dish not found!');
    }

    res.render('dish/show', {
      dish: dish,
      allowedDishNameLength: allowedDishNameLength
    });
  } catch (err) {
    return flashAndRedirect(
      req,
      res,
      'error',
      `Error loading the dish. Reason: ${err.message}`,
      'back'
    );
  }
};

const editDish = async (req, res) => {
  try {
    let dish = await Dish.findById(req.params.id)
      .populate('foodplace')
      .exec();

    if (dish == null) {
      throw new Error('Dish not found!');
    }

    let foodplaces = await Foodplace.find().exec();
    if (foodplaces == null) {
      foodplaces = [];
    }

    res.render('dish/edit', {
      dish: dish,
      foodplaces: foodplaces
    }); //refactor with  res.locals.dish/foundDish
  } catch (err) {
    return flashAndRedirect(
      req,
      res,
      'error',
      `Error. Cannot show the edit form. Reason: ${err.message}`,
      'back'
    );
  }
};

const putDish = async (req, res) => {
  // protect the dish.avgScore field from manipulation on update
  if (req.body.dish.avgScore) {
    delete req.body.dish.avgScore;
  }

  // handle image upload
  try {
    let oldDish = await Dish.findById(req.params.id);

    if (req.file) {
      // delete file from cloudinary
      await cloudinary.v2.uploader.destroy(oldDish.imageId);
      let result = await cloudinary.v2.uploader.upload(req.file.path);

      if (req.body.dish) {
        req.body.dish.image = result.secure_url;
        req.body.dish.imageId = result.public_id;
      } else {
        req.body.image = result.secure_url;
        req.body.imageId = result.public_id;
      }
    } else {
      // preserve old image
      if (req.body.dish) {
        req.body.dish.image = oldDish.image;
        req.body.dish.imageId = oldDish.imageId;
      } else {
        req.body.image = oldDish.image;
        req.body.imageId = oldDish.imageId;
      }
    }
  } catch (err) {
    return flashAndRedirect(
      req,
      res,
      'error',
      `Error uploading the file. Reason: ${err.message}`,
      'back'
    );
  }

  // checkDishOwnership does checkDishExists first
  try {
    let dish = await assembleDish(req);
    let updated = await Dish.findByIdAndUpdate(req.params.id, dish).exec();

    return flashAndRedirect(
      req,
      res,
      'success',
      'Successfully updated the dish...',
      `/dishes/${updated.id}`
    );
  } catch (err) {
    return flashAndRedirect(
      req,
      res,
      'error',
      `Error. Cannot update the dish. Reason: ${err.message}`,
      'back'
    );
  }
};

const deleteDish = async (req, res) => {
  try {
    let dish = await Dish.findById(req.params.id);

    // remove img from cloudinary. (pre-loaded dishes dont have imageId property)
    if (dish.imageId) {
      cloudinary.v2.uploader.destroy(dish.imageId);
    }

    //decrease dish count for the given foodplace
    const foodplaceId = dish.foodplace;
    await Foodplace.findOneAndUpdate(
      { _id: foodplaceId },
      { $inc: { dishesCount: -1 } }
    ).exec();

    // more on : Cascade Delete with MongoDB: https://www.youtube.com/watch?v=5iz69Wq_77k
    // deletes all comments & ratings associated with the dish
    /* $in operator which finds all Comment and Rating database entries which have ids contained 
    in dish.comments and dish.ratings, and deletes them along with the associated dish that 
    is getting removed.  */
    await Comment.remove({ _id: { $in: dish.comments } });
    await Rating.remove({ _id: { $in: dish.ratings } });
    dish.remove();
    //  let deleted = await Dish.findByIdAndDelete(dishId).exec();

    return flashAndRedirect(
      req,
      res,
      'success',
      'Successfully deleted the dish...',
      `/dishes/`
    );
  } catch (err) {
    return flashAndRedirect(
      req,
      res,
      'error',
      `Error when deleting the dish. Reason: ${err.message}`,
      '/dishes/'
    );
  }
};

/* HELPERS */

function findByIdAndUpdatePromise(id, foodplace) {
  return new Promise((resolve, reject) => {
    Foodplace.findByIdAndUpdate(id, foodplace, (err, updatedFoodplace) => {
      if (err || !updatedFoodplace) {
        reject('Error: Cannot update the foodplace...');
      } else {
        resolve(updatedFoodplace);
      }
    });
  });
}

function addLatestCommentTo(dishes) {
  dishes.forEach(dish => {
    let latestComment = dish.comments[dish.comments.length - 1];
    dish.latestCommentAt = latestComment ? latestComment.createdAt : '';
  });
  return dishes;
}

function assembleDish(req) {
  if (!req) throw new Error('Cannot assemble a dish. Request is null.');

  try {
    let image = req.body.dish ? req.body.dish.image : req.body.image;
    image = !image ? defaultImageUrl : image;

    /*  let description = req.body.dish
      ? req.body.dish.description
      : req.body.description;
    description = description.substring(0, allowedDescriptionLength); */

    const author = {
      id: req.user.id,
      username: req.user.username
    };

    let dish = {
      foodplace: req.body.dish ? req.body.dish.foodplace : req.body.foodplaceId,
      name: req.body.dish ? req.body.dish.name : req.body.name,
      price: req.body.dish ? req.body.dish.price : req.body.price,
      image: image,
      imageId: req.body.dish ? req.body.dish.imageId : req.body.imageId,
      /*   description: description, */

      author: author
    };

    return dish;
  } catch (err) {
    throw new Error(`Error assembling the dish. ${err.message}`);
  }
}

function assembleComment(req) {
  if (!req) throw new Error('Cannot assemble a comment. Request is null.');

  const allowedCommentLength = 2000;
  let text = req.body.dish ? req.body.dish.description : req.body.description;
  text = text.substring(0, allowedCommentLength);

  const author = {
    id: req.user.id,
    username: req.user.username
  };

  let comment = {
    text: text,
    author: author
  };

  return comment;
}

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}

module.exports = {
  getDishes,
  getNewDish,
  postDish,
  showDish,
  editDish,
  putDish,
  deleteDish
};
