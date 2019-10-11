const mongoose = require('mongoose');

const foodplaceSchema = new mongoose.Schema({
  name: String,
  address: String,
  city: String,
  location: String,
  lat: Number,
  lng: Number,
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String
  }
});

const foodplaceModel = mongoose.model('Foodplace', foodplaceSchema);

module.exports = {
  foodplaceSchema,
  foodplaceModel
};
