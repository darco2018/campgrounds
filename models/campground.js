const mongoose = require('mongoose');

const campgroundSchema = new mongoose.Schema({
  name: String,
  image: String,
  description: String,
});

console.log('Compiling Campground schema');

module.exports = mongoose.model('Campground', campgroundSchema);
