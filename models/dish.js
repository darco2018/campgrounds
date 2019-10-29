const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const dishSchema = new Schema({
  name: { type: String, required: true, trim: true },
  price: String,
  image: String,
  description: { type: String, trim: true },
  createdAt: { type: Date, default: Date.now },
  author: {
    // includes all info about author
    id: {
      type: Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String
  },
  foodplace: {
    type: Schema.Types.ObjectId,
    ref: 'Foodplace'
  },
  // includes only id - use this
  comments: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Comment'
    }
  ]
});

module.exports = mongoose.model('Dish', dishSchema);
