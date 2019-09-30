const mongoose = require('mongoose');
const comment = require('./comment');

const campgroundSchema = new mongoose.Schema({
  name: String,
  image: String,
  description: String,
  comments: [comment.commentSchema],
});

console.log('Compiling Campground schema');

module.exports = mongoose.model('Campground', campgroundSchema);
