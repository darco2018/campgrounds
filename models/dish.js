const mongoose = require('mongoose');

const dishSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  price: String,
  image: String,
  description: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
  author: {
    // includes all info about author
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String
  },
  foodplace: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Foodplace'
  },
  // includes only id - use this
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ]
});

console.log('Compiling Dish schema');

module.exports = mongoose.model('Dish', dishSchema);
