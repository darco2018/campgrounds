const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ratingSchema = new Schema(
  {
    score: {
      type: Number,
      required: 'Please provide a rating (1-5 stars)',
      min: 1,
      max: 5,
      validate: {
        validator: Number.isInteger,
        message: '{VALUE} is not an integer value.'
      }
    },
    text: { type: String },
    author: {
      id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
      },
      username: String
    },
    dish: {
      type: Schema.Types.ObjectId,
      ref: 'Dish'
    }
  },
  { timestamps: true } //mongoose adds createdAt, updatedAt fields
);

module.exports = mongoose.model('Rating', ratingSchema);
