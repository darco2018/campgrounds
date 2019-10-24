const mongoose = require('mongoose');

const foodplaceSchema = new mongoose.Schema({
  name: String,
  address: String,
  city: String,
  lat: Number,
  lng: Number,
  formattedAddress: String,
  description: String,
  image: String,
  author: {
    id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    username: String
  },
  dishesCount: { type: Number, default: 0 }
});

const foodplaceModel = mongoose.model('Foodplace', foodplaceSchema);

module.exports = {
  foodplaceSchema,
  foodplaceModel
};
