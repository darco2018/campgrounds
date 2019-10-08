const mongoose = require('mongoose');
const comment = require('./comment');

const { commentSchema } = comment;

const dishSchema = new mongoose.Schema({
  name: String,
  price: String,
  image: String,
  description: String,
  author: {
    // includes all info about author
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String
  },
  foodplace: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Foodplace'
    },
    name: String
  },
  // includes only id - use this
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ]
  // alternative:
  // const comment = require('./comment');
  // comments: [comment.commentSchema],
});

console.log('Compiling Dish schema');

module.exports = mongoose.model('Dish', dishSchema);
