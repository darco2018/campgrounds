const mongoose = require('mongoose');
const comment = require('./comment');

const { commentSchema } = comment;

const campgroundSchema = new mongoose.Schema({
  name: String,
  image: String,
  description: String,
  comments: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment',
    },
  ],
  // alternative:
  // const comment = require('./comment');
  // comments: [comment.commentSchema],
});

console.log('Compiling Campground schema');

module.exports = mongoose.model('Campground', campgroundSchema);
